import { normalize } from "./normalize";

export function tokenSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;

  if (na === nb) return 1;

  const aTokens = new Set(na.split(" "));
  const bTokens = new Set(nb.split(" "));
  let intersection = 0;

  for (const t of aTokens) {
    if (bTokens.has(t)) intersection += 1;
  }

  const union = new Set([...aTokens, ...bTokens]).size || 1;
  let score = intersection / union;

  if (na.includes(nb) || nb.includes(na)) {
    score += 0.15;
  }

  return Math.min(1, Math.max(0, score));
}
