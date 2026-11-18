from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SONGS_DIR = BASE_DIR / "songs"

# Thiruppugazh songs. Other songs live in their own folder under songs/, named after the song.
THIRUPPUGAZH_FOLDER = "thirupugazh"
THIRUPPUGAZH_DIR = SONGS_DIR / THIRUPPUGAZH_FOLDER

INDEX_FILE = THIRUPPUGAZH_DIR / "index.json"
PLACES_FILE = THIRUPPUGAZH_DIR / "place_mappings.json"
