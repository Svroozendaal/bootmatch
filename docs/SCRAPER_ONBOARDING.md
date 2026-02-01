# Adding a new scraping source (agent-assisted)

This guide helps you add a new scraping source in about 20 minutes. The goal is to keep scraping safely isolated in the CLI while making it easy for humans + agents to collaborate.

## Philosophy
- The agent can help find selectors and discovery paths, but parsing must be deterministic and tested.
- Scraping stays in CLI-only code under `src/scrapers`. The Next.js runtime should never scrape.
- Respect robots.txt and Terms of Service. If unsure, stop and verify.

## Pre-flight checklist
1) Check robots.txt and the site’s Terms of Service.
2) Identify boot category pages and example product pages.
3) Determine if pages are JS-heavy:
   - If yes, prefer a sitemap or plan to use a rendered source (e.g., Playwright).
4) Choose discovery method:
   - `sitemap` for XML sitemaps
   - `category_pagination` for category + next-page loops
   - `js_heavy` when discovery needs a renderer

## Using the onboarding CLI

### 1) Generate the source skeleton
```bash
npm run onboard:site -- generate \
  --siteKey=testsite \
  --siteName="Test Site" \
  --baseDomain=https://example.com \
  --method=category_pagination \
  --categoryUrl=https://example.com/ski-boots
```

This creates:
- `src/scrapers/sources/testsite/` with config/discover/parse/index/README
- Adds `crawl:testsite` script to package.json when possible
- Registers the new source in `src/scrapers/sources/index.ts`

### 2) Inspect a page (best-effort helper)
```bash
npm run onboard:site -- inspect --url=https://example.com/ski-boots
```

Outputs:
- Status code and final URL
- JSON-LD presence
- Page title
- Candidate product link selectors
- Candidate spec selectors

Optional: save HTML fixture
```bash
npm run onboard:site -- inspect --url=https://example.com/ski-boots \
  --out=tests/fixtures/testsite/sample.html
```

### 3) Generate fixtures + tests
```bash
npm run onboard:site -- tests --siteKey=testsite
```

This creates:
- `tests/fixtures/testsite/README.md`
- `tests/fixtures/testsite/product1.html`
- `tests/fixtures/testsite/product2.html`
- `tests/testsite.parse.test.ts`

Replace placeholder HTML with real product pages, then update the expected values in the test.

### 4) Implement selectors + filters
Open these files and fill in TODOs:
- `src/scrapers/sources/testsite/config.ts`
- `src/scrapers/sources/testsite/discover.ts`
- `src/scrapers/sources/testsite/parse.ts`

Start by using JSON-LD, then add precise selectors for title/specs. Keep parsing deterministic.

### 5) Run tests and crawl
```bash
npm run test
npm run crawl:testsite -- --mode=discover --limit=200
npm run crawl:testsite -- --mode=parse --limit=10 --dry-run
npm run crawl:testsite -- --mode=ingest --limit=10
```

## Agent prompt (copy/paste)
Use this prompt when asking an AI assistant to help with a new site:

```
You are helping me onboard a new BootMatch scraper source.
Site: <SITE_NAME> (<BASE_DOMAIN>)

Tasks:
1) Recommend the discovery method (sitemap vs category pagination vs js-heavy).
2) Provide CSS selectors for product links on category pages.
3) Provide CSS selectors for product title, description, and spec tables.
4) Provide a URL allowlist regex that matches only ski boot product pages.
5) Provide 2-5 example product URLs.
6) Tell me if pages require a JS renderer (Playwright) or if static HTML is enough.

Constraints:
- Respect robots.txt and ToS.
- Keep extraction deterministic and testable.
- Output should be suitable for config.ts + parse.ts in this repo.
```

## Definition of done
- `npm run test` passes with real fixtures
- `npm run crawl:<siteKey> -- --mode=discover --limit=200` finds URLs
- `npm run crawl:<siteKey> -- --mode=parse --limit=10 --dry-run` prints plausible ParsedBoots
- `npm run crawl:<siteKey> -- --mode=ingest --limit=10` upserts boots in DB
- The web app resolves and matches newly ingested boots

## Troubleshooting
- `lastMm` or `flexIndex` is null:
  - Improve spec selectors or regex in parse.ts
  - Ensure fixtures include explicit values
- Discovery returns 0 URLs:
  - Fix `PRODUCT_URL_ALLOWLIST`
  - Fix category pagination selectors or sitemap parsing
- 429/403 or blocked:
  - Lower concurrency / increase delay
  - Verify robots.txt and Terms of Service
