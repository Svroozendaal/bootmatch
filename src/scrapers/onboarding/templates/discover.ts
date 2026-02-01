export type DiscoverTemplateOptions = {
  pascalName: string;
};

export function discoverTemplate(options: DiscoverTemplateOptions) {
  return `import { fetchWithRetry } from "../../common/fetch";
import { isAllowedByRobots } from "../../common/robots";
import { loadHtml } from "../../common/html";
import {
  BASE_DOMAIN,
  CATEGORY_URLS,
  DISCOVERY_METHOD,
  PAGINATION,
  PRODUCT_LINK_SELECTORS,
  PRODUCT_URL_ALLOWLIST,
  PRODUCT_URL_DENYLIST,
  SITEMAP_URLS
} from "./config";

function normalizeUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function isProductUrl(url: string) {
  if (!url.startsWith(BASE_DOMAIN)) return false;
  if (!PRODUCT_URL_ALLOWLIST.test(url)) return false;
  if (PRODUCT_URL_DENYLIST.some((pattern) => pattern.test(url))) return false;
  return true;
}

function extractSitemapUrls(xml: string) {
  const urls: string[] = [];
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  for (const raw of matches) {
    const url = raw.replace("<loc>", "").replace("</loc>", "").trim();
    if (url) urls.push(url);
  }
  return urls;
}

async function fetchPage(url: string) {
  const allowed = await isAllowedByRobots(url);
  if (!allowed) {
    throw new Error("Blocked by robots.txt: " + url);
  }
  const result = await fetchWithRetry(url, { minDelayMs: 1000, retries: 2 });
  if (!result.ok || !result.text) {
    throw new Error(result.error || "Fetch failed");
  }
  return result.text;
}

async function discoverFromSitemaps() {
  const discovered = new Set<string>();
  const queue = [...SITEMAP_URLS];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    const xml = await fetchPage(sitemapUrl);
    const urls = extractSitemapUrls(xml);

    for (const url of urls) {
      if (url.endsWith(".xml") && url.includes("sitemap")) {
        queue.push(url);
        continue;
      }
      if (isProductUrl(url)) {
        discovered.add(url);
      }
    }
  }

  return Array.from(discovered);
}

async function discoverFromCategoryPagination() {
  if (!CATEGORY_URLS.length) {
    throw new Error("Missing CATEGORY_URLS in config.");
  }

  const discovered = new Set<string>();

  function nextFromPageParam(baseUrl: string, page: number) {
    if (!PAGINATION.pageParam) return null;
    try {
      const url = new URL(baseUrl);
      url.searchParams.set(PAGINATION.pageParam, String(page));
      return url.toString();
    } catch {
      return null;
    }
  }

  for (const startUrl of CATEGORY_URLS) {
    let nextUrl: string | null = startUrl;
    let pageCount = 0;
    const visited = new Set<string>();

    while (nextUrl && pageCount < PAGINATION.maxPages) {
      pageCount += 1;
      if (visited.has(nextUrl)) break;
      visited.add(nextUrl);

      const html = await fetchPage(nextUrl);
      const $ = loadHtml(html);

      for (const selector of PRODUCT_LINK_SELECTORS) {
        $(selector).each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;
          const url = normalizeUrl(href, BASE_DOMAIN);
          if (url && isProductUrl(url)) {
            discovered.add(url);
          }
        });
      }

      if (PAGINATION.type === "next_link") {
        const nextHref = $(PAGINATION.nextSelector || "").first().attr("href");
        nextUrl = nextHref ? normalizeUrl(nextHref, BASE_DOMAIN) : null;
      } else if (PAGINATION.type === "page_param") {
        const candidate = nextFromPageParam(startUrl, pageCount + 1);
        nextUrl = candidate && candidate !== nextUrl ? candidate : null;
      } else {
        nextUrl = null;
      }

      // TODO: Add category filters or stop conditions when listings are exhausted.
      if (!nextUrl) break;
    }
  }

  return Array.from(discovered);
}

export async function discover${options.pascalName}() {
  if (DISCOVERY_METHOD === "sitemap") {
    return discoverFromSitemaps();
  }
  if (DISCOVERY_METHOD === "category_pagination") {
    return discoverFromCategoryPagination();
  }
  // Note: the runner persists discovered URLs into CrawlUrl.
  throw new Error("Discovery method is js_heavy. Use Playwright or a rendered sitemap.");
}
`;
}
