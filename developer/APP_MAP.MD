# BootMatch file map

## Frontend (user app)
- Home/search UI: `src/pages/index.tsx`
- Results UI: `src/pages/results/[bootId].tsx`
- Admin UI: `src/pages/admin.tsx`
- Global styling: `src/styles/globals.css`
- App shell: `src/pages/_app.tsx`, `src/pages/_document.tsx`

## Backend (Next.js API routes)
- Resolve name: `src/pages/api/resolve.ts`
- Search suggestions: `src/pages/api/search.ts`
- Match results: `src/pages/api/match.ts`
- Seed endpoint: `src/pages/api/seed.ts`
- Admin endpoints: `src/pages/api/admin/boots.ts`, `src/pages/api/admin/alias.ts`

## Backend logic
- Prisma client: `src/lib/db.ts`
- Name normalization: `src/lib/normalize.ts`
- Fuzzy matching: `src/lib/fuzzy.ts`
- Resolve flow: `src/lib/resolver.ts`
- Match scoring: `src/lib/match.ts`
- Seed logic: `src/lib/seed.ts`

## Scraper (separate CLI)
- CLI entry: `src/scrapers/cli.ts`
- Crawl orchestration: `src/scrapers/runner.ts`
- Sources registry: `src/scrapers/sources/index.ts`
- Example source: `src/scrapers/sources/example/*`
- Evo source: `src/scrapers/sources/evo/*`
- Shared helpers: `src/scrapers/common/*`

## Data
- Seed data: `src/data/boots.seed.json`
- Prisma schema: `prisma/schema.prisma`
- Local DB file: `prisma/dev.db`

## Tests
- Unit tests: `tests/*`
