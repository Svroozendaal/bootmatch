import fs from "fs";
import path from "path";

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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateConfigPack(data: unknown) {
  const errors: string[] = [];
  if (!isObject(data)) {
    return { ok: false, errors: ["(root) must be an object"] };
  }

  const version = data.version;
  if (!isString(version)) errors.push("/version must be a string");

  const siteKey = data.siteKey;
  if (!isString(siteKey) || !/^[a-z0-9-]{2,32}$/.test(siteKey)) {
    errors.push("/siteKey must match ^[a-z0-9-]{2,32}$");
  }

  const siteName = data.siteName;
  if (!isString(siteName) || siteName.trim().length < 2) {
    errors.push("/siteName must be at least 2 characters");
  }

  const baseDomain = data.baseDomain;
  if (!isString(baseDomain) || !/^https?:\/\/.+/.test(baseDomain)) {
    errors.push("/baseDomain must include http(s)://");
  }

  const robots = data.robots;
  if (robots !== undefined) {
    if (!isObject(robots)) {
      errors.push("/robots must be an object");
    } else {
      if (robots.robotsUrl !== undefined && !isString(robots.robotsUrl)) {
        errors.push("/robots/robotsUrl must be a string");
      }
      if (robots.allowed !== undefined && !isBoolean(robots.allowed)) {
        errors.push("/robots/allowed must be a boolean");
      }
      if (robots.notes !== undefined && !isString(robots.notes)) {
        errors.push("/robots/notes must be a string");
      }
    }
  }

  const discovery = data.discovery;
  if (!isObject(discovery)) {
    errors.push("/discovery must be an object");
  } else {
    if (!isString(discovery.method) || !["sitemap", "category_pagination", "js_heavy"].includes(discovery.method)) {
      errors.push("/discovery/method must be sitemap, category_pagination, or js_heavy");
    }
    if (!isString(discovery.productUrlAllowlist) || discovery.productUrlAllowlist.trim().length < 3) {
      errors.push("/discovery/productUrlAllowlist must be a string");
    } else {
      try {
        // Validate regex string
        new RegExp(discovery.productUrlAllowlist);
      } catch {
        errors.push("/discovery/productUrlAllowlist must be a valid regex string");
      }
    }

    if (discovery.sitemapUrls !== undefined && !isArrayOfStrings(discovery.sitemapUrls)) {
      errors.push("/discovery/sitemapUrls must be an array of strings");
    }
    if (discovery.categoryUrls !== undefined && !isArrayOfStrings(discovery.categoryUrls)) {
      errors.push("/discovery/categoryUrls must be an array of strings");
    }
    if (discovery.productUrlDenylist !== undefined && !isArrayOfStrings(discovery.productUrlDenylist)) {
      errors.push("/discovery/productUrlDenylist must be an array of strings");
    }
    if (discovery.productLinkSelectors !== undefined && !isArrayOfStrings(discovery.productLinkSelectors)) {
      errors.push("/discovery/productLinkSelectors must be an array of strings");
    }

    if (discovery.pagination !== undefined) {
      if (!isObject(discovery.pagination)) {
        errors.push("/discovery/pagination must be an object");
      } else {
        if (discovery.pagination.type !== undefined && !["next_link", "page_param", "none"].includes(String(discovery.pagination.type))) {
          errors.push("/discovery/pagination/type must be next_link, page_param, or none");
        }
        if (discovery.pagination.nextSelector !== undefined && discovery.pagination.nextSelector !== null && !isString(discovery.pagination.nextSelector)) {
          errors.push("/discovery/pagination/nextSelector must be a string or null");
        }
        if (discovery.pagination.pageParam !== undefined && discovery.pagination.pageParam !== null && !isString(discovery.pagination.pageParam)) {
          errors.push("/discovery/pagination/pageParam must be a string or null");
        }
        if (discovery.pagination.maxPages !== undefined && typeof discovery.pagination.maxPages !== "number") {
          errors.push("/discovery/pagination/maxPages must be a number");
        }
      }
    }
  }

  const parsing = data.parsing;
  if (!isObject(parsing)) {
    errors.push("/parsing must be an object");
  } else {
    if (parsing.preferJsonLd !== undefined && !isBoolean(parsing.preferJsonLd)) {
      errors.push("/parsing/preferJsonLd must be a boolean");
    }
    if (!isObject(parsing.selectors)) {
      errors.push("/parsing/selectors must be an object");
    } else {
      const selectors = parsing.selectors;
      const selectorKeys = ["title", "brand", "description", "specsContainer", "specRow", "specKey", "specValue", "image"];
      for (const key of selectorKeys) {
        const value = selectors[key];
        if (value !== undefined && value !== null && !isString(value)) {
          errors.push(`/parsing/selectors/${key} must be a string or null`);
        }
      }
    }
    if (parsing.regex !== undefined) {
      if (!isObject(parsing.regex)) {
        errors.push("/parsing/regex must be an object");
      } else {
        const lastMm = parsing.regex.lastMm;
        const flexIndex = parsing.regex.flexIndex;
        if (lastMm !== undefined && lastMm !== null && !isString(lastMm)) {
          errors.push("/parsing/regex/lastMm must be a string or null");
        } else if (isString(lastMm)) {
          try {
            new RegExp(lastMm);
          } catch {
            errors.push("/parsing/regex/lastMm must be a valid regex string");
          }
        }
        if (flexIndex !== undefined && flexIndex !== null && !isString(flexIndex)) {
          errors.push("/parsing/regex/flexIndex must be a string or null");
        } else if (isString(flexIndex)) {
          try {
            new RegExp(flexIndex);
          } catch {
            errors.push("/parsing/regex/flexIndex must be a valid regex string");
          }
        }
      }
    }
  }

  const examples = data.examples;
  if (examples !== undefined) {
    if (!isObject(examples)) {
      errors.push("/examples must be an object");
    } else {
      if (examples.categoryPageUrls !== undefined && !isArrayOfStrings(examples.categoryPageUrls)) {
        errors.push("/examples/categoryPageUrls must be an array of strings");
      }
      if (examples.productPageUrls !== undefined && !isArrayOfStrings(examples.productPageUrls)) {
        errors.push("/examples/productPageUrls must be an array of strings");
      }
      if (examples.notes !== undefined && !isString(examples.notes)) {
        errors.push("/examples/notes must be a string");
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function loadConfigPack(configPath: string) {
  const absolute = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);

  const raw = fs.readFileSync(absolute, "utf8");
  const data = JSON.parse(raw) as unknown;
  const validation = validateConfigPack(data);

  return {
    ok: validation.ok,
    data: data as ConfigPack,
    errors: validation.errors,
    path: absolute
  };
}
