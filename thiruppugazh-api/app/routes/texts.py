import json
import logging
from pathlib import Path as FilePath
from fastapi import APIRouter, HTTPException, Path, Query
from typing import List, Optional
from pydantic import ValidationError
from app.config import SONGS_DIR, THIRUPPUGAZH_FOLDER
from app.models import AuthorSummary, TextPage, TextSummary, TextDetail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Texts"])

SUMMARY_FIELDS = set(TextSummary.model_fields)


def load_authors(root: FilePath) -> dict[str, dict]:
    """Read songs/<author>/author.json. An author without that file is logged and skipped."""
    authors = {}
    for folder in sorted(root.iterdir()):
        if not folder.is_dir():
            continue
        try:
            data = json.loads((folder / "author.json").read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            logger.error("Skipping author %s: %s", folder.name, exc)
            continue
        authors[folder.name] = data
    return authors


def load_texts(root: FilePath, authors: dict[str, dict]) -> dict[str, TextDetail]:
    """Load songs/<author>/<song>/<song>.json, except Thiruppugazh, which has its own tab.

    A bad file is logged and skipped, so it cannot stop the API.
    """
    texts = {}
    for author_dir in sorted(root.iterdir()):
        if author_dir.name not in authors:
            continue
        for folder in sorted(author_dir.iterdir()):
            if not folder.is_dir() or folder.name == THIRUPPUGAZH_FOLDER:
                continue
            path = folder / f"{folder.name}.json"
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                data["author_id"] = author_dir.name
                detail = TextDetail.model_validate(data)
            except (OSError, ValueError, ValidationError) as exc:
                logger.error("Skipping song %s: %s", folder.name, exc)
                continue
            if detail.id != folder.name:
                logger.error("Skipping song %s: id %r does not match the folder name", folder.name, detail.id)
                continue
            if detail.id in texts:
                logger.error("Skipping song %s: id is already used", folder.name)
                continue
            texts[detail.id] = detail
    return texts


AUTHORS = load_authors(SONGS_DIR)
TEXTS = load_texts(SONGS_DIR, AUTHORS)


@router.get("/authors", response_model=List[AuthorSummary])
def list_authors():
    """List the authors who have songs outside Thiruppugazh, with a song count."""
    counts = {}
    for t in TEXTS.values():
        counts[t.author_id] = counts.get(t.author_id, 0) + 1
    return [
        {"id": author_id, "name": AUTHORS[author_id]["name"], "count": count}
        for author_id, count in sorted(counts.items())
    ]


@router.get("/texts", response_model=TextPage)
def list_texts(
    author: Optional[str] = Query(None, pattern=r"^[a-z0-9-]+$", max_length=100, description="Author id"),
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=1, le=50),
):
    """List songs (without verses), optionally for one author, one page at a time."""
    items = sorted(
        (t for t in TEXTS.values() if author is None or t.author_id == author),
        key=lambda t: t.id,
    )
    start = (page - 1) * limit
    return {
        "total": len(items),
        "page": page,
        "limit": limit,
        "results": [t.model_dump(include=SUMMARY_FIELDS) for t in items[start:start + limit]],
    }


@router.get("/texts/{text_id}", response_model=TextDetail)
def get_text(text_id: str = Path(..., pattern=r"^[a-z0-9-]+$", max_length=100)):
    """Return one song with its verses, from its own folder under songs/<author>/."""
    text = TEXTS.get(text_id)
    if text is None:
        raise HTTPException(status_code=404, detail="Text not found.")
    return text
