export type IndexTemplateOptions = {
  camelName: string;
  pascalName: string;
};

export function indexTemplate(options: IndexTemplateOptions) {
  return `import { discover${options.pascalName} } from "./discover";
import { parse${options.pascalName} } from "./parse";
import { SITE_KEY } from "./config";

export const ${options.camelName}Source = {
  sourceName: SITE_KEY,
  discover: discover${options.pascalName},
  parse: parse${options.pascalName}
};
`;
}
