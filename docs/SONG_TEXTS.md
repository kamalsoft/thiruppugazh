# Song texts: where they live

Rule: the API is the source of truth for every song text. It stores and delivers the texts. The UI only renders what the API returns. Do not put verse text in UI code.

## Where things are

- `thiruppugazh-api/songs/<author>/author.json`: the author's id and display name.
- `thiruppugazh-api/songs/<author>/<id>/<id>.json`: one folder per song, under its author. The folder name is the id.
- `GET /api/authors`: authors with song counts.
- `GET /api/texts?author=<id>&page=1&limit=6`: one page of songs (id, name, eyebrow, title, author, author_id, source). No verses.
- `GET /api/texts/<id>`: one text with its verses in `text`.
- `thiruppugazh-ui/app/components/SongTexts.tsx`: the tab. It loads the list and the chosen text from the API.
- `thiruppugazh-ui/app/components/SongTextView.tsx`: Read and Sing views. It renders the text it is given.

## How to add a text

1. Create the folder `thiruppugazh-api/songs/<author>/<id>/` and the file `<id>.json` inside it, with these fields. The author folder must already have an `author.json`:

   ```json
   {
     "id": "kandar-anubhuti",
     "name": "கந்தர் அனுபூதி",
     "eyebrow": "அருணகிரிநாதர்",
     "title": "Full title as printed in the source",
     "author": "Author as credited",
     "source": "Source as credited",
     "text": "Verses. Blank lines separate stanzas. An indented line (4+ spaces) is a section heading. A verse ends with ...... (N)."
   }
   ```

   - `id` must match `^[a-z0-9-]+$` and be the folder name. It must be unique across all authors.
   - In `text`, a verse ends with three or more dots, a bracketed number, and nothing after it, for example `...... (5)`.
   - A file that fails validation, or whose `id` does not match its folder name, is logged and skipped. The other songs still load. Check the API log after you add a file.
   - The `thirupugazh` folder under `arunagirinathar/` is reserved for the Thiruppugazh songs and is never listed here.
2. Run the API tests: `cd thiruppugazh-api && uv run pytest -q`.
3. Start the API and check `GET /api/texts/<id>`.
4. The UI needs no change. The new text appears in the tab.

## Notes

- Keep the source credit. Use only texts that are open for this use.
- The UI does not link to external sites. Credits are shown as plain text.
