# Thiruppugazh App — Roadmap

Goal: a reliable, searchable reader for all Thiruppugazh songs. Items map to `docs/BACKLOG.md` IDs. Dates are targets, not commitments.

## Phase 0 — Restore (now, target 2026-11-30)

Goal: the app works end to end on the live site.

- BUG-2: generate `data/songs_index.json` and `data/places.json` from `songs/` with a script. Commit the script and output.
- BUG-3: find the cause of the 500 errors (Vercel function logs), fix, and redeploy.
- BUG-1: align the random-song path between UI and API.
- BUG-5: one documented entrypoint.
- DEBT-5: remove tracked `.DS_Store`.

Exit: every endpoint in `docs/APP_DOCUMENTATION.md` §4 returns 200 on the live URL.

## Phase 1 — Correct the contract (target 2026-12-31)

Goal: the UI uses what the API really provides.

- BUG-4: implement or remove `category`, `language`, `composer`, `number`.
- FEAT-1: song-number search.
- FEAT-2: raga and thala filter dropdowns.
- BUG-6, BUG-7: header merge and path-check fixes.
- Add a contract check to CI (see skill `api-contract-check`).

Exit: every UI call matches an API route and every param is handled.

## Phase 2 — Quality (target 2027-01-31)

Goal: changes are safe to make.

- DEBT-1: API tests for all endpoints; UI smoke test for the five tabs.
- DEBT-3: ESLint config; `npm run lint` passes.
- BUG-8: user-visible error and retry states.
- DEBT-9: caching headers for static endpoints.
- DEBT-2: rewrite both READMEs to match the code.

Exit: CI runs tests and lint on every PR.

## Phase 3 — Reader features (target 2027-03-31)

- FEAT-8: previous and next song navigation.
- FEAT-3: favorites in local storage (per device first).
- FEAT-9: real place coordinates for the map.

## Phase 4 — Later (no date)

- FEAT-4 offline reading (service worker with cached songs).
- FEAT-5 transliteration.
- FEAT-6 audio playback (needs audio sources and licensing check first).
- FEAT-7 UI multilingual.
- DEBT-6 framework upgrade (Next.js, React) once tests exist.

## Decisions needed from the owner

1. Which host is the source of truth for the API: Vercel only, or also local/Docker?
2. Is the song data licensed for public redistribution (affects FEAT-6 and offline mode)?
3. Keep the legacy Flask `app.py`, or delete it (DEBT-4)?
