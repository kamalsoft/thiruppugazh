# Thiruppugazh App — Backlog

Priority: **P0** blocks the app working · **P1** user-visible gap · **P2** quality/debt · **P3** nice to have.
Status as of 2026-11-12. IDs are stable; reference them in commits and PRs.

## Build status (2026-11-12, uncommitted)

- **Done (verified locally):** BUG-1, BUG-2, BUG-4 (`number` implemented; `category`/`language`/`composer` removed from UI), BUG-6, BUG-7, BUG-8, FEAT-1, FEAT-2, DEBT-1 (API: 11 pytest tests; UI: lint + tsc + build only), DEBT-2, DEBT-3, DEBT-5, DEBT-4 (`lib/songSearch.ts` removed; the rest waits on the `app.py` decision).
- **Blocked on you:**
  - BUG-3: the Vercel CLI token is invalid, so logs can't be read. Run `vercel login`, then say so and I'll read the logs and redeploy (deploys need your approval).
  - BUG-5: needs the deploy check, after BUG-3.
  - DEBT-4 `app.py`: keep or delete (see `docs/ROADMAP.md`, decision 3).
- **Not started:** DEBT-1 UI test suite, DEBT-6, DEBT-7, DEBT-8, DEBT-9, FEAT-3 to FEAT-9, DATA-1 below.
- **New:** DATA-1 (P1), below.

## Bugs

| ID | Pri | Item | Evidence | Done when |
|---|---|---|---|---|
| BUG-1 | P0 | UI calls `/songs/random`, API route is `/random-song`. The request hits `/songs/{song_number}` with `"random"` and fails. No component calls `fetchRandomSong` yet, so no user sees this today; fix before wiring a random-song feature. | `lib/api.ts` vs `app/routes/songs.py:41` | UI and API agree on one path; "random song" returns a song |
| BUG-2 | P0 | `data/songs_index.json` and `data/places.json` are missing from the repo and no script generates them. Loader starts with 0 songs. | `app/config.py`, `app/loader.py`; `ls data` fails | Generator script or committed files; `/api/songs` returns 1328 songs |
| BUG-3 | P0 | Live Vercel API returns 500 on every endpoint. Cause unknown (likely BUG-2 plus deploy config). | `curl` of `thiruppugazh-api.vercel.app/api/*` | Live endpoints return 200 with data |
| BUG-4 | P1 | UI sends `category`, `language`, `composer`, `number`; API ignores them. Song-number search and the filters do nothing. | `lib/api.ts`; `app/routes/songs.py` | Each param is either implemented or removed from the UI |
| BUG-5 | P1 | Two `app` entrypoints and mismatched config: `vercel.json` → `app/main.py`, `pyproject.toml` → `thiruppugazh-api.app.main:app`. | root `vercel.json`, `thiruppugazh-api/pyproject.toml` | One documented entrypoint |
| BUG-6 | P2 | `apiFetch` spreads `...options` after `headers`, so a caller's `headers` replaces the defaults (drops `Content-Type`). | `lib/api.ts` | Headers merged, not replaced |
| BUG-7 | P2 | `_safe_path` uses `str.startswith`, so `/a/base2` passes a check for `/a/base`. | `app/loader.py` `_safe_path` | Use `os.path.commonpath` |
| BUG-9 | P1 | Arupadai Veedu buttons used names the data does not have (`பழனி`, `சுவாமிமலை`, `பழமுதிர்ச்சோலை`, `திருத்தணி`), so 3 of 6 returned no songs. Names now match `songs/index.json`. Component was unused; now on the Saint page. Done. |
| BUG-10 | P0 | CORS. The UI no longer sends `Content-Type` on GET (fixed in `lib/api.ts`), so requests are simple and need no preflight. Still open: the API allows only `localhost:3000` by default. Set `ALLOWED_ORIGINS` on Vercel to the UI origin (needs Vercel access; the CLI token is invalid). | Live `OPTIONS` from the UI origin returns 200; `qa` live mode passes |
| BUG-11 | P1 | Done. Place filter is now an exact, case-insensitive match (`app/loader.py`). `place=பொது` returns 4. The `xfail` in `tests/test_api.py` is now a normal test. |
| BUG-12 | P3 | Done. Sidebar shows an unfiltered song total loaded once, or nothing when unknown (`app/page.tsx`, `Sidebar.tsx`). |
| BUG-14 | P1 | Done. Hotlinked Google thumbnail replaced with the local `public/images/lord-murugan-abodes.jpg` (Murugan illustration, not a gopuram). A gopuram SVG would be a better icon if you want one. `qa` test "no broken static assets" guards it. |
| BUG-8 | P2 | Errors only go to `console.error`; the user sees an empty page with no message. | `app/page.tsx` `.catch` blocks | Visible error and retry state |

## Features and gaps

| ID | Pri | Item |
|---|---|---|
| FEAT-1 | P1 | Working song-number search (after BUG-4 fix). |
| FEAT-2 | P1 | Filter options from the API: populate raga/thala dropdowns from `/ragas` and `/thalas`. Endpoints work and `fetchRagas`/`fetchThalas` exist in `lib/api.ts`, but no component calls them yet. |
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
| DATA-1 | P1 | Done in the API. `app/loader.py` collapses whitespace, drops punctuation-only values, removes thala text from raga values, and de-duplicates. `/ragas` 172 values, `/thalas` 95. Source `songs/index.json` still holds the dirty values. |
| DATA-2 | P2 | Corrupted place names: 9 entries in `songs/place_mappings.json` (36 index rows). `¡` probably stands for `ூ` (e.g. `வயலு¡ர்` → `வயலூர்`, `திருநல்லு¡ர்` → `திருநல்லூர்`); `§` is unknown. The API hides the two `§` names only. Needs confirming and fixing in the source files. |

## UX (from reference sites: thirupugazh.net, kaumaram.com)

Source: review of thirupugazh.net and kaumaram.com, 2026-11-13. thirupugazh.org could not be read (SSL error).

| ID | Pri | Item | Done when |
|---|---|---|---|
| UX-1 | P1 | "Start here" entry on the overview: one featured song (song 1) that opens with one tap. **Status:** Done. "Start here" block under the overview button opens song 1. | Overview shows the entry; tapping it opens song 1 |
| UX-2 | P1 | Skip-to-content link, and a `main` landmark for the content. **Status:** Done. Skip link is the first tab stop and jumps to `#main`. | Tab first focuses "Skip to content"; Enter jumps to the content |
| UX-3 | P2 | Short note: songs are learned from a teacher, and transliteration is a reading aid only. **Status:** Done. Note in the Musicology tab above the search. | Note shows in the Musicology tab |
| UX-4 | P1 | First line of each song on the search cards (API adds `first_line`). **Status:** Done. API adds `first_line` to each search result (test added); the card shows it. | Each result shows its first lyric line; API test covers it |
| UX-5 | P2 | Save songs on this device (localStorage), with a "saved" list in search. Saves are lost if browser data is cleared. **Status:** Done. Save button in the modal; saved songs listed in search; kept in localStorage. | Save and unsave in the modal; saved songs listed in search and kept after reload |
| UX-6 | P3 | Temple index with song counts. Already built as the Places directory. **Status:** Verified. Places directory already lists places with song counts. | Verified present; no new work |

Guideline (from kaumaram.com, not a task): avoid unfinished labels, jargon, duplicated Tamil and English lists, and decorative clutter.

## Suggested order

1. BUG-2 → BUG-3 → BUG-1 (restore a working API, then fix the call path).
2. BUG-4, BUG-5, DEBT-5 (contract and repo hygiene).
3. DEBT-1 (tests) so later changes are safe.
4. BUG-8, FEAT-1, FEAT-2 (user-visible fixes).
5. DEBT-2, DEBT-3, DEBT-4 (docs and cleanup).
6. Features FEAT-3 onward, by priority.
