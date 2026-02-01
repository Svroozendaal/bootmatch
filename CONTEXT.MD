# BootMatch context

## What the app does
BootMatch is a minimal MVP that helps renters identify their ski boot and recommends similar-fitting boots. Users type a boot name, the app resolves it to a canonical boot record (brand + model + optional variant/year), and then returns the top matches based on fit attributes (last, volume, shape, flex).

## How it works (high level)
- Frontend (Next.js pages router) calls API routes to resolve names and fetch matches.
- Backend logic lives in `src/lib/*` and uses Prisma to read/write SQLite.
- A separate scraper CLI ingests product pages, storing raw specs and upserting canonical boot data.

## Where to look
- Frontend: `src/pages/index.tsx`, `src/pages/results/[bootId].tsx`, `src/pages/admin.tsx`, `src/styles/globals.css`
- API backend: `src/pages/api/*.ts`, `src/pages/api/admin/*.ts`, `src/lib/*`
- Database schema: `prisma/schema.prisma`
- Scraper CLI: `src/scrapers/*` (see `src/scrapers/README.md`)

## More detailed docs
See `developer/CONTEXT.MD` and `developer/APP_MAP.MD` for architecture details and file pointers.
