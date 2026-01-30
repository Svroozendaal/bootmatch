import { FetchResult } from "./types";

const lastRequestByHost = new Map<string, number>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms: number) {
  const delta = Math.floor(Math.random() * 500) - 250;
  return Math.max(0, ms + delta);
}

async function rateLimit(url: URL, minDelayMs: number) {
  const host = url.host;
  const last = lastRequestByHost.get(host) ?? 0;
  const now = Date.now();
  const wait = Math.max(0, minDelayMs - (now - last));
  if (wait > 0) {
    await sleep(jitter(wait));
  }
  lastRequestByHost.set(host, Date.now());
}

async function fetchFile(url: URL): Promise<FetchResult> {
  const fs = await import("fs");
  const { fileURLToPath } = await import("url");
  try {
    const path = fileURLToPath(url);
    const text = fs.readFileSync(path, "utf-8");
    return { url: url.href, status: 200, ok: true, etag: null, text, error: null };
  } catch (error) {
    return {
      url: url.href,
      status: 404,
      ok: false,
      etag: null,
      text: null,
      error: (error as Error).message
    };
  }
}

export async function fetchWithRetry(
  url: string,
  options: { minDelayMs?: number; retries?: number } = {}
): Promise<FetchResult> {
  const target = new URL(url);
  if (target.protocol === "file:") {
    return fetchFile(target);
  }

  const retries = options.retries ?? 3;
  const minDelayMs = options.minDelayMs ?? 1000;

  let attempt = 0;
  let lastError: string | null = null;

  while (attempt <= retries) {
    attempt += 1;

    try {
      await rateLimit(target, minDelayMs);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "BootMatchBot/0.1 (+contact: dev@local)"
        }
      });

      const status = res.status;
      const etag = res.headers.get("etag");

      if (status >= 200 && status < 300) {
        const text = await res.text();
        return { url, status, ok: true, etag, text, error: null };
      }

      if ([429, 500, 502, 503, 504].includes(status) && attempt <= retries) {
        await sleep(500 * attempt);
        continue;
      }

      return { url, status, ok: false, etag, text: null, error: `HTTP ${status}` };
    } catch (error) {
      lastError = (error as Error).message;
      if (attempt <= retries) {
        await sleep(500 * attempt);
        continue;
      }
    }
  }

  return { url, status: 0, ok: false, etag: null, text: null, error: lastError };
}
