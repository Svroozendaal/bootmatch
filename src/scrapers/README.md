# BootMatch Scrapers

Scraping/crawling runs outside the Next.js runtime as CLI jobs. This keeps the web app fast and ensures crawling can be paused/controlled separately.

## Directory layout
- `common/`: shared fetch, robots, parsing helpers
- `sources/<sourceName>/`: source-specific discovery + parsing
- `runner.ts`: orchestrates discover/parse/ingest
- `cli.ts`: CLI entrypoint

## Commands
```bash
npm run crawl -- --source=example --mode=discover --limit=20
npm run crawl -- --source=example --mode=parse --concurrency=2 --limit=10
npm run crawl -- --source=example --mode=ingest --limit=10
```

Flags:
- `--source=<name>`
- `--mode=discover|parse|ingest`
- `--limit=<n>`
- `--concurrency=<n>` (parse only)
- `--dry-run` (parse/ingest without DB writes)
- `--since=<ISO>` (parse only)

## Data flow
1. **discover** -> populates `CrawlUrl` with URLs.
2. **parse** -> fetches HTML, extracts JSON-LD/specs, stores raw blobs in `Source` and updates `CrawlUrl` status.
3. **ingest** -> reads `Source.rawSpecsBlob`, upserts `Boot` + aliases, and links `Source.bootId`.

## Robots/ToS guardrails
A best-effort robots.txt check is performed for HTTP URLs. If disallowed, URLs are skipped and marked failed. Always verify the site’s terms yourself.

## Example source
The `example` source uses local fixture HTML files so the pipeline is deterministic and safe. Replace the fixtures + discovery list with real URLs when ready.
