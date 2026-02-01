# BootMatch developer context

## Summary
BootMatch is a Next.js MVP that resolves a renter's boot name to a canonical boot and returns similar-fitting boots. The matching logic is deterministic and driven by boot fit attributes stored in a local SQLite database.

## Architecture (runtime)
- Web app: Next.js pages router serving UI and API routes.
- API routes: `src/pages/api/*` and `src/pages/api/admin/*`.
- Data layer: Prisma client (`src/lib/db.ts`) + SQLite schema (`prisma/schema.prisma`).
- Scraper pipeline: separate CLI (`npm run crawl`) that discovers, parses, and ingests product pages.

## Frontend flow
- Search + resolve:
  - UI: `src/pages/index.tsx`
  - Suggestions: `/api/search` -> `src/lib/normalize.ts`
  - Resolve: `/api/resolve` -> `src/lib/resolver.ts`
- Matches:
  - UI: `src/pages/results/[bootId].tsx`
  - Data: `/api/match` -> `src/lib/match.ts`
- Admin:
  - UI: `src/pages/admin.tsx`
  - APIs: `/api/seed`, `/api/admin/boots`, `/api/admin/alias`

## Backend logic
- Name normalization: `src/lib/normalize.ts`
- Fuzzy similarity: `src/lib/fuzzy.ts`
- Resolution rules: `src/lib/resolver.ts`
- Fit scoring + top 10 matches: `src/lib/match.ts`
- Seed logic: `src/lib/seed.ts` and `scripts/seed.js`

## Data model (Prisma)
- `Boot`: canonical boot record with fit attributes.
- `BootAlias`: alternate spellings/variants for resolution.
- `Offer`: retailer price data for best-offer display.
- `Source`: raw scraped content and parsed blob.
- `CrawlUrl`: crawl queue bookkeeping.
- `CrawlRun`: crawl run metrics and logs.

## Scraper pipeline (separate runtime)
Entry: `src/scrapers/cli.ts` -> `src/scrapers/runner.ts`
- `discover`: populates `CrawlUrl` (source-specific discovery).
- `parse`: fetches HTML, extracts specs and JSON-LD, stores `Source.rawSpecsBlob`.
- `ingest`: parses `Source.rawSpecsBlob` and upserts `Boot` + aliases.

Sources:
- Example fixtures: `src/scrapers/sources/example/*`
- Evo sitemap crawler: `src/scrapers/sources/evo/*`

Shared helpers:
- Fetch + rate limiting: `src/scrapers/common/fetch.ts`
- Robots.txt guardrail: `src/scrapers/common/robots.ts`
- HTML/spec extraction: `src/scrapers/common/html.ts`, `src/scrapers/common/extract.ts`

## Where to edit
- UI/UX: `src/pages/*` and `src/styles/globals.css`
- Matching logic: `src/lib/match.ts`
- Resolution/normalization: `src/lib/resolver.ts`, `src/lib/normalize.ts`, `src/lib/fuzzy.ts`
- DB schema: `prisma/schema.prisma`
- Scraper behavior: `src/scrapers/**`

## Commands
- `npm run dev` (app)
- `npm run seed` (seed database)
- `npm run crawl -- --source=example --mode=discover|parse|ingest`
- `npm run test`
