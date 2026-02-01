export type FixturesReadmeOptions = {
  siteKey: string;
  siteName: string;
};

export function fixturesReadmeTemplate(options: FixturesReadmeOptions) {
  return `# Fixtures for ${options.siteName}

Add 2-5 real product HTML pages here.

## How to gather fixtures
1) Pick product pages that include last width and flex.
2) Save the raw HTML to:
   - product1.html
   - product2.html
3) Update \`tests/${options.siteKey}.parse.test.ts\` expectations to match the fixtures.

Keep fixtures small and remove large scripts if needed.
`;
}
