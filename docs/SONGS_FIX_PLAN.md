# Songs not loading: diagnosis and fix plan

Date: 2026-11-13

## Summary

The app works end to end when the API runs locally. The live API fails on every route, so the site shows no songs.

## What was tested

| Layer | Result |
|---|---|
| Local API (`uvicorn app.main:app`) | Works. 1326 songs, 209 places, all endpoints 200. |
| API tests (`pytest`) | 14 pass. |
| UI against local API (browser, 21 tests) | 21 pass. Songs show, filters, pagination, modal, places, error and retry. |
| Clean copy of the function folder, Python 3.14, pinned `requirements.txt` | `app.main` imports in 0.3 s and loads all songs. |
| Live API `https://thiruppugazh-api.vercel.app/*` | HTTP 500, `x-vercel-error: FUNCTION_INVOCATION_FAILED`, on every path including `/`. |

`FUNCTION_INVOCATION_FAILED` on `/` means the Python function fails before routing and before any data is read. The fault is in deployment, not in song data or routes.

## Why we can't see the exact error yet

- The Vercel CLI token is invalid, so `vercel logs` fails.
- The local `.vercel/output` is a July local build. Its `_vendor/` dependency folder is missing, although its config lists 1102 files in it. It may not match what is deployed.

## Likely causes, in order

1. **Wrong or stale deployment bundle.** The deployed code may not match this repo. The local output is incomplete, so a prebuilt deploy from it would crash at import with `No module named fastapi`.
2. **Entrypoint ambiguity.** The Vercel project's root is `thiruppugazh-api`, but `vercel.json` (which only applies from the repo root) points at `thiruppugazh-api/app/main.py`. Vercel's Python detection also finds the legacy `app.py` (a Flask app) in the same folder. The build we have chose `app.main`, but the live project may differ.
3. **Dependency drift.** `requirements.txt` pins FastAPI 0.139.2. The build manifest resolved 0.140.0 from `pyproject.toml`. Two dependency sources are a known problem (DEBT-7).

## Plan

### Step 1: get the real error (you, about 2 minutes)

1. Open the Vercel dashboard, project `thiruppugazh-api`, latest deployment, **Logs** or **Runtime Logs**.
2. Copy the first traceback or error line from around the time of a `/api/songs` request.
3. Note the deployed commit SHA (shown on the deployment page).

Send me those two things. This decides which cause below applies.

### Step 2: fix the cause the logs point to

- **If it's `No module named ...` or an import error:** make one dependency source, `requirements.txt`, and have the build install from it. Pin FastAPI and Pydantic. Remove `pyproject.toml`'s `[tool.vercel]` block, which Vercel doesn't read.
- **If it's an error from `app.py`, or the entrypoint is wrong:** remove the legacy `app.py` (a decision from DEBT-4), or move it to `legacy/`. Set one entrypoint explicitly so Vercel doesn't guess. Decide whether the project root is `thiruppugazh-api` (then drop the repo-root `vercel.json`) or the repo root (then use `vercel.json` only).
- **If it's a path or data error (`songs/` not found):** set `includeFiles` for `songs/**` in the Vercel config. The loader already reads paths relative to the code (`app/config.py`).
- **If it's a timeout or memory error:** load songs lazily instead of all 1326 at import (`app/loader.py`, DEBT-8).

### Step 3: verify before deploying

1. `cd thiruppugazh-api && pytest -q` (all pass).
2. Run the same import check as above from a clean copy of the function folder, with the same `requirements.txt`.
3. Deploy a **preview** first (not production). Check `/`, `/api/songs?limit=1`, `/api/places`, `/api/random-song` return 200.
4. Point the UI at the preview URL with `NEXT_PUBLIC_API_BASE_URL` or by temporarily editing `lib/config.ts` (see the open choice on the dev URL). Check songs load in the browser.

### Step 4: CORS (BUG-10)

Set `ALLOWED_ORIGINS` on the Vercel project to the production UI origin (and any preview origin you use). Without it, browsers block the UI even after the API works.

### Step 5: data and UI follow-ups (not blocking)

- DATA-1: clean raw raga and thala values.
- DATA-2: fix the stray `§` place names (the API currently hides them).

## Decisions I need from you

1. Deployed project root: `thiruppugazh-api` or the repo root?
2. Keep or remove the legacy `app.py` (Flask)?
3. The UI's dev URL is `localhost:5000` in `lib/config.ts`. Keep that for development and use an environment variable for production, or change it back?

## What I did not change

- No code was changed to fix the live 500. The cause isn't known yet, and a guessed fix could hide the real error.
- Nothing was deployed or committed.
