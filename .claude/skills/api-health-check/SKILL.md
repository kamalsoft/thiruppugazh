---
name: api-health-check
description: Probes the live Thiruppugazh API endpoints and reports status codes and a short body preview. Use when the site shows no songs or to confirm a deploy works.
---
# API Health Check

Base URL: `https://thiruppugazh-api.vercel.app/api` (from `lib/config.ts`).

1. For each path, run once with a 15 s timeout and capture only the status and the first 120 bytes of the body:
   `/songs?limit=1`, `/random-song`, `/songs/random`, `/songs/4`, `/places`, `/ragas`, `/thalas`
2. Report a table: path → status → one-line body preview.
3. Mark 200 as OK. Mark 500 `FUNCTION_INVOCATION_FAILED` as a deploy or loader failure (see BUG-2, BUG-3). Mark 422 on `/songs/random` as BUG-1.
4. Do not retry in a loop and do not change code. State what the logs would need to show next.
