# Evo source

This source ingests ski boot product pages from Evo using sitemap discovery.

## Discovery
- Method: sitemap
- URLs: `https://www.evo.com/sitemap.xml`, `https://www.evo.com/sitemaps/sitemap-products.xml`
- Filter: only keep URLs that look like `/ski-boots/` product pages.

## Run
```bash
npm run crawl:evo -- --mode=discover --limit=50
npm run crawl:evo -- --mode=parse --limit=10 --dry-run
npm run crawl:evo -- --mode=ingest --limit=10
```

## Limitations
- Sitemap URLs may change; update `config.ts` if Evo changes its sitemap layout.
- Product specs are parsed with heuristics and may miss values.
- Respect robots.txt and Evo terms before running live crawls.
