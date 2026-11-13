# Thiruppugazh App

A web app for browsing, searching and reading the Thiruppugazh songs.

## Layout

```text
thiruppugazh/
├── thiruppugazh-ui/    # Next.js frontend (see its README)
├── thiruppugazh-api/   # FastAPI backend and song data (see its README)
├── docs/               # ROADMAP.md, BACKLOG.md, APP_DOCUMENTATION.md
├── vercel.json         # Vercel routing for the API
└── README.md
```

## Getting Started

Run the API and the UI in two terminals:

```bash
# terminal 1
cd thiruppugazh-api && uvicorn app.main:app --reload

# terminal 2
cd thiruppugazh-ui && npm install && npm run dev
```

The UI calls the live API by default. To use the local API, change `BASE_URL` in `thiruppugazh-ui/lib/config.ts` to `http://localhost:8000/api`.

## Planning

- Roadmap: `docs/ROADMAP.md`
- Backlog with IDs, priorities and done criteria: `docs/BACKLOG.md`

## Contributing

1. Create a feature branch from `main`.
2. Make the change and run the checks in each project's README.
3. Open a pull request.

Contributors are listed in `Contributors.md`.
