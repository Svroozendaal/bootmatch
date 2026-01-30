import path from "path";
import { pathToFileURL } from "url";

export const sourceName = "example";

const fixtureNames = [
  "atomic-hawx-prime-100.html",
  "atomic-hawx-ultra-120.html",
  "salomon-s-pro-100.html",
  "tecnica-mach1-mv-120.html",
  "nordica-speedmachine-120.html",
  "lange-rx-120.html",
  "dalbello-panterra-120.html",
  "head-nexo-lyt-110.html",
  "fischer-rc4-curv-120.html",
  "head-edge-lyt-100.html"
];

export function getFixtureUrls() {
  return fixtureNames.map((name) => {
    const filePath = path.join(
      process.cwd(),
      "src",
      "scrapers",
      "sources",
      "example",
      "fixtures",
      name
    );
    return pathToFileURL(filePath).toString();
  });
}
