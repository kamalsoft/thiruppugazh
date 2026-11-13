# Thiruppugazh App — Documentation

Scanned from code on 2026-11-12. Covers the two projects in this repo:

- `thiruppugazh-ui/` — Next.js 13 frontend (the website).
- `thiruppugazh-api/` — Python API (FastAPI on Vercel; a legacy Flask file also exists).

## 1. What the app does

Browse, search and read Thiruppugazh songs (Tamil devotional hymns by Arunagirinathar). Features:

| Tab | Component(s) | What it shows |
|---|---|---|
| Overview | `HeroBanner` | Landing hero |
| Arunagirinathar | `ArupadaiVeedu` | The six abodes (Arupadai Veedu) of Murugan |
| Thiruppugazh | `SongsSearch`, `SongCard`, `SongModal` | Paginated song list (12/page), search, filters, song detail modal |
| Places | `PlacesDirectory` | Temples/places with their song numbers |
| Map | `PlacesMap` | OpenStreetMap embed plus Google Maps links |

Global UI: sidebar navigation (`Sidebar`), header with sidebar toggle and font-size control (14–22 px, `Header`), "home" reset (`handleGoHome` in `app/page.tsx`).

## 2. Architecture

```
Browser ──> Next.js UI (app/page.tsx, client-side fetch)
                │  lib/api.ts  →  API_CONFIG.BASE_URL
                ▼
        https://thiruppugazh-api.vercel.app/api
                │  Vercel (root vercel.json → thiruppugazh-api/app/main.py, @vercel/python)
                ▼
        FastAPI app (app/main.py) → routes/songs.py → loader.py (in-memory db)
                │
                ▼
        songs/song_<N>.json (1328 files), songs/place_mappings.json
        data/songs_index.json, data/places.json  ← expected by loader, NOT in repo
```

No database, no auth, no server-side rendering of song data. The page is a single client component (`'use client'`).

## 3. Frontend (`thiruppugazh-ui/`)

- **Stack:** Next.js 13.4.12 (App Router), React 18.2, Tailwind CSS 3.3, lucide-react. TypeScript path alias `@/`.
- **Routes:** only `/` (`app/page.tsx`). `app/layout.tsx` sets `lang="ta"` and metadata.
- **Config:** `lib/config.ts` — `BASE_URL`, `DEFAULT_LIMIT: 12`. No env vars are read by the UI.
- **Data access:** `lib/api.ts`
  - `fetchSongs(params)` → `GET /songs` (sends q, place, raga, thala, chandam, category, language, composer, number, page, limit)
  - `fetchSongDetail(n)` → `GET /songs/{n}`
  - `fetchRandomSong()` → `GET /songs/random` (**mismatch, see backlog BUG-1**)
  - `fetchPlaces()` → `GET /places`, `fetchRagas()` → `GET /ragas`, `fetchThalas()` → `GET /thalas`
- **Types:** `lib/types.ts` — `SongSummary`, `SongDetail`, `PaginatedResponse`, `PlaceMapping`.
- **Search debounce:** 300 ms when a query is typed, 0 ms otherwise (`app/page.tsx`).
- **Dead code:** `lib/songSearch.ts` (`filterSongs`, `Song`) is not imported anywhere.
- **Images:** one remote image URL in `app/constants/images.ts` (gstatic). `public/images/lord-murugan-abodes.jpg` is local.
- **Scripts:** `dev`, `build`, `start`, `lint`. No test script exists.

## 4. Backend (`thiruppugazh-api/`)

- **Stack:** Python 3.9+ (3.14 venv present), FastAPI, Pydantic 2, Uvicorn. `requirements.txt` also lists Flask, flasgger, flask-cors (used only by the legacy `app.py`).
- **Entrypoints:**
  - `app/main.py` — the deployed FastAPI app. Root `vercel.json` points here.
  - `app.py` — legacy Flask app that loads `songs/` directly. Not wired to Vercel.
  - `pyproject.toml` declares `thiruppugazh-api.app.main:app` (differs from `vercel.json`).
- **CORS:** `ALLOWED_ORIGINS` env var, comma-separated, default `http://localhost:3000`. Methods: GET only.
- **Error handling:** global handler returns `500 {"detail": "Internal server error"}`.
- **Config:** `app/config.py` — `DATA_DIR`, `SONGS_DIR`, `INDEX_FILE = data/songs_index.json`, `PLACES_FILE = data/places.json`.
- **Loader:** `app/loader.py` — `SongDatabase` reads the two `data/` files at import time, preloads songs, merges per-song JSON files, normalises chandam/lyrics fields, strips `file_path`, caches by song number.

### Endpoints (FastAPI, prefix `/api`)

| Method | Path | Params / notes | Response |
|---|---|---|---|
| GET | `/` | Root (`message`, `docs`) | JSON |
| GET | `/docs` | Swagger UI (auto) | HTML |
| GET | `/api/songs` | `q`, `place`, `raga`, `thala`, `chandam`, `page≥1`, `limit 1–100` (default 20) | `{total, page, limit, results[]}` |
| GET | `/api/random-song` | — | `SongDetail` or 404 |
| GET | `/api/songs/{song_number}` | int | `SongDetail` or 404 |
| GET | `/api/places` | — | `PlaceMapping[]` |
| GET | `/api/ragas` | — | `string[]` |
| GET | `/api/thalas` | — | `string[]` |

Params the UI sends but the API ignores: `category`, `language`, `composer`, `number`.

### Data model

- `SongSummary`: `song_number`, `title`, `category_or_place`, `raga`, `thala`, `chandam_structure`.
- `SongDetail`: summary plus `chandam`, `lyrics`, `full_text`; extra fields allowed.
- `PlaceMapping`: `place`, `total_songs`, `song_numbers[]`.
- Source files: each `songs/song_<N>.json` holds the same keys. `songs/place_mappings.json` holds `PlaceMapping[]`.

## 5. Running locally

```bash
# Frontend
cd thiruppugazh-ui && npm install && npm run dev        # http://localhost:3000

# Backend (needs data/songs_index.json and data/places.json — see backlog BUG-2)
cd thiruppugazh-api && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

The UI calls the **deployed** API, not localhost. To use a local API, change `BASE_URL` in `lib/config.ts`.

## 6. Current status (checked 2026-11-12)

- Live API: `GET` on `/api/songs`, `/api/random-song`, `/api/songs/random`, `/api/places` all return **HTTP 500 `FUNCTION_INVOCATION_FAILED`**. Cause not confirmed; Vercel function logs are needed.
- Local loader: `songs_index` = 0 and `places_index` = 0 because `data/` is absent. The API cannot return any song locally.
- UI: `tsc --noEmit` passes with no errors.
- Tests: none exist in either project.
- Git: `.DS_Store` is tracked at repo root (should be ignored). `thiruppugazh-ui/.claude/` is untracked.

## 7. Known issues

See `docs/BACKLOG.md` for the full list with IDs. Summary of the most serious:

1. The API has no index data, so it cannot serve songs (BUG-2) and the live deployment fails (BUG-3).
2. The random-song endpoint is called with the wrong path (BUG-1).
3. Four UI filters are silently ignored by the API (BUG-4).
4. README files describe a different stack (Vite, `src/`, tests, `.env.example`) than the code uses.
5. `.claude/agents/` in the UI repo contains agents named "SQLLens" for a different project. They do not describe this app.
