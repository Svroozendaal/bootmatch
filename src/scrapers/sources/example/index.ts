import { discoverExample } from "./discover";
import { parseExample } from "./parse";
import { sourceName } from "./config";

export const exampleSource = {
  sourceName,
  discover: discoverExample,
  parse: parseExample
};
