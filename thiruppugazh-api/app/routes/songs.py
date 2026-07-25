import random
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.models import SongSummary, SongDetail, PlaceMapping, PaginatedSongResponse
from app.loader import db

router = APIRouter(prefix="/api", tags=["Songs"])

# -------------------------------------------------------------------
# 1. Song Listing & Advanced Search
# -------------------------------------------------------------------
@router.get("/songs", response_model=PaginatedSongResponse)
def get_songs(
    q: Optional[str] = Query(None, max_length=200, description="Search term for lyrics, title, or place"),
    place: Optional[str] = Query(None, max_length=100, description="Filter by place or category"),
    raga: Optional[str] = Query(None, max_length=100, description="Filter by raga"),
    thala: Optional[str] = Query(None, max_length=100, description="Filter by thala"),
    chandam: Optional[str] = Query(None, max_length=200, description="Filter by chandam pattern"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Search and filter songs across multiple fields with pagination support.
    """
    all_matched = db.search_songs(query=q, place=place, raga=raga, thala=thala, chandam=chandam)
    
    total = len(all_matched)
    start = (page - 1) * limit
    paginated_results = all_matched[start:start + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "results": paginated_results
    }

# -------------------------------------------------------------------
# 2. Song Navigation & Random Utilities
# -------------------------------------------------------------------
@router.get("/random-song", response_model=SongDetail)
def get_random_song():
    """
    Retrieve a random Thiruppugazh song for daily reading or discovery.
    """
    if not db.songs_index:
        raise HTTPException(status_code=404, detail="No songs available in database.")
    random_entry = random.choice(db.songs_index)
    song_detail = db.get_song_by_number(random_entry["song_number"])
    if not song_detail:
        raise HTTPException(status_code=404, detail="Song details not found.")
    return song_detail

# -------------------------------------------------------------------
# 3. Individual Song Detail & Adjacent Navigation
# -------------------------------------------------------------------
@router.get("/songs/{song_number}", response_model=SongDetail)
def get_song_detail(song_number: int):
    """
    Fetch complete lyrics and metadata for a specific song number.
    """
    song = db.get_song_by_number(song_number)
    if not song:
        raise HTTPException(status_code=404, detail=f"Song number {song_number} not found.")
    return song

# -------------------------------------------------------------------
# 4. Metadata List Endpoints (Places, Ragas, Thalas)
# -------------------------------------------------------------------
@router.get("/places", response_model=List[PlaceMapping])
def get_places():
    """
    Get all unique places/temples with total song counts and song number lists.
    """
    return list(db.places_index)  # return copy

@router.get("/ragas", response_model=List[str])
def get_ragas():
    """
    Get a list of all distinct ragas present across the dataset.
    """
    ragas = sorted(list({song.get("raga", "") for song in db.songs_index if song.get("raga")}))
    return ragas

@router.get("/thalas", response_model=List[str])
def get_thalas():
    """
    Get a list of all distinct thalas present across the dataset.
    """
    thalas = sorted(list({song.get("thala", "") for song in db.songs_index if song.get("thala")}))
    return thalas