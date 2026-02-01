import fs from "fs";
import path from "path";
import { fetchWithRetry } from "../common/fetch";
import { isAllowedByRobots } from "../common/robots";
import { loadHtml, getText } from "../common/html";
import { ensureDir } from "./utils";

type InspectResult = {
  url: string;
  status: number;
  finalUrl: string;
  hasJsonLd: boolean;
  title: string | null;
  linkSelectors: string[];
  specSelectors: string[];
};

function collectTopClasses(
  $: ReturnType<typeof loadHtml>,
  elements: any,
  limit = 6
) {
  const counts = new Map<string, number>();
  elements.each((_, el) => {
    const classAttr = $(el).attr("class");
    if (!classAttr) return;
    const classes = classAttr.split(/\s+/).filter(Boolean);
    for (const cls of classes) {
      counts.set(cls, (counts.get(cls) ?? 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cls]) => `.${cls}`);
}

function dedupe(items: string[]) {
  return Array.from(new Set(items));
}

export async function inspectUrl(targetUrl: string, outPath?: string) {
  const allowed = await isAllowedByRobots(targetUrl);
  if (!allowed) {
    console.error(`[inspect] Blocked by robots.txt: ${targetUrl}`);
    return null;
  }

  const result = await fetchWithRetry(targetUrl, { minDelayMs: 1000, retries: 2 });
  if (!result.ok || !result.text) {
    console.error(`[inspect] Fetch failed: ${result.error || result.status}`);
    return null;
  }

  const html = result.text;
  const $ = loadHtml(html);
  const title = getText($, "title") || getText($, "h1");
  const hasJsonLd = $("script[type='application/ld+json']").length > 0;

  const anchors = $("a[href]");
  const productLike = anchors.filter((_, el) => {
    const href = ($(el).attr("href") || "").toLowerCase();
    return href.includes("boot") || href.includes("product") || href.includes("ski");
  });
  const productLinkCount = productLike.length;

  const linkSelectors = dedupe([
    "a[href*=\"boot\"]",
    "a[href*=\"ski\"]",
    ...collectTopClasses($, productLike)
  ]).slice(0, 8);

  const specSelectors = dedupe([
    $("table").length ? "table" : "",
    $("dl").length ? "dl" : "",
    "section[class*=\"spec\"]",
    "div[class*=\"spec\"]",
    "section[class*=\"tech\"]",
    "div[class*=\"tech\"]",
    "section[class*=\"detail\"]",
    "div[class*=\"detail\"]"
  ]).filter(Boolean);

  const specContainerCount = $("table, dl, section[class*=\"spec\"], div[class*=\"spec\"]").length;
  const isLikelyCategory = productLinkCount >= 15;
  const isLikelyProduct = specContainerCount > 0 || hasJsonLd;

  const output: InspectResult = {
    url: targetUrl,
    status: result.status,
    finalUrl: result.url,
    hasJsonLd,
    title,
    linkSelectors,
    specSelectors
  };

  if (outPath) {
    const absolute = path.isAbsolute(outPath)
      ? outPath
      : path.join(process.cwd(), outPath);
    ensureDir(path.dirname(absolute));
    fs.writeFileSync(absolute, html, "utf8");
    console.log(`[inspect] Saved HTML to ${absolute}`);
  }

  console.log(`[inspect] Status: ${output.status}`);
  console.log(`[inspect] Final URL: ${output.finalUrl}`);
  console.log(`[inspect] Title: ${output.title ?? "N/A"}`);
  console.log(`[inspect] JSON-LD present: ${output.hasJsonLd ? "yes" : "no"}`);
  if (isLikelyCategory) {
    console.log("[inspect] Candidate link selectors:");
    output.linkSelectors.forEach((selector) => console.log(`  - ${selector}`));
  } else {
    console.log("[inspect] Category link selectors: not enough product-like links.");
  }

  if (isLikelyProduct) {
    console.log("[inspect] Candidate spec selectors:");
    output.specSelectors.forEach((selector) => console.log(`  - ${selector}`));
  } else {
    console.log("[inspect] Spec selectors: page does not look like a product page.");
  }

  return output;
}
