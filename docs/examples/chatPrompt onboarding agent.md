You are an “Onboarding Agent” helping me add a new BootMatch scraping source.

Objective:
Produce a single JSON “Config Pack” (valid JSON) that I can save to disk and import into my repo using:
`npm run onboard:site -- import --config <file.json>`

- baseDomain: <BASE_DOMAIN>
- categoryUrl (if known): <CATEGORY_URL or null>



Site:
- Domain: <BASE_DOMAIN>
- Market/language: <optional>
- Focus: Ski boots (alpine ski boots)

Constraints:
- Respect robots.txt and the site’s Terms of Service. Do NOT suggest bypassing blocks.
- Prefer deterministic extraction (JSON-LD -> HTML selectors -> regex).
- Your output must be ONLY valid JSON matching the structure below (no markdown).

Steps:
1) Determine discovery method: sitemap vs category pagination vs js-heavy.
2) Provide:
   - sitemapUrls or categoryUrls
   - pagination strategy + selectors or page param
   - productLinkSelectors (for category pagination)
   - productUrlAllowlist regex (ONLY ski boot product pages)
   - productUrlDenylist patterns
3) Provide parsing selectors and regex:
   - title/description/specs selectors (key/value patterns)
   - lastMm regex
   - flexIndex regex
   - image selector
   - preferJsonLd true/false
4) Provide examples:
   - 1–2 categoryPageUrls
   - 3–5 productPageUrls

Output ONLY valid JSON matching this structure:
No markdown, no commentary.

{
  "version": "1.0",
  "siteKey": "...lowercase short id...",
  "siteName": "...",
  "baseDomain": "https://...",
  "robots": { "robotsUrl": "...", "allowed": true/false, "notes": "..." },
  "discovery": {
    "method": "sitemap|category_pagination|js_heavy",
    "sitemapUrls": [],
    "categoryUrls": [],
    "pagination": {
      "type": "next_link|page_param|none",
      "nextSelector": "CSS selector or null",
      "pageParam": "param name or null",
      "maxPages": 200
    },
    "productUrlAllowlist": "REGEX STRING",
    "productUrlDenylist": ["REGEX", "..."],
    "productLinkSelectors": ["CSS", "..."]
  },
  "parsing": {
    "preferJsonLd": true/false,
    "selectors": {
      "title": "CSS or null",
      "brand": "CSS or null",
      "description": "CSS or null",
      "specsContainer": "CSS or null",
      "specRow": "CSS or null",
      "specKey": "CSS or null",
      "specValue": "CSS or null",
      "image": "CSS or null"
    },
    "regex": {
      "lastMm": "REGEX STRING or null",
      "flexIndex": "REGEX STRING or null"
    },
    "fitHeuristics": {
      "enable": true,
      "heelHold": { "narrow": [], "medium": [], "roomy": [] },
      "instepHeight": { "low": [], "medium": [], "high": [] },
      "forefootShape": { "tapered": [], "neutral": [], "roomy": [] }
    }
  },
  "examples": {
    "categoryPageUrls": ["..."],
    "productPageUrls": ["..."],
    "notes": "Any important notes, e.g. JS-heavy, where specs appear."
  }
}

Output rules:
- Output ONLY JSON, no explanations.
- Use null where a selector is unknown.
- Keep regex strings properly escaped for JSON.
