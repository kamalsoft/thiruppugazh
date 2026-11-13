# Thiruppugazh App — Backlog

Priority: **P0** blocks the app working · **P1** user-visible gap · **P2** quality/debt · **P3** nice to have.
Status as of 2026-11-12. IDs are stable; reference them in commits and PRs.

## Bugs

| ID | Pri | Item | Evidence | Done when |
|---|---|---|---|---|
| BUG-1 | P0 | UI calls `/songs/random`, API route is `/random-song`. The request hits `/songs/{song_number}` with `"random"` and fails. | `lib/api.ts` vs `app/routes/songs.py:41` | UI and API agree on one path; "random song" returns a song |
| BUG-2 | P0 | `data/songs_index.json` and `data/places.json` are missing from the repo and no script generates them. Loader starts with 0 songs. | `app/config.py`, `app/loader.py`; `ls data` fails | Generator script or committed files; `/api/songs` returns 1328 songs |
| BUG-3 | P0 | Live Vercel API returns 500 on every endpoint. Cause unknown (likely BUG-2 plus deploy config). | `curl` of `thiruppugazh-api.vercel.app/api/*` | Live endpoints return 200 with data |
| BUG-4 | P1 | UI sends `category`, `language`, `composer`, `number`; API ignores them. Song-number search and the filters do nothing. | `lib/api.ts`; `app/routes/songs.py` | Each param is either implemented or removed from the UI |
| BUG-5 | P1 | Two `app` entrypoints and mismatched config: `vercel.json` → `app/main.py`, `pyproject.toml` → `thiruppugazh-api.app.main:app`. | root `vercel.json`, `thiruppugazh-api/pyproject.toml` | One documented entrypoint |
| BUG-6 | P2 | `apiFetch` spreads `...options` after `headers`, so a caller's `headers` replaces the defaults (drops `Content-Type`). | `lib/api.ts` | Headers merged, not replaced |
| BUG-7 | P2 | `_safe_path` uses `str.startswith`, so `/a/base2` passes a check for `/a/base`. | `app/loader.py` `_safe_path` | Use `os.path.commonpath` |
| BUG-8 | P2 | Errors only go to `console.error`; the user sees an empty page with no message. | `app/page.tsx` `.catch` blocks | Visible error and retry state |

## Features and gaps

| ID | Pri | Item |
|---|---|---|
| FEAT-1 | P1 | Working song-number search (after BUG-4 fix). |
| FEAT-2 | P1 | Filter options from the API: populate raga/thala dropdowns from `/ragas` and `/thalas` (endpoints exist, UI use is unverified). |
| FEAT-3 | P2 | Favorites/bookmarks (in README, not built). |
| FEAT-4 | P2 | Offline access for saved songs (in README, optional, not built). |
| FEAT-5 | P2 | Transliteration (in README roadmap, not built). |
| FEAT-6 | P3 | Audio playback (in README roadmap, not built). |
| FEAT-7 | P3 | UI multilingual support (in README roadmap; page is `lang="ta"` only). |
| FEAT-8 | P2 | Song-to-song navigation (prev/next). The API comment mentions "adjacent navigation" but no route exists. |
| FEAT-9 | P3 | Place map with real coordinates instead of one fixed OSM view. |

## Quality and tech debt

| ID | Pri | Item |
|---|---|---|
| DEBT-1 | P0 | No automated tests in either project. Add API tests for every endpoint (`pytest` + `httpx`) and a UI smoke test. |
| DEBT-2 | P1 | README files describe a different stack (Vite, `src/`, `npm test`, `.env.example`). Rewrite both to match the code. |
| DEBT-3 | P1 | No ESLint config in `thiruppugazh-ui/`, so `npm run lint` is not set up. Add config. |
| DEBT-4 | P1 | Dead code: `lib/songSearch.ts`, `create_frontend.py`, `create_structure.py`, legacy `app.py` (Flask). Remove or move to `legacy/`. |
| DEBT-5 | P1 | Tracked `.DS_Store` at repo root. Remove from git and add to `.gitignore`. |
| DEBT-6 | P2 | Dependency drift: Next 13.4.12 and React 18.2 are old. Plan an upgrade and test. |
| DEBT-7 | P2 | Two Python requirement sources: `requirements.txt` (has Flask and flasgger) and `pyproject.toml`. Keep one. |
| DEBT-8 | P2 | `app/routes/songs.py` loads all data in memory at import time. Measure cold-start on Vercel. |
| DEBT-9 | P2 | No rate limiting or caching headers on API responses. Add `Cache-Control` for `/api/places`, `/ragas`, `/thalas` (static data). |
| DEBT-10 | P3 | `.claude/agents/` (in `thiruppugazh-ui`) are "SQLLens" agents for a different project. Replace with agents for this app or remove. |
| DEBT-11 | P3 | `tsconfig.tsbuildinfo` and `.next/` present in the working tree. Confirm they are ignored. |

## Suggested order

1. BUG-2 → BUG-3 → BUG-1 (restore a working API, then fix the call path).
2. BUG-4, BUG-5, DEBT-5 (contract and repo hygiene).
3. DEBT-1 (tests) so later changes are safe.
4. BUG-8, FEAT-1, FEAT-2 (user-visible fixes).
5. DEBT-2, DEBT-3, DEBT-4 (docs and cleanup).
6. Features FEAT-3 onward, by priority.
