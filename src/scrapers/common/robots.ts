const robotsCache = new Map<string, string[]>();

function parseRobots(body: string) {
  const lines = body.split(/\r?\n/).map((line) => line.trim());
  const disallows: string[] = [];
  let applies = false;

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const [key, rawValue] = line.split(":", 2).map((part) => part.trim());
    if (!key) continue;
    if (key.toLowerCase() === "user-agent") {
      applies = rawValue === "*";
    }
    if (applies && key.toLowerCase() === "disallow") {
      disallows.push(rawValue || "/");
    }
  }

  return disallows;
}

export async function isAllowedByRobots(url: string) {
  const target = new URL(url);
  if (target.protocol === "file:") return true;

  const host = target.origin;
  if (robotsCache.has(host)) {
    return !robotsCache.get(host)!.some((path) => target.pathname.startsWith(path));
  }

  try {
    const res = await fetch(`${host}/robots.txt`, {
      headers: { "User-Agent": "BootMatchBot/0.1 (+contact: dev@local)" }
    });
    if (!res.ok) {
      robotsCache.set(host, []);
      return true;
    }
    const text = await res.text();
    const disallows = parseRobots(text);
    robotsCache.set(host, disallows);
    return !disallows.some((path) => target.pathname.startsWith(path));
  } catch {
    robotsCache.set(host, []);
    return true;
  }
}
