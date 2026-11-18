from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SONGS_DIR = BASE_DIR / "songs"

# songs/<author>/<song>/ holds each song. Thiruppugazh is one folder under its author.
THIRUPPUGAZH_FOLDER = "thirupugazh"
THIRUPPUGAZH_DIR = SONGS_DIR / "arunagirinathar" / THIRUPPUGAZH_FOLDER

INDEX_FILE = THIRUPPUGAZH_DIR / "index.json"
PLACES_FILE = THIRUPPUGAZH_DIR / "place_mappings.json"
