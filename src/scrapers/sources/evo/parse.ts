import { loadHtml, getText, extractTableSpecs } from "../../common/html";
import {
  extractFitTags,
  extractFlexIndex,
  extractJsonLdProduct,
  extractLastMm,
  extractVolumeClass
} from "../../common/extract";
import { ParsedBoot } from "../../common/types";
import {
  DESCRIPTION_SELECTOR,
  IMAGE_SELECTOR,
  TITLE_SELECTOR
} from "./config";

const brands = [
  "Atomic",
  "Salomon",
  "Tecnica",
  "Nordica",
  "Lange",
  "Dalbello",
  "Head",
  "Fischer"
];

function detectBrand(title: string) {
  for (const brand of brands) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function parseTitle(title: string) {
  let working = title.replace(/ski boots?/i, "").trim();
  const yearMatch = working.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
  if (yearMatch) working = working.replace(yearMatch[1], "").trim();

  const brand = detectBrand(working);
  if (brand) working = working.slice(brand.length).trim();

  let variant: string | null = null;
  const variantMatch = working.match(/\b(\d{2,3}(?:\s?[A-Z]{1,3})?)\b$/);
  if (variantMatch) {
    variant = variantMatch[1].trim();
    working = working.replace(variantMatch[1], "").trim();
  }

  const modelLine = working.trim() || null;

  return { brand, modelLine, variant, year };
}

function deriveVolumeFromLast(lastMm: number | null) {
  if (!lastMm) return null;
  if (lastMm <= 98) return "LV" as const;
  if (lastMm >= 101) return "HV" as const;
  return "MV" as const;
}

export async function parseEvo(url: string, html: string) {
  const jsonLd = extractJsonLdProduct(html);
  const $ = loadHtml(html);
  const rawTitle = jsonLd?.name || getText($, TITLE_SELECTOR) || getText($, "title");
  const description = jsonLd?.description || getText($, DESCRIPTION_SELECTOR);
  const specs = extractTableSpecs($);

  const title = rawTitle ?? "";
  const titleData = parseTitle(title);

  const textBlob = [
    title,
    description,
    specs ? Object.values(specs).join(" ") : ""
  ]
    .join(" ")
    .trim();

  const lastMm = extractLastMm(textBlob);
  const flexIndex = extractFlexIndex(textBlob);
  const volumeClass = extractVolumeClass(textBlob) ?? deriveVolumeFromLast(lastMm);
  const fitTags = extractFitTags(textBlob);

  const canonicalName = titleData.brand && titleData.modelLine
    ? `${titleData.brand} ${titleData.modelLine}${titleData.variant ? " " + titleData.variant : ""}${titleData.year ? " " + titleData.year : ""}`.trim()
    : null;

  const imageUrl = (() => {
    if (Array.isArray(jsonLd?.image)) return jsonLd?.image?.[0] ?? null;
    if (typeof jsonLd?.image === "string") return jsonLd.image;
    const img = $(IMAGE_SELECTOR).first();
    const src = img.attr("src") || img.attr("data-src");
    return src || null;
  })();

  const parsed: ParsedBoot = {
    sourceUrl: url,
    canonicalName,
    brand: titleData.brand,
    modelLine: titleData.modelLine,
    variant: titleData.variant,
    year: titleData.year,
    rawTitle: rawTitle ?? null,
    rawSpecs: specs,
    description: description ?? null,
    imageUrl,
    lastMm,
    volumeClass,
    flexIndex,
    heelHold: fitTags.heelHold,
    instepHeight: fitTags.instepHeight,
    forefootShape: fitTags.forefootShape
  };

  return {
    parsed,
    rawTitle: parsed.rawTitle,
    rawSpecs: parsed.rawSpecs
  };
}
