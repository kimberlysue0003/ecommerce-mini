export type QueryFilters = {
  text?: string;       // keywords (lowercased)
  priceMin?: number;   // cents
  priceMax?: number;   // cents
};

function dollarsToCents(s: string | number) {
  const n = typeof s === "number" ? s : parseFloat(String(s).replace(/[^0-9.]/g, ""));
  return Math.round((isNaN(n) ? 0 : n) * 100);
}

export function parseQuery(q: string): QueryFilters {
  const res: QueryFilters = {};
  if (!q) return res;
  const s = q.toLowerCase().trim();

  // range: $300-600 / 300 – 600 / 300 ~ 600 / between 300 and 600
  const between = s.match(/between\s+(\$?\d+(?:\.\d+)?)\s+(?:and|to|-)\s+(\$?\d+(?:\.\d+)?)/);
  const range   = s.match(/(\$?\d+(?:\.\d+)?)\s*[-–~]\s*(\$?\d+(?:\.\d+)?)/);
  if (between) {
    res.priceMin = dollarsToCents(between[1]);
    res.priceMax = dollarsToCents(between[2]);
  } else if (range) {
    res.priceMin = dollarsToCents(range[1]);
    res.priceMax = dollarsToCents(range[2]);
  }

  // upper bound: under/below/less than
  const under = s.match(/(?:under|below|less\s+than)\s+\$?(\d+(?:\.\d+)?)/);
  if (under) res.priceMax = dollarsToCents(under[1]);

  // lower bound: over/above/more than
  const over = s.match(/(?:over|above|more\s+than)\s+\$?(\d+(?:\.\d+)?)/);
  if (over) res.priceMin = dollarsToCents(over[1]);

  // strip numbers and price words to get keywords
  const text = s
    .replace(/\$?\d+(?:\.\d+)?/g, " ")
    .replace(/\b(under|below|less than|over|above|more than|between|and|to|from|under\s+|over\s+)\b/g, " ")
    .replace(/[-–~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text) res.text = text;
  return res;
}
