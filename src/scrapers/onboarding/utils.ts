import fs from "fs";
import path from "path";

export type WriteResult = {
  path: string;
  wrote: boolean;
  skipped: boolean;
};

export function sanitizeSiteKey(input: string) {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!cleaned) {
    throw new Error("Invalid siteKey. Use letters, numbers, and dashes.");
  }
  return cleaned;
}

export function toPascalCase(input: string) {
  const parts = input.split(/[^a-zA-Z0-9]/).filter(Boolean);
  if (!parts.length) return "Site";
  return parts.map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

export function toCamelCase(input: string) {
  const pascal = toPascalCase(input);
  return pascal[0].toLowerCase() + pascal.slice(1);
}

export function normalizeUrl(input: string) {
  return input.trim().replace(/\/+$/, "");
}

export function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFileSafe(
  filePath: string,
  contents: string,
  force = false
): WriteResult {
  if (fs.existsSync(filePath) && !force) {
    return { path: filePath, wrote: false, skipped: true };
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, "utf8");
  return { path: filePath, wrote: true, skipped: false };
}

export function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function writeJson(filePath: string, data: unknown) {
  const content = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, content, "utf8");
}

export function fileExists(filePath: string) {
  return fs.existsSync(filePath);
}
