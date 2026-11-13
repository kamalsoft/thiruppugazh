# Thiruppugazh API

FastAPI service that serves the Thiruppugazh songs, places, ragas and thalas from the JSON files in `songs/`.

## Prerequisites

- Python 3.9 or later (the local `.venv` uses 3.14)

## Setup

```bash
cd thiruppugazh-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs are at `/docs`.

Set `ALLOWED_ORIGINS` (comma-separated, default `http://localhost:3000`) to allow other browser origins.

## Endpoints

All routes are under `/api`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/songs` | Search and filter. Params: `q`, `place`, `raga`, `thala`, `chandam`, `number`, `page`, `limit` (max 100) |
| GET | `/songs/{song_number}` | One song with lyrics |
| GET | `/random-song` | A random song |
| GET | `/places` | Places with song counts and song numbers |
| GET | `/ragas` | Distinct ragas |
| GET | `/thalas` | Distinct thalas |

## Data

- `songs/index.json`: one summary entry per song (1326 songs).
- `songs/place_mappings.json`: place to song-number list (209 places).
- `songs/song_<n>.json`: full lyrics and chandam for each song.

The loader reads these at import time (`app/loader.py`). Paths are set in `app/config.py`.

## Deployment (Vercel)

- The API deploys from the repo root with `vercel.json`, which runs `thiruppugazh-api/app/main.py`.
- Set `ALLOWED_ORIGINS` on the Vercel project to every UI origin, comma-separated, for example `http://localhost:3000,https://thiruppugazh-ui.vercel.app`. Browsers block the UI without it.
- Redeploy after changing environment variables; they only apply to new deployments.

## Tests

```bash
pip install pytest httpx
pytest
```

