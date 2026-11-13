from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SONGS_DIR = BASE_DIR / "songs"

INDEX_FILE = SONGS_DIR / "index.json"
PLACES_FILE = SONGS_DIR / "place_mappings.json"
