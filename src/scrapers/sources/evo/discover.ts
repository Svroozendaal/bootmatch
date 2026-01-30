import { fetchWithRetry } from "../../common/fetch";
import { BASE_DOMAIN, PRODUCT_URL_FILTER, SITEMAP_URLS } from "./config";

function extractSitemapUrls(xml: string) {
  const urls: string[] = [];
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  for (const raw of matches) {
    const url = raw.replace("<loc>", "").replace("</loc>", "").trim();
    if (url) urls.push(url);
  }
  return urls;
}

async function fetchSitemap(url: string) {
  const result = await fetchWithRetry(url, { minDelayMs: 1000, retries: 2 });
  if (!result.ok || !result.text) return [];
  return extractSitemapUrls(result.text);
}

export async function discoverEvo() {
  const discovered = new Set<string>();
  const sitemapQueue = [...SITEMAP_URLS];
  const visited = new Set<string>();

  while (sitemapQueue.length > 0) {
    const sitemapUrl = sitemapQueue.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    const urls = await fetchSitemap(sitemapUrl);
    for (const url of urls) {
      if (url.endsWith(".xml") && url.includes("sitemap")) {
        sitemapQueue.push(url);
        continue;
      }
      if (!url.startsWith(BASE_DOMAIN)) continue;
      if (PRODUCT_URL_FILTER(url)) {
        discovered.add(url);
      }
    }
  }

  return Array.from(discovered);
}
