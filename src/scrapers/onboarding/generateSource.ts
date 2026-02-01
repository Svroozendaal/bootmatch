import fs from "fs";
import path from "path";
import { configTemplate } from "./templates/config";
import { discoverTemplate } from "./templates/discover";
import { parseTemplate } from "./templates/parse";
import { indexTemplate } from "./templates/index";
import { readmeTemplate } from "./templates/readme";
import {
  ensureDir,
  fileExists,
  normalizeUrl,
  readJson,
  sanitizeSiteKey,
  toCamelCase,
  toPascalCase,
  writeFileSafe,
  writeJson
} from "./utils";

export type GenerateSourceOptions = {
  siteKey: string;
  siteName: string;
  baseDomain: string;
  method: "sitemap" | "category_pagination" | "js_heavy";
  categoryUrl?: string;
  sitemapUrl?: string;
  force?: boolean;
};

type PackageJson = {
  scripts?: Record<string, string>;
};

function updateRegistry(siteKey: string, camelName: string) {
  const registryPath = path.join(
    process.cwd(),
    "src",
    "scrapers",
    "sources",
    "index.ts"
  );

  if (!fileExists(registryPath)) {
    return { updated: false, reason: "registry_missing" };
  }

  let content = fs.readFileSync(registryPath, "utf8");
  const importLine = `import { ${camelName}Source } from "./${siteKey}";`;
  let lines = content.split(/\r?\n/);

  if (!content.includes(importLine)) {
    const lastImport = lines.reduce((acc, line, index) => {
      return line.startsWith("import ") ? index : acc;
    }, -1);
    lines.splice(lastImport + 1, 0, importLine);
  }

  const ifLine = `  if (name === "${siteKey}") return ${camelName}Source;`;
  if (!lines.some((line) => line.trim() === ifLine.trim())) {
    const throwIndex = lines.findIndex((line) => line.includes("throw new Error"));
    const insertAt = throwIndex === -1 ? lines.length - 1 : throwIndex;
    lines.splice(insertAt, 0, ifLine);
  }

  const updated = lines.join("\n");
  if (updated !== content) {
    fs.writeFileSync(registryPath, updated, "utf8");
  }
  return { updated: true };
}

function writePatchFile(siteKey: string) {
  const patchDir = path.join(process.cwd(), "docs", "patches");
  ensureDir(patchDir);
  const patchPath = path.join(patchDir, `add-crawl-${siteKey}.md`);
  const content = `# Add crawl script for ${siteKey}

Add this to package.json scripts:

\`\`\`json
"crawl:${siteKey}": "npm run crawl -- --source=${siteKey}"
\`\`\`
`;
  fs.writeFileSync(patchPath, content, "utf8");
  return patchPath;
}

function updatePackageScripts(siteKey: string) {
  const packagePath = path.join(process.cwd(), "package.json");
  try {
    const pkg = readJson<PackageJson>(packagePath);
    const scripts = pkg.scripts ?? {};
    const scriptKey = `crawl:${siteKey}`;
    if (!scripts[scriptKey]) {
      scripts[scriptKey] = `npm run crawl -- --source=${siteKey}`;
      pkg.scripts = scripts;
      writeJson(packagePath, pkg);
      return { updated: true, patchPath: null };
    }
    return { updated: false, patchPath: null };
  } catch {
    const patchPath = writePatchFile(siteKey);
    return { updated: false, patchPath };
  }
}

export function generateSource(options: GenerateSourceOptions) {
  const siteKey = sanitizeSiteKey(options.siteKey);
  const siteName = options.siteName.trim();
  const baseDomain = normalizeUrl(options.baseDomain);

  if (!siteName) {
    throw new Error("siteName is required.");
  }

  if (!baseDomain.startsWith("http")) {
    throw new Error("baseDomain must include protocol (https://...).");
  }

  const method = options.method;
  if (!["sitemap", "category_pagination", "js_heavy"].includes(method)) {
    throw new Error("method must be sitemap, category_pagination, or js_heavy.");
  }

  const categoryUrl = options.categoryUrl
    ? normalizeUrl(options.categoryUrl)
    : undefined;
  const sitemapUrl = options.sitemapUrl
    ? normalizeUrl(options.sitemapUrl)
    : undefined;

  const sourceDir = path.join(
    process.cwd(),
    "src",
    "scrapers",
    "sources",
    siteKey
  );

  if (fileExists(sourceDir) && !options.force) {
    throw new Error(`Source folder already exists: ${sourceDir}`);
  }

  ensureDir(sourceDir);

  const pascalName = toPascalCase(siteKey);
  const camelName = toCamelCase(siteKey);

  const results = [
    writeFileSafe(
      path.join(sourceDir, "config.ts"),
      configTemplate({
        siteKey,
        siteName,
        baseDomain,
        method,
        categoryUrl,
        sitemapUrl
      }),
      options.force
    ),
    writeFileSafe(
      path.join(sourceDir, "discover.ts"),
      discoverTemplate({ pascalName }),
      options.force
    ),
    writeFileSafe(
      path.join(sourceDir, "parse.ts"),
      parseTemplate({ pascalName }),
      options.force
    ),
    writeFileSafe(
      path.join(sourceDir, "index.ts"),
      indexTemplate({ camelName, pascalName }),
      options.force
    ),
    writeFileSafe(
      path.join(sourceDir, "README.md"),
      readmeTemplate({ siteKey, siteName }),
      options.force
    )
  ];

  const registryResult = updateRegistry(siteKey, camelName);
  const scriptsResult = updatePackageScripts(siteKey);

  return {
    siteKey,
    siteName,
    sourceDir,
    results,
    registryResult,
    scriptsResult
  };
}
