from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class SongSummary(BaseModel):
    song_number: int
    title: Optional[str] = ""
    category_or_place: Optional[str] = ""
    raga: Optional[str] = ""
    thala: Optional[str] = ""
    chandam_structure: Optional[str] = ""

class SongDetail(BaseModel):
    song_number: int
    title: Optional[str] = None
    category_or_place: Optional[str] = None
    raga: Optional[str] = None
    thala: Optional[str] = None
    chandam_structure: Optional[str] = None
    chandam: Optional[str] = None
    lyrics: Optional[str] = None
    full_text: Optional[str] = None

    model_config = ConfigDict(extra="allow")

class PlaceMapping(BaseModel):
    place: str
    total_songs: int
    song_numbers: List[int]

class PaginatedSongResponse(BaseModel):
    total: int
    page: int
    limit: int
    results: List[SongSummary]
