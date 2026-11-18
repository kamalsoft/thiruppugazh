# Thiruppugazh: working rules for Claude

## Code review after every code change

Whenever you implement, update, upsert, upgrade or otherwise change code (`.py`, `.ts`, `.tsx`, `.js`, `.css`, `.sh`, config or test files), invoke the `code-reviewer` agent before you report the work as done.

- Each invocation runs two passes and returns both results. Show both results to the user, including the verdict and any findings.
- If the verdict is CHANGES REQUESTED, fix the confirmed Blocker and High findings, then invoke `code-reviewer` again. Stop after two invocations and report any remaining findings to the user.
- Do not skip the review because a change looks small. Documentation-only changes do not need it.
- The reviewer is read-only. It reports and never edits files, so the fixes are yours to make.
