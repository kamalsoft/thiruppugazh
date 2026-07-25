import os
import json
import logging
from typing import List, Dict, Optional
from app.config import INDEX_FILE, PLACES_FILE, SONGS_DIR

logger = logging.getLogger(__name__)

class SongDatabase:
    def __init__(self):
        self.songs_index: List[Dict] = []
        self.places_index: List[Dict] = []
        self._songs_cache: Dict[int, Dict] = {}
        self._ragas_cache: Optional[List[str]] = None
        self._thalas_cache: Optional[List[str]] = None
        self.load_indexes()

    def load_indexes(self):
        try:
            if os.path.exists(INDEX_FILE):
                with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                    self.songs_index = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Failed to load songs index: {e}")
            self.songs_index = []

        try:
            if os.path.exists(PLACES_FILE):
                with open(PLACES_FILE, 'r', encoding='utf-8') as f:
                    self.places_index = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Failed to load places index: {e}")
            self.places_index = []

        # Preload all songs into cache for fast full-text search
        self._build_search_index()

    def _build_search_index(self):
        """Preload all songs into memory cache at startup."""
        for item in self.songs_index:
            try:
                num = int(item.get("song_number", -1))
                if num > 0 and num not in self._songs_cache:
                    self.get_song_by_number(num)
            except Exception as e:
                logger.warning(f"Could not preload song {item.get('song_number')}: {e}")

    def _safe_path(self, rel_path: str) -> str:
        """Prevent path traversal attacks."""
        base = os.path.realpath(os.getcwd())
        resolved = os.path.realpath(os.path.join(base, rel_path))
        if not resolved.startswith(base):
            raise ValueError(f"Path traversal detected: {rel_path}")
        return resolved

    def _normalize_song(self, song: Dict) -> Dict:
        song = dict(song)  # avoid mutating original

        chandam = (
            song.get("chandam")
            or song.get("chandam_structure")
            or song.get("chandham")
            or ""
        )
        lyrics = (
            song.get("lyrics")
            or song.get("lyric")
            or song.get("full_text")
            or song.get("verse")
            or song.get("verses")
            or ""
        )

        if isinstance(chandam, list):
            chandam = "\n".join(str(x) for x in chandam)
        else:
            chandam = str(chandam) if chandam else ""

        if isinstance(lyrics, list):
            lyrics = "\n".join(str(x) for x in lyrics)
        else:
            lyrics = str(lyrics) if lyrics else ""

        song["chandam"] = chandam
        song["lyrics"] = lyrics
        song["full_text"] = lyrics
        song.pop("file_path", None)  # strip filesystem path before returning
        if "chandam_structure" not in song:
            song["chandam_structure"] = chandam
        return song

    def get_song_by_number(self, song_number: int):
        if song_number in self._songs_cache:
            return self._songs_cache[song_number]

        index_item = next(
            (s for s in self.songs_index if int(s.get("song_number", -1)) == song_number),
            None
        )
        if not index_item:
            return None

        song: Dict = dict(index_item)

        try:
            rel_path = index_item.get("file_path", f"songs/song_{song_number}.json")
            file_path = self._safe_path(rel_path)
            if not os.path.exists(file_path):
                file_path = os.path.join(str(SONGS_DIR), f"song_{song_number}.json")

            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    file_data = json.load(f)
                song.update(file_data)
        except (ValueError, IOError, json.JSONDecodeError) as e:
            logger.warning(f"Could not load song file for {song_number}: {e}")

        song = self._normalize_song(song)
        self._songs_cache[song_number] = song
        return song

    def get_ragas(self) -> List[str]:
        if self._ragas_cache is None:
            self._ragas_cache = sorted({
                song.get("raga", "") for song in self.songs_index if song.get("raga")
            })
        return self._ragas_cache

    def get_thalas(self) -> List[str]:
        if self._thalas_cache is None:
            self._thalas_cache = sorted({
                song.get("thala", "") for song in self.songs_index if song.get("thala")
            })
        return self._thalas_cache

    def search_songs(
        self,
        query: Optional[str] = None,
        place: Optional[str] = None,
        raga: Optional[str] = None,
        thala: Optional[str] = None,
        chandam: Optional[str] = None
    ) -> List[Dict]:
        results = []

        for item in self.songs_index:
            if place and place.lower() not in item.get("category_or_place", "").lower():
                continue
            if raga and raga.lower() not in item.get("raga", "").lower():
                continue
            if thala and thala.lower() not in item.get("thala", "").lower():
                continue

            if chandam:
                item_chandam = (
                    item.get("chandam", "") or item.get("chandam_structure", "")
                ).lower()
                if chandam.lower() not in item_chandam:
                    continue

            if query:
                song_detail = self._songs_cache.get(int(item["song_number"]))
                if not song_detail:
                    continue
                search_target = " ".join([
                    str(song_detail.get("title", "")),
                    str(song_detail.get("category_or_place", "")),
                    str(song_detail.get("lyrics", "")),
                    str(song_detail.get("chandam", "")),
                ]).lower()
                if query.lower() not in search_target:
                    continue

            results.append(item)

        return results

db = SongDatabase()
