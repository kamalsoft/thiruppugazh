# Thiruppugazh App — Backlog

Priority: **P0** blocks the app working · **P1** user-visible gap · **P2** quality/debt · **P3** nice to have.
Status as of 2026-11-12. IDs are stable; reference them in commits and PRs.

## Build status (2026-11-13)

- **Open, needs your decision:** DEBT-4 (delete legacy `app.py`, `create_frontend.py`, `create_structure.py`?), DEBT-7 (requirements: keep `requirements.txt` or `pyproject.toml`?), DATA-2 (confirm the corrected place names before the source files change).
- **Open, needs content or licensing:** FEAT-4 offline reading, FEAT-5 transliteration, FEAT-6 audio, FEAT-7 multilingual UI, FEAT-9 real map coordinates.
- **Open, engineering:** DEBT-1 UI test suite (the API has 28 tests), DEBT-8 cold-start measurement.
- **Partly done:** DATA-1 (API cleans values; source file still has dirty values), BUG-6 (no default headers now), DEBT-6 (React still 18.2).

## Bugs

| ID | Pri | Item | Evidence | Done when |
|---|---|---|---|---|
| BUG-1 | P0 | Done. UI calls `/random-song`; the API route matches. |
| BUG-2 | P0 | Done. Loader reads `songs/index.json` and `songs/place_mappings.json`; 1326 songs load. |
| BUG-3 | P0 | Done. Live API returns 200 after the import-path fix (`9d468b4`). |
| BUG-4 | P1 | Done. `number` filter implemented; unused filters removed from the UI. |
| BUG-5 | P1 | Done. Removed the ignored `[tool.vercel]` block from `pyproject.toml`. The deploy entry is `vercel.json` at the repo root. |
| BUG-6 | P2 | `apiFetch` spreads `...options` after `headers`, so a caller's `headers` replaces the defaults (drops `Content-Type`). | `lib/api.ts` | Headers merged, not replaced |
| BUG-7 | P2 | `_safe_path` uses `str.startswith`, so `/a/base2` passes a check for `/a/base`. | `app/loader.py` `_safe_path` | Use `os.path.commonpath` |
| BUG-9 | P1 | Arupadai Veedu buttons used names the data does not have (`பழனி`, `சுவாமிமலை`, `பழமுதிர்ச்சோலை`, `திருத்தணி`), so 3 of 6 returned no songs. Names now match `songs/index.json`. Component was unused; now on the Saint page. Done. |
| BUG-10 | P0 | Done. UI requests need no preflight; `ALLOWED_ORIGINS` is set on Vercel and documented in `thiruppugazh-api/README.md`. |
| BUG-11 | P1 | Done. Place filter is now an exact, case-insensitive match (`app/loader.py`). `place=பொது` returns 4. The `xfail` in `tests/test_api.py` is now a normal test. |
| BUG-12 | P3 | Done. Sidebar shows an unfiltered song total loaded once, or nothing when unknown (`app/page.tsx`, `Sidebar.tsx`). |
| BUG-14 | P1 | Done. Hotlinked Google thumbnail replaced with the local `public/images/lord-murugan-abodes.jpg` (Murugan illustration, not a gopuram). A gopuram SVG would be a better icon if you want one. `qa` test "no broken static assets" guards it. |
| BUG-8 | P2 | Done. Visible error message with a retry button. |

## Features and gaps

| ID | Pri | Item |
|---|---|---|
| FEAT-1 | P1 | Done. Song-number search works. |
| FEAT-2 | P1 | Done. Raga and thala dropdowns use `/ragas` and `/thalas`. |
| FEAT-3 | P2 | Done (UX-5). Saved songs in this browser; lost if browser data is cleared. |
| FEAT-4 | P2 | Offline access for saved songs (in README, optional, not built). |
| FEAT-5 | P2 | Transliteration (in README roadmap, not built). |
| FEAT-6 | P3 | Audio playback (in README roadmap, not built). |
| FEAT-7 | P3 | UI multilingual support (in README roadmap; page is `lang="ta"` only). |
| FEAT-8 | P2 | Done. Previous and next buttons and arrow keys in the lyrics panel (within the current results page). |
| FEAT-9 | P3 | Place map with real coordinates instead of one fixed OSM view. |

## Quality and tech debt

| ID | Pri | Item |
|---|---|---|
| DEBT-1 | P0 | No automated tests in either project. Add API tests for every endpoint (`pytest` + `httpx`) and a UI smoke test. |
| DEBT-2 | P1 | Done. READMEs rewritten to match the code. |
| DEBT-3 | P1 | Done. ESLint config added; `npm run lint` passes with no errors. |
| DEBT-4 | P1 | Dead code: `lib/songSearch.ts`, `create_frontend.py`, `create_structure.py`, legacy `app.py` (Flask). Remove or move to `legacy/`. |
| DEBT-5 | P1 | Done. `.DS_Store` untracked and ignored. |
| DEBT-6 | P2 | Done for Next.js (14.2.35). React 18.2 is still in use; upgrade needs a test pass. |
| DEBT-7 | P2 | Two Python requirement sources: `requirements.txt` (has Flask and flasgger) and `pyproject.toml`. Keep one. |
| DEBT-8 | P2 | `app/routes/songs.py` loads all data in memory at import time. Measure cold-start on Vercel. |
| DEBT-9 | P2 | Done. `/places`, `/ragas`, `/thalas` send `Cache-Control: public, max-age=86400`; test added. |
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
