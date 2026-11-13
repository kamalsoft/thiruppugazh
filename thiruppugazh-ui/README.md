# Thiruppugazh UI

Next.js (App Router) frontend for browsing and searching the Thiruppugazh songs. It reads from the live API at `https://thiruppugazh-api.vercel.app/api` (set in `lib/config.ts`).

## Prerequisites

- Node.js 18 or later
- npm

## Setup

```bash
cd thiruppugazh-ui
npm install
```

## Scripts

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint (next/core-web-vitals)
```

There is no UI test suite yet. Type-check with `npx tsc --noEmit`.

## Project Structure

```text
thiruppugazh-ui/
├── app/
│   ├── page.tsx          # main page: state, filters, data loading
│   ├── layout.tsx
│   ├── globals.css
│   ├── components/       # Header, SongsSearch, SongCard, SongModal, Places*, ...
│   └── constants/
├── lib/
│   ├── api.ts            # typed API client (fetchSongs, fetchRandomSong, ...)
│   ├── config.ts         # API base URL and defaults
│   └── types.ts
└── public/images/
```

## Notes

- `lib/api.ts` must call only routes the API serves. The API routes are listed in `thiruppugazh-api/README.md`.
- The page shows a retry prompt when the song list fails to load.
