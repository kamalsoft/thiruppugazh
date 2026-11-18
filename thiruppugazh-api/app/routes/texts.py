import json
import logging
from pathlib import Path as FilePath
from fastapi import APIRouter, HTTPException, Path
from typing import List
from pydantic import ValidationError
from app.config import SONGS_DIR, THIRUPPUGAZH_FOLDER
from app.models import TextSummary, TextDetail

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Texts"])

SUMMARY_FIELDS = set(TextSummary.model_fields)


def load_texts(root: FilePath) -> dict[str, TextDetail]:
    """Load songs/<name>/<name>.json for every song folder except Thiruppugazh.

    A bad file is logged and skipped, so it cannot stop the API.
    """
    texts = {}
    for folder in sorted(root.iterdir()):
        if not folder.is_dir() or folder.name == THIRUPPUGAZH_FOLDER:
            continue
        path = folder / f"{folder.name}.json"
        try:
            detail = TextDetail.model_validate(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, ValueError, ValidationError) as exc:
            logger.error("Skipping song %s: %s", folder.name, exc)
            continue
        if detail.id != folder.name:
            logger.error("Skipping song %s: id %r does not match the folder name", folder.name, detail.id)
            continue
        texts[detail.id] = detail
    return texts


TEXTS = load_texts(SONGS_DIR)


@router.get("/texts", response_model=List[TextSummary])
def list_texts():
    """List the songs outside Thiruppugazh (without the verse text)."""
    return [t.model_dump(include=SUMMARY_FIELDS) for t in TEXTS.values()]


@router.get("/texts/{text_id}", response_model=TextDetail)
def get_text(text_id: str = Path(..., pattern=r"^[a-z0-9-]+$", max_length=100)):
    """Return one song with its verses, from its own folder under songs/."""
    text = TEXTS.get(text_id)
    if text is None:
        raise HTTPException(status_code=404, detail="Text not found.")
    return text
