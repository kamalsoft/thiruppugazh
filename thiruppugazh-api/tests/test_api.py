import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.loader import db

client = TestClient(app)


def test_index_loads_all_songs():
    assert len(db.songs_index) == 1326
    assert len(db.places_index) == 209


def test_song_detail_has_lyrics():
    r = client.get("/api/songs/1")
    assert r.status_code == 200
    assert r.json()["lyrics"]


def test_missing_song_returns_404():
    assert client.get("/api/songs/99999").status_code == 404


def test_random_song_returns_a_song():
    r = client.get("/api/random-song")
    assert r.status_code == 200
    assert r.json()["song_number"] in {s["song_number"] for s in db.songs_index}


def test_number_filter_returns_exact_song():
    r = client.get("/api/songs", params={"number": 5})
    assert r.status_code == 200
    assert [s["song_number"] for s in r.json()["results"]] == [5]


def test_pagination_total_is_full_count():
    r = client.get("/api/songs", params={"limit": 1})
    assert r.json()["total"] == 1326


def test_metadata_endpoints_respond():
    assert client.get("/api/places").status_code == 200
    assert client.get("/api/ragas").status_code == 200
    assert client.get("/api/thalas").status_code == 200


@pytest.mark.parametrize("url", ["/api/ragas", "/api/thalas"])
def test_filter_lists_are_clean_and_unique(url):
    values = client.get(url).json()
    assert values
    assert all(any(c.isalpha() for c in v) for v in values)
    assert all(v == " ".join(v.split()) for v in values)
    assert len(values) == len(set(values))


def test_raga_list_has_no_thala_text():
    assert not any("தாளம்" in v for v in client.get("/api/ragas").json())


@pytest.mark.parametrize("key,url", [("raga", "/api/ragas"), ("thala", "/api/thalas")])
def test_every_dropdown_value_matches_songs(key, url):
    for value in client.get(url).json():
        r = client.get("/api/songs", params={key: value, "limit": 1})
        assert r.json()["total"] > 0, value


def test_safe_path_allows_song_file():
    assert db._safe_path("songs/song_1.json").endswith("songs/song_1.json")


@pytest.mark.parametrize("rel", ["../thiruppugazh-api2/x", "../../etc/passwd"])
def test_safe_path_blocks_traversal(rel):
    with pytest.raises(ValueError):
        db._safe_path(rel)


def test_place_filter_matches_exact_place():
    r = client.get("/api/songs", params={"place": "பொது", "limit": 1})
    assert r.json()["total"] == 4


def test_place_names_have_no_stray_symbols():
    names = [p["place"] for p in client.get("/api/places").json()]
    assert names and not any("§" in n for n in names)


def test_place_filter_exact_count_for_palani():
    r = client.get("/api/songs", params={"place": "பழநி", "limit": 1})
    assert r.json()["total"] == 97


def test_search_results_include_first_line():
    r = client.get("/api/songs", params={"number": 1})
    first = r.json()["results"][0]
    assert first["first_line"] == "கைத்தல நிறைகனி அப்பமொ டவல்பொரி"


def test_first_line_skips_notation_headers():
    first = client.get("/api/songs", params={"number": 901}).json()["results"][0]["first_line"]
    assert first and "\u0B80" <= first[0] <= "\u0BFF"


def test_search_matches_decomposed_tamil_text():
    import unicodedata
    decomposed = unicodedata.normalize("NFD", "கைத்தல")
    assert client.get("/api/songs", params={"q": decomposed, "limit": 1}).json()["total"] == 12


def _songs(**params):
    """All matching songs, across pages (the API caps each page at 100)."""
    rows, page = [], 1
    while True:
        body = client.get("/api/songs", params={"limit": 100, "page": page, **params}).json()
        rows += body["results"]
        if len(rows) >= body["total"]:
            return rows
        page += 1


def test_sort_by_place_orders_names_and_keeps_empty_last():
    names = [s["category_or_place"] for s in _songs(sort="place", order="asc")]
    filled = [n for n in names if n]
    assert filled == sorted(filled, key=str.lower)


def test_sort_descending_reverses_order():
    asc = [s["raga"] for s in _songs(sort="raga", order="asc") if s["raga"]]
    desc = [s["raga"] for s in _songs(sort="raga", order="desc") if s["raga"]]
    assert desc == list(reversed(asc))


def test_default_sort_is_song_number():
    numbers = [s["song_number"] for s in _songs()]
    assert numbers == sorted(numbers)


def test_invalid_sort_is_rejected():
    assert client.get("/api/songs", params={"sort": "title"}).status_code == 422


@pytest.mark.parametrize("url", ["/api/places", "/api/ragas", "/api/thalas"])
def test_static_lists_are_cacheable(url):
    assert "max-age" in client.get(url).headers["cache-control"]


def test_texts_list_has_summaries_without_verses():
    r = client.get("/api/texts")
    assert r.status_code == 200
    items = r.json()
    assert {"kandha-guru-kavacham", "kandar-anubhuti", "kandar-alankaram"} <= {t["id"] for t in items}
    assert all("text" not in t for t in items)
    assert "thirupugazh" not in {t["id"] for t in items}


def test_text_detail_has_verses():
    r = client.get("/api/texts/kandar-anubhuti")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] and body["text"]


def test_unknown_text_returns_404():
    assert client.get("/api/texts/no-such-text").status_code == 404


def test_malformed_text_id_is_rejected():
    assert client.get("/api/texts/Bad_ID").status_code == 422


def _write_text(folder, name, **fields):
    import json

    base = {"id": name, "name": "n", "eyebrow": "e", "title": "t", "author": "a", "source": "s", "text": "v"}
    base.update(fields)
    (folder / name).mkdir(exist_ok=True)
    (folder / name / f"{name}.json").write_text(json.dumps(base), encoding="utf-8")


def test_bad_text_files_are_skipped_and_good_ones_load(tmp_path):
    from app.routes.texts import load_texts

    _write_text(tmp_path, "good")
    _write_text(tmp_path, "wrong-id", id="other")
    _write_text(tmp_path, "no-author", author=None, **{})
    (tmp_path / "broken").mkdir()
    (tmp_path / "broken" / "broken.json").write_text('{"id": "broken", "name": "x"', encoding="utf-8")
    (tmp_path / "missing").mkdir()
    (tmp_path / "missing" / "missing.json").write_text('{"id": "missing"}', encoding="utf-8")

    loaded = load_texts(tmp_path)

    assert set(loaded) == {"good"}
