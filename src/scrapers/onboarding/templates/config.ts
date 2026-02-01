export type ConfigTemplateOptions = {
  siteKey: string;
  siteName: string;
  baseDomain: string;
  method: "sitemap" | "category_pagination" | "js_heavy";
  categoryUrls?: string[];
  sitemapUrls?: string[];
  productUrlAllowlist?: string;
  productUrlDenylist?: string[];
  productLinkSelectors?: string[];
  pagination?: {
    type?: "next_link" | "page_param" | "none";
    nextSelector?: string | null;
    pageParam?: string | null;
    maxPages?: number;
  };
  selectors?: {
    title?: string | null;
    brand?: string | null;
    description?: string | null;
    specsContainer?: string | null;
    specRow?: string | null;
    specKey?: string | null;
    specValue?: string | null;
    image?: string | null;
  };
  regex?: {
    lastMm?: string | null;
    flexIndex?: string | null;
  };
  preferJsonLd?: boolean;
  fitHeuristics?: {
    enable?: boolean;
    heelHold?: Record<string, string[]>;
    instepHeight?: Record<string, string[]>;
    forefootShape?: Record<string, string[]>;
  } | null;
};

export function configTemplate(options: ConfigTemplateOptions) {
  const categoryUrls = options.categoryUrls ?? [];
  const sitemapUrls = options.sitemapUrls ?? [];
  const productLinkSelectors =
    options.productLinkSelectors && options.productLinkSelectors.length > 0
      ? options.productLinkSelectors
      : ["a[href*=\"/ski-boots/\"]", "a[href*=\"/boots/\"]"];

  const allowlist = options.productUrlAllowlist ?? "/ski-?boots/";
  const denylist = options.productUrlDenylist ?? [];
  const pagination = {
    type: options.pagination?.type ?? "next_link",
    nextSelector: options.pagination?.nextSelector ?? "a[rel=\"next\"], a.pagination-next",
    pageParam: options.pagination?.pageParam ?? null,
    maxPages: options.pagination?.maxPages ?? 200
  };

  const selectors = {
    title: options.selectors?.title ?? "h1",
    brand: options.selectors?.brand ?? null,
    description: options.selectors?.description ?? ".product-description, .description",
    specsContainer: options.selectors?.specsContainer ?? "table, .specs, dl",
    specRow: options.selectors?.specRow ?? "tr, div",
    specKey: options.selectors?.specKey ?? "th, dt, .label",
    specValue: options.selectors?.specValue ?? "td, dd, .value",
    image: options.selectors?.image ?? "img"
  };

  const preferJsonLd = options.preferJsonLd ?? true;
  const lastMmRegex = options.regex?.lastMm ?? null;
  const flexRegex = options.regex?.flexIndex ?? null;
  const fitHeuristics = options.fitHeuristics ?? null;

  return `export const SITE_KEY = "${options.siteKey}";
export const SITE_NAME = "${options.siteName}";
export const BASE_DOMAIN = "${options.baseDomain}";

export const DISCOVERY_METHOD = "${options.method}" as const;

export const CATEGORY_URLS = ${JSON.stringify(categoryUrls, null, 2)};
export const SITEMAP_URLS = ${JSON.stringify(sitemapUrls, null, 2)};

export const PAGINATION = ${JSON.stringify(pagination, null, 2)};

export const PRODUCT_URL_ALLOWLIST = new RegExp(${JSON.stringify(allowlist)});
export const PRODUCT_URL_DENYLIST = ${JSON.stringify(denylist, null, 2)}.map(
  (pattern) => new RegExp(pattern)
);

export const PRODUCT_LINK_SELECTORS = ${JSON.stringify(productLinkSelectors, null, 2)};

export const TITLE_SELECTOR = ${JSON.stringify(selectors.title)};
export const BRAND_SELECTOR = ${JSON.stringify(selectors.brand)};
export const DESCRIPTION_SELECTOR = ${JSON.stringify(selectors.description)};
export const SPECS_CONTAINER_SELECTOR = ${JSON.stringify(selectors.specsContainer)};
export const SPEC_ROW_SELECTOR = ${JSON.stringify(selectors.specRow)};
export const SPEC_KEY_SELECTOR = ${JSON.stringify(selectors.specKey)};
export const SPEC_VALUE_SELECTOR = ${JSON.stringify(selectors.specValue)};
export const IMAGE_SELECTOR = ${JSON.stringify(selectors.image)};

export const PREFER_JSON_LD = ${preferJsonLd};
export const LAST_MM_REGEX = ${lastMmRegex ? `new RegExp(${JSON.stringify(lastMmRegex)}, "i")` : "null"};
export const FLEX_INDEX_REGEX = ${flexRegex ? `new RegExp(${JSON.stringify(flexRegex)}, "i")` : "null"};

export const FIT_HEURISTICS = ${fitHeuristics ? JSON.stringify(fitHeuristics, null, 2) : "null"};

export const BRAND_HINTS = [
  "Atomic",
  "Salomon",
  "Tecnica",
  "Nordica",
  "Lange",
  "Dalbello",
  "Head",
  "Fischer"
];
`;
}
