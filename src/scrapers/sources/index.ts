import { exampleSource } from "./example";
import { evoSource } from "./evo";

export function getSource(name: string) {
  if (name === "example") return exampleSource;
  if (name === "evo") return evoSource;
  throw new Error(`Unknown source: ${name}`);
}
