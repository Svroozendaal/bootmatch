import { SITE_KEY } from "./config";
import { discoverEvo } from "./discover";
import { parseEvo } from "./parse";

export const evoSource = {
  sourceName: SITE_KEY,
  discover: discoverEvo,
  parse: parseEvo
};
