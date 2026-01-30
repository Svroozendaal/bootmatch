export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/grip\s*walk/g, "gw")
    .replace(/\//g, " ")
    .replace(/[\-_.:,;()\[\]{}]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
