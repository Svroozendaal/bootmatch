import fs from "fs";
import path from "path";
import Ajv from "ajv/dist/2020";
import schema from "./config-pack.schema.json";

export type ConfigPack = {
  version: string;
  siteKey: string;
  siteName: string;
  baseDomain: string;
  robots?: {
    robotsUrl?: string;
    allowed?: boolean;
    notes?: string;
  };
  discovery: {
    method: "sitemap" | "category_pagination" | "js_heavy";
    sitemapUrls?: string[];
    categoryUrls?: string[];
    pagination?: {
      type?: "next_link" | "page_param" | "none";
      nextSelector?: string | null;
      pageParam?: string | null;
      maxPages?: number;
    };
    productUrlAllowlist: string;
    productUrlDenylist?: string[];
    productLinkSelectors?: string[];
  };
  parsing: {
    preferJsonLd?: boolean;
    selectors: {
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
    fitHeuristics?: {
      enable?: boolean;
      heelHold?: Record<string, string[]>;
      instepHeight?: Record<string, string[]>;
      forefootShape?: Record<string, string[]>;
    };
  };
  examples?: {
    categoryPageUrls?: string[];
    productPageUrls?: string[];
    notes?: string;
  };
};

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);

function formatErrors(errors: typeof validate.errors) {
  if (!errors) return [];
  return errors.map((error) => {
    const path = error.instancePath || "(root)";
    const detail = error.message ?? "is invalid";
    return `${path} ${detail}`;
  });
}

export function loadConfigPack(configPath: string) {
  const absolute = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);

  const raw = fs.readFileSync(absolute, "utf8");
  const data = JSON.parse(raw) as unknown;
  const ok = validate(data);

  return {
    ok,
    data: data as ConfigPack,
    errors: formatErrors(validate.errors),
    path: absolute
  };
}
