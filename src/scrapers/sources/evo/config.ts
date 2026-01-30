export const SITE_KEY = "evo";
export const SITE_NAME = "Evo";
export const BASE_DOMAIN = "https://www.evo.com";

export const DISCOVERY_METHOD = "sitemap" as const;

export const SITEMAP_URLS = [
  "https://www.evo.com/sitemap.xml",
  "https://www.evo.com/sitemaps/sitemap-products.xml"
];

export const PRODUCT_URL_FILTER = (url: string) => {
  const lower = url.toLowerCase();
  if (!lower.startsWith(BASE_DOMAIN)) return false;
  if (!lower.includes("boot")) return false;
  const skiBootPath =
    /\/ski-?boots\//.test(lower) ||
    /\/shop\/ski\/boots\//.test(lower) ||
    (/\/boots\//.test(lower) && lower.includes("ski"));
  return skiBootPath;
};

export const TITLE_SELECTOR = "h1";
export const DESCRIPTION_SELECTOR = ".product-description, .description";
export const SPECS_CONTAINER_SELECTOR = ".product-specs, table";
export const SPEC_ROW_SELECTOR = "tr";
export const IMAGE_SELECTOR = "img";
