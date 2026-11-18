#!/usr/bin/env bash
# Tests for rlm-batch and rlm-query. A stub `claude` on PATH stands in for the
# model, so no API calls are made.
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BATCH="$HERE/rlm-batch"
QUERY="$HERE/rlm-query"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$WORK/bin" "$WORK/chunks"
cat > "$WORK/bin/claude" <<'EOF'
#!/usr/bin/env bash
echo "$@" >> "$STUB_LOG"
case "${STUB_MODE:-ok}" in
  ok)    cat ;;
  fail)  echo "boom" >&2; exit 1 ;;
  empty) cat > /dev/null ;;
  slow)  sleep 30 ;;
esac
EOF
chmod +x "$WORK/bin/claude"
export PATH="$WORK/bin:$PATH" STUB_LOG="$WORK/args.log"

# Kill the command after 20 seconds so a hang fails the test instead of blocking it.
bounded() { perl -e 'alarm 20; exec @ARGV' "$@"; }

pass=0
fail=0
check() {  # check <name> <exit status of the assertion>
  if [ "$2" -eq 0 ]; then
    pass=$((pass + 1)); echo "PASS $1"
  else
    fail=$((fail + 1)); echo "FAIL $1"
  fi
}

reset_chunks() {
  echo "MARKER-A" > "$WORK/chunks/a.md"
  echo "MARKER-B" > "$WORK/chunks/b.md"
  rm -rf "$WORK/out" "$WORK/out.md" "$WORK/locks" "$STUB_LOG"
}

# 1. Success: both chunks produce output, and the prompt reaches claude on stdin.
reset_chunks
STUB_MODE=ok bounded "$BATCH" "$WORK/chunks" "$WORK/out" > "$WORK/log" 2>&1
rc=$?
check "batch exits 0 on success" "$rc"
grep -q MARKER-A "$WORK/out/a.out.md" 2>/dev/null
check "prompt is delivered on stdin" $?

# 2. Subagents get read-only tools only.
grep -q -- "--allowedTools Read,Grep,Glob" "$STUB_LOG" 2>/dev/null && ! grep -q Bash "$STUB_LOG"
check "subagent tools exclude Bash" $?

# 3. A failing chunk makes the batch exit non-zero and leaves no output.
reset_chunks
STUB_MODE=fail bounded "$BATCH" "$WORK/chunks" "$WORK/out" > "$WORK/log" 2>&1
rc=$?
[ "$rc" -ne 0 ] && grep -q FAILED "$WORK/log" && [ ! -e "$WORK/out/a.out.md" ]
check "failed chunk fails the batch and writes no output" $?

# 4. Empty output counts as a failure, not a success.
reset_chunks
STUB_MODE=empty bounded "$BATCH" "$WORK/chunks" "$WORK/out" > "$WORK/log" 2>&1
rc=$?
[ "$rc" -ne 0 ] && [ ! -e "$WORK/out/a.out.md" ]
check "empty output is a failure" $?

# 5. A hung subagent is stopped by the timeout.
reset_chunks
start=$SECONDS
STUB_MODE=slow RLM_TIMEOUT=1 bounded "$BATCH" "$WORK/chunks" "$WORK/out" > "$WORK/log" 2>&1
rc=$?
[ "$rc" -ne 0 ] && [ $((SECONDS - start)) -lt 15 ]
check "timeout stops a hung subagent" $?

# 6. A stale slot (owner process has exited) is reclaimed.
reset_chunks
mkdir -p "$WORK/locks/slot_1"
sleep 0 & dead=$!
wait "$dead"
echo "$dead" > "$WORK/locks/slot_1/pid"
echo "MARKER-A" > "$WORK/chunks/a.md"
RLM_LOCK_DIR="$WORK/locks" RLM_MAX_PARALLEL=1 STUB_MODE=ok \
  bounded "$QUERY" "$WORK/chunks/a.md" "$WORK/out.md" > "$WORK/log" 2>&1
check "stale slot is reclaimed" $?

# 7. A live slot is not stolen: the second run waits and gets no slot.
reset_chunks
mkdir -p "$WORK/locks/slot_1"
echo "$$" > "$WORK/locks/slot_1/pid"
RLM_LOCK_DIR="$WORK/locks" RLM_MAX_PARALLEL=1 STUB_MODE=ok \
  bounded "$QUERY" "$WORK/chunks/a.md" "$WORK/out.md" > "$WORK/log" 2>&1
rc=$?
[ "$rc" -ne 0 ] && [ ! -e "$WORK/out.md" ]
check "live slot is not reclaimed" $?

# 8. A killed run (kill -9) does not block the next run.
reset_chunks
RLM_LOCK_DIR="$WORK/locks" RLM_MAX_PARALLEL=1 STUB_MODE=slow RLM_TIMEOUT=60 \
  "$QUERY" "$WORK/chunks/a.md" "$WORK/out1.md" > "$WORK/log" 2>&1 &
qpid=$!
for _ in $(seq 1 20); do [ -f "$WORK/locks/slot_1/pid" ] && break; sleep 0.5; done
held=0
[ -f "$WORK/locks/slot_1/pid" ] && held=1
kill -9 "$qpid" 2>/dev/null
wait "$qpid" 2>/dev/null
RLM_LOCK_DIR="$WORK/locks" RLM_MAX_PARALLEL=1 STUB_MODE=ok \
  bounded "$QUERY" "$WORK/chunks/a.md" "$WORK/out2.md" > "$WORK/log" 2>&1
rc=$?
[ "$held" -eq 1 ] && [ "$rc" -eq 0 ]
check "run after kill -9 gets a slot (first run held the slot)" $?

# 9. The chunk cap refuses oversized batches before launching anything.
reset_chunks
RLM_MAX_RUNS=1 STUB_MODE=ok bounded "$BATCH" "$WORK/chunks" "$WORK/out" > "$WORK/log" 2>&1
rc=$?
[ "$rc" -ne 0 ] && [ ! -e "$WORK/out" ] && grep -q "exceeds RLM_MAX_RUNS" "$WORK/log"
check "RLM_MAX_RUNS cap refuses the batch" $?

echo "---"
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
