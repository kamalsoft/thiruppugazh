---
name: api-contract-check
description: Checks that every UI API call in lib/api.ts matches a FastAPI route and query parameter in thiruppugazh-api. Use after changing either side.
---
# API Contract Check

1. List UI calls: `grep -n "apiFetch\|BASE_URL\|appendIfValue" lib/api.ts` and note each path and query key.
2. List API routes: `grep -n "@router" ../thiruppugazh-api/app/routes/songs.py`, and the `Query(...)` parameter names in each handler.
3. Compare, and report in a table: UI path → API route (match / MISMATCH), UI query key → API param (match / IGNORED).
4. Flag any `{song_number}`-style route that a literal word such as `random` could match.
5. Do not edit code. Report the table and the IDs from `docs/BACKLOG.md` that apply (BUG-1, BUG-4).
