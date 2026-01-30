import { loadHtml, extractTableSpecs } from "./html";

export type JsonLdProduct = {
  name?: string;
  description?: string;
  image?: string | string[];
  brand?: { name?: string } | string;
};

export function extractJsonLdProduct(html: string): JsonLdProduct | null {
  const $ = loadHtml(html);
  const scripts = $("script[type='application/ld+json']");
  for (const element of scripts.toArray()) {
    const json = $(element).contents().text();
    if (!json) continue;
    try {
      const parsed = JSON.parse(json);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const entry of candidates) {
        if (!entry || typeof entry !== "object") continue;
        if (entry["@type"] === "Product") {
          return entry as JsonLdProduct;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function extractSpecs(html: string) {
  const $ = loadHtml(html);
  return extractTableSpecs($);
}

export function extractLastMm(text: string) {
  const lastMatch = text.match(/last\s*[:\-]?\s*(\d{2,3})\s*mm/i);
  if (lastMatch) return parseInt(lastMatch[1], 10);
  const generic = text.match(/(\d{2,3})\s*mm/i);
  if (generic) return parseInt(generic[1], 10);
  return null;
}

export function extractFlexIndex(text: string) {
  const match = text.match(/flex\s*[:\-]?\s*(\d{2,3})/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

export function extractVolumeClass(text: string) {
  const upper = text.toUpperCase();
  if (upper.includes("LOW VOLUME") || upper.includes("LV")) return "LV" as const;
  if (upper.includes("HIGH VOLUME") || upper.includes("HV")) return "HV" as const;
  if (upper.includes("MEDIUM VOLUME") || upper.includes("MV")) return "MV" as const;
  return null;
}

export function extractFitTags(text: string) {
  const lower = text.toLowerCase();

  const heelHold =
    lower.includes("tight heel") || lower.includes("locked-in heel")
      ? "narrow"
      : lower.includes("roomy heel")
      ? "roomy"
      : lower.includes("heel")
      ? "medium"
      : null;

  const instepHeight =
    lower.includes("low instep")
      ? "low"
      : lower.includes("high instep") || lower.includes("generous instep")
      ? "high"
      : lower.includes("instep")
      ? "medium"
      : null;

  const forefootShape =
    lower.includes("tapered forefoot") || lower.includes("tapered toe")
      ? "tapered"
      : lower.includes("roomy toe") || lower.includes("roomy forefoot")
      ? "roomy"
      : lower.includes("forefoot") || lower.includes("toe box")
      ? "neutral"
      : null;

  return { heelHold, instepHeight, forefootShape } as const;
}
