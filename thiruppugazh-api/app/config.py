from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SONGS_DIR = BASE_DIR / "songs"

INDEX_FILE = DATA_DIR / "songs_index.json"
PLACES_FILE = DATA_DIR / "places.json"
