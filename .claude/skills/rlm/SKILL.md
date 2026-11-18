---
name: rlm
description: Process massive files, logs, or repositories using Recursive Language Model (RLM) decomposition and parallel subagents.
---

# Recursive Language Model (RLM) Execution Protocol

When invoked on a large input or broad codebase audit, DO NOT read all files into your main context window. Treat the filesystem as your external REPL variable store:

1. **Inspect Metadata:** Check file sizes (`wc -l`), directory trees, or counts first.
2. **Partition:** Create a workspace in `/tmp/rlm-work-<timestamp>/chunks/`. Use `split`, `awk`, or Python scripts to break the input into self-contained chunks (e.g., 500–1,000 lines per chunk), wrapping each chunk in a self-contained prompt `.md` file with the specific extraction instructions.
3. **Fan-Out Recursively:** Run `~/.claude/skills/rlm/scripts/rlm-batch <chunks_dir> <out_dir>` to process all chunks concurrently across fresh subagents.
4. **Reduce & Synthesize:** Read the compact `.out.md` results in `<out_dir>`. If the combined outputs are still too large, run a second map-reduce pass before writing your final answer.
5. **Cleanup:** Remove `/tmp/rlm-work-*` once complete.