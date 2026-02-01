export type ParseTemplateOptions = {
  pascalName: string;
};

export function parseTemplate(options: ParseTemplateOptions) {
  return `import { loadHtml, getText, extractTableSpecs } from "../../common/html";
import {
  extractFitTags,
  extractFlexIndex,
  extractJsonLdProduct,
  extractLastMm,
  extractVolumeClass
} from "../../common/extract";
import { ParsedBoot } from "../../common/types";
import {
  BRAND_HINTS,
  DESCRIPTION_SELECTOR,
  IMAGE_SELECTOR,
  SPECS_CONTAINER_SELECTOR,
  SPEC_ROW_SELECTOR,
  TITLE_SELECTOR
} from "./config";

function parseTitle(rawTitle: string, brandHint: string | null) {
  let title = rawTitle.replace(/ski boots?/i, "").trim();
  let year: number | null = null;
  const yearMatch = title.match(/\\b(20\\d{2})\\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
    title = title.replace(yearMatch[1], "").trim();
  }

  let brand: string | null = brandHint;
  if (!brand) {
    for (const candidate of BRAND_HINTS) {
      if (title.toLowerCase().startsWith(candidate.toLowerCase())) {
        brand = candidate;
        title = title.slice(candidate.length).trim();
        break;
      }
    }
  } else if (brand && title.toLowerCase().startsWith(brand.toLowerCase())) {
    title = title.slice(brand.length).trim();
  }

  let variant: string | null = null;
  const variantMatch = title.match(/\\b(\\d{2,3}(?:\\s?[A-Z]{1,3})?)\\b$/);
  if (variantMatch) {
    variant = variantMatch[1].trim();
    title = title.replace(variantMatch[1], "").trim();
  }

  const modelLine = title.trim() || null;

  return { brand, modelLine, variant, year };
}

export async function parse${options.pascalName}(url: string, html: string) {
  const jsonLd = extractJsonLdProduct(html);
  const $ = loadHtml(html);
  const rawTitle = jsonLd?.name || getText($, TITLE_SELECTOR) || getText($, "title");
  const description =
    jsonLd?.description || getText($, DESCRIPTION_SELECTOR) || null;

  function extractSpecsFromSelectors() {
    const specs: Record<string, string> = {};
    $(SPECS_CONTAINER_SELECTOR)
      .find(SPEC_ROW_SELECTOR)
      .each((_, row) => {
        const cells = $(row).find("th, td");
        if (cells.length >= 2) {
          const key = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          if (key && value) specs[key] = value;
        }
      });
    return Object.keys(specs).length ? specs : null;
  }

  // TODO: If specs are not in tables/dl blocks, build a site-specific extractor.
  const rawSpecs = extractSpecsFromSelectors() || extractTableSpecs($);

  const title = rawTitle ?? "";
  const brandName = (() => {
    if (typeof jsonLd?.brand === "string") return jsonLd.brand;
    if (typeof jsonLd?.brand === "object") return jsonLd?.brand?.name ?? null;
    return null;
  })();

  const titleData = parseTitle(title, brandName);

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

  const canonicalName =
    titleData.brand && titleData.modelLine
      ? \`\${titleData.brand} \${titleData.modelLine}\${titleData.variant ? " " + titleData.variant : ""}\${titleData.year ? " " + titleData.year : ""}\`.trim()
      : null;

  const imageUrl = (() => {
    if (Array.isArray(jsonLd?.image)) return jsonLd?.image?.[0] ?? null;
    if (typeof jsonLd?.image === "string") return jsonLd.image;
    const img = $(IMAGE_SELECTOR).first();
    return img.attr("src") || img.attr("data-src") || null;
  })();

  const parsed: ParsedBoot = {
    sourceUrl: url,
    canonicalName,
    brand: titleData.brand,
    modelLine: titleData.modelLine,
    variant: titleData.variant,
    year: titleData.year,
    rawTitle: rawTitle ?? null,
    rawSpecs,
    description,
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
`;
}
