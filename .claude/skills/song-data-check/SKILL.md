---
name: song-data-check
description: Validates the Thiruppugazh song JSON files and the data/ index files the API loader needs. Use when songs/ or data/ changes or the API returns empty results.
---
# Song Data Check

Run from `thiruppugazh-api/`. Use the venv Python if present.

1. Count files: `ls songs/song_*.json | wc -l` (expected 1328 at last scan).
2. Parse each `songs/song_*.json` with `json.load`. Report any file that fails to parse, by name.
3. Check each file has `song_number`, `title`, `raga`, `thala`. Report duplicates in `song_number`.
4. Check `songs/place_mappings.json` entries have `place`, `total_songs`, `song_numbers`. Check `total_songs == len(song_numbers)`.
5. Check `data/songs_index.json` and `data/places.json` exist. If missing, say so: the loader then serves 0 songs (BUG-2).
6. If `data/` exists, compare its song numbers with `songs/` and report the difference.
7. Print a short summary: counts, errors, and the first 10 problems. Make no file changes.
