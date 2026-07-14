/** Catalog — keep in sync with build-pages.mjs book list */

export const BOOK_PRICE = Number(process.env.BOOK_PRICE || 499);

export const books = [
  {
    slug: "dont-wait",
    title: "Don't Wait Until You're Sick",
    blurb: "A practical guide to preventive healthcare for every African family.",
  },
  {
    slug: "ai-powered-african",
    title: "The AI-Powered African",
    blurb: "How artificial intelligence is transforming healthcare across the continent.",
  },
  {
    slug: "prevention-blueprint",
    title: "The Prevention Blueprint",
    blurb: "Your step-by-step guide to staying healthy and avoiding disease.",
  },
  {
    slug: "healthy-living",
    title: "Healthy Living Simplified",
    blurb: "Evidence-based wellness for everyday life, made simple.",
  },
];

export function getBook(slug) {
  return books.find((b) => b.slug === slug) || null;
}

export function listBooks() {
  return books.map((b) => ({ ...b, price: BOOK_PRICE, currency: "KES" }));
}
