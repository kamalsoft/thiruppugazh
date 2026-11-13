# QA Report

Date: 2026-11-12 · Scope: UI (Next.js) and API (FastAPI) · Environment: local API on port 8000, production build of the UI on port 3100, Google Chrome.

## How this was tested

- **API:** `thiruppugazh-api/tests/test_api.py` (12 pass, 1 expected failure) plus manual edge-case probes: bad and out-of-range params, unknown routes, lyric search, place counts against `place_mappings.json`, CORS preflight per origin.
- **UI:** `qa/ui-qa.js` (20 browser tests). Live-API calls are routed to the local API, so UI results don't depend on the deployed API. Result: **18 pass, 2 fail**. The two failures reproduce real bugs.
- **Not run:** the UI suite in `live` mode against the deployed API. Live behavior was checked by hand: `/api/*` returns 500 (BUG-3), and browser preflight is blocked (BUG-10).

## Bugs found

| ID | Pri | Area | What happens | Evidence |
|---|---|---|---|---|
| BUG-3 | P0 | Deploy | Live API returns 500 on every endpoint, so the song list is empty on the live site. | `curl` of live `/api/songs`; browser console shows 500s. Logs need `vercel login`. |
| BUG-10 | P0 | CORS | Browsers can't reach the API from any origin except `localhost:3000`. The UI sends `Content-Type` on GET, which forces a preflight. | Preflight from `localhost:3100` and `thiruppugazh-ui.vercel.app` returns 400. |
| BUG-11 | P1 | API / search | Place filter is a substring match. Choosing **பொது (4 songs)** shows **27 pages / 12+ cards** because it also matches `பொதுப்பாடல்கள்`. | UI test `place "பொது" …` fails: "Page 1 of 27". API: `place=பொது` → 318 vs 4 expected. Exact matches agree with the mapping (பழநி 97, பொது 4, பாக்கம் 2). |
| BUG-12 | P3 | UI | Sidebar says **1326 Songs Indexed** even when no songs loaded (hardcoded fallback). | UI test fails with the API down. |
| BUG-14 | P1 | UI / assets | `GopuramIcon` and `images.ts` hotlink a Google Images thumbnail that now returns 404. | Browser network log: 404 on `encrypted-tbn2.gstatic.com/licensed-image`. |
| DATA-2 | P2 | Data | Stray `§` in place names (`§ப்ருர்`, `உ த்தர§ம்ருர்`), shown in the Places directory. | `songs/place_mappings.json`. |

Already fixed earlier in this pass and now covered by tests: BUG-1, BUG-2, BUG-4 (number filter), BUG-6, BUG-7, BUG-8, BUG-9 (abode names).

## Things that were not bugs

- **Font size tests** failed at first because the UI server was serving a stale `.next` build. A `next dev` process (not started by this work) was writing into the same `.next` folder, so JS and CSS returned 500 and React never hydrated. The QA server now runs from an isolated copy, `scratchpad/ui-qa`.
- **Home reset** is only triggered by the header's logo button, not the Overview tab. Working as designed.

## Recommended order

1. BUG-3 and BUG-10: needed before the live site works at all. Set `ALLOWED_ORIGINS` on Vercel, drop `Content-Type` from GET requests, then redeploy.
2. BUG-11: change the place filter to an exact match. The `xfail` test in `test_api.py` turns into a pass, and the UI test passes.
3. BUG-14: replace the hotlinked image with a local asset.
4. BUG-12 and DATA-2: low-impact cleanup.

## Gaps in coverage

- No browser test for the map's "Pin on Map" link target.
- Keyboard-only navigation and screen-reader labels aren't tested.
- No load or performance test. `/api/songs` scans all 1326 songs on each request.
- The UI tests run on the production build, not in `next dev`.
