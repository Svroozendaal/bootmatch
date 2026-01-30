import {
  extractFitTags,
  extractFlexIndex,
  extractJsonLdProduct,
  extractLastMm,
  extractSpecs,
  extractVolumeClass
} from "../../common/extract";
import { ParsedBoot } from "../../common/types";
import { loadHtml, getText } from "../../common/html";

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

function parseTitle(rawTitle: string) {
  let title = rawTitle.replace(/ski boots?/i, "").trim();
  let year: number | null = null;
  const yearMatch = title.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
    title = title.replace(yearMatch[1], "").trim();
  }

  let brand: string | null = null;
  for (const candidate of brands) {
    if (title.toLowerCase().startsWith(candidate.toLowerCase())) {
      brand = candidate;
      title = title.slice(candidate.length).trim();
      break;
    }
  }

  let variant: string | null = null;
  const variantMatch = title.match(/\b(\d{2,3}(?:\s?[A-Z]{1,3})?)\b$/);
  if (variantMatch) {
    variant = variantMatch[1].trim();
    title = title.replace(variantMatch[1], "").trim();
  }

  const modelLine = title.trim() || null;

  return { brand, modelLine, variant, year };
}

export async function parseExample(url: string, html: string) {
  const jsonLd = extractJsonLdProduct(html);
  const $ = loadHtml(html);
  const rawTitle = jsonLd?.name || getText($, "h1") || getText($, "title");
  const description = jsonLd?.description || getText($, ".description") || null;
  const rawSpecs = extractSpecs(html);

  const title = rawTitle ?? "";
  const { brand, modelLine, variant, year } = parseTitle(title);

  const textBlob = [
    title,
    description,
    rawSpecs ? Object.values(rawSpecs).join(" ") : ""
  ]
    .join(" ")
    .trim();

  const lastMm = extractLastMm(textBlob);
  const flexIndex = extractFlexIndex(textBlob);
  const volumeClass = extractVolumeClass(textBlob);
  const fitTags = extractFitTags(textBlob);

  const canonicalName = brand && modelLine
    ? `${brand} ${modelLine}${variant ? " " + variant : ""}${year ? " " + year : ""}`.trim()
    : null;

  const parsed: ParsedBoot = {
    sourceUrl: url,
    canonicalName,
    brand,
    modelLine,
    variant,
    year,
    rawTitle: rawTitle ?? null,
    rawSpecs,
    description,
    imageUrl: Array.isArray(jsonLd?.image) ? jsonLd?.image?.[0] ?? null : jsonLd?.image ?? null,
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
