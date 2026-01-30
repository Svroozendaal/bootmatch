import * as cheerio from "cheerio";

export function loadHtml(html: string) {
  return cheerio.load(html);
}

export function getText($: cheerio.CheerioAPI, selector: string) {
  const node = $(selector).first();
  return node.text().trim() || null;
}

export function extractTableSpecs($: cheerio.CheerioAPI) {
  const specs: Record<string, string> = {};
  $("table tr").each((_, row) => {
    const cells = $(row).find("th, td");
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim();
      const value = $(cells[1]).text().trim();
      if (key && value) specs[key] = value;
    }
  });

  $("dl").each((_, list) => {
    const terms = $(list).find("dt");
    const defs = $(list).find("dd");
    terms.each((index, term) => {
      const key = $(term).text().trim();
      const value = $(defs[index]).text().trim();
      if (key && value) specs[key] = value;
    });
  });

  return Object.keys(specs).length ? specs : null;
}
