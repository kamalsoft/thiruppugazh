import os
import json
from typing import List, Dict, Optional
from app.config import INDEX_FILE, PLACES_FILE, SONGS_DIR

class SongDatabase:
    def __init__(self):
        self.songs_index: List[Dict] = []
        self.places_index: List[Dict] = []
        self._songs_cache: Dict[int, Dict] = {}
        self.load_indexes()

    def load_indexes(self):
        if os.path.exists(INDEX_FILE):
            with open(INDEX_FILE, 'r', encoding='utf-8') as f:
                self.songs_index = json.load(f)

        if os.path.exists(PLACES_FILE):
            with open(PLACES_FILE, 'r', encoding='utf-8') as f:
                self.places_index = json.load(f)

    def _normalize_song(self, song: Dict) -> Dict:
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

        # normalize list -> string
        if isinstance(chandam, list):
            chandam = "\n".join(str(x) for x in chandam)
        elif chandam is None:
            chandam = ""
        else:
            chandam = str(chandam)

        if isinstance(lyrics, list):
            lyrics = "\n".join(str(x) for x in lyrics)
        elif lyrics is None:
            lyrics = ""
        else:
            lyrics = str(lyrics)

        song["chandam"] = chandam
        song["lyrics"] = lyrics
        song["full_text"] = lyrics
        if "chandam_structure" not in song:
            song["chandam_structure"] = chandam
        return song

    def get_song_by_number(self, song_number: int):
        if song_number in self._songs_cache:
            return self._songs_cache[song_number]

        index_item = next(
            (s for s in self.songs_index if int(s.get("song_number", -1)) == int(song_number)),
            None
        )
        if not index_item:
            return None

        # Build file path from index if available, else fallback
        rel_path = index_item.get("file_path", f"songs/song_{song_number}.json")
        file_path = rel_path if os.path.isabs(rel_path) else os.path.join(os.getcwd(), rel_path)
        if not os.path.exists(file_path):
            file_path = os.path.join(SONGS_DIR, f"song_{song_number}.json")

        # Start with index metadata
        song: Dict = dict(index_item)

        # Merge full song file content when present
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                file_data = json.load(f)
            song.update(file_data)

        song = self._normalize_song(song)
        self._songs_cache[song_number] = song
        return song

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
                    item.get("chandam", "")
                    or item.get("chandam_structure", "")
                ).lower()
                if chandam.lower() not in item_chandam:
                    continue

            if query:
                song_detail = self.get_song_by_number(int(item["song_number"]))
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
