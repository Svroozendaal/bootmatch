import { exampleSource } from "./example";

export function getSource(name: string) {
  if (name === "example") return exampleSource;
  throw new Error(`Unknown source: ${name}`);
}
