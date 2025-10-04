// src/pages/ProductDetail.tsx
// Full file. Detail hero uses the SAME source list as cards (consistent by seed).
// Similar products remain the same (tags/keywords + price proximity + rating).

import { useParams, Link } from "react-router-dom";
import { products, type Product } from "../mocks/products";
import ProductCard from "../components/ProductCard";
import SmartImage from "../components/SmartImage";
import { productImageSources } from "../lib/images";
import { useCart } from "../store/cart";

/* ------------------------ similarity helpers ------------------------ */

const SYNONYMS: Record<string, string[]> = {
  headphones: ["headset", "earphone", "audio"],
  headset: ["headphones", "earphone", "audio"],
  bluetooth: ["wireless"],
  wireless: ["bluetooth"],
  keyboard: ["kb", "keyboards"],
  mechanical: ["mech"],
  mouse: ["mice", "pointer"],
  speaker: ["soundbar", "audio"],
  soundbar: ["speaker", "audio"],
  webcam: ["camera", "video"],
  microphone: ["mic", "audio"],
  mic: ["microphone", "audio"],
  monitor: ["display", "screen"],
  display: ["monitor", "screen"],
  screen: ["monitor", "display"],
  chair: ["office", "ergonomic"],
  ergonomic: ["chair", "office"],
  office: ["chair", "ergonomic"],
};

function tokenize(p: Product): string[] {
  return [
    ...p.tags.map((t) => t.toLowerCase()),
    ...p.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
  ];
}

function expandTokens(tokens: string[]): Set<string> {
  const set = new Set<string>();
  for (const t of tokens) {
    set.add(t);
    (SYNONYMS[t] || []).forEach((s) => set.add(s));
  }
  return set;
}

function similarity(a: Product, b: Product): number {
  const ea = expandTokens(tokenize(a));
  const eb = expandTokens(tokenize(b));

  let overlap = 0;
  for (const t of ea) if (eb.has(t)) overlap++;

  // Price proximity (cents → ~$500 window gives up to +2)
  const priceGap = Math.abs(a.price - b.price);
  const priceBoost = Math.max(0, 2 - priceGap / 50000);

  // Small rating preference
  const ratingBoost = (b.rating - 3.5) * 0.3;

  return overlap + priceBoost + ratingBoost;
}

function getSimilarProducts(source: Product, pool: Product[], topN = 4): Product[] {
  return pool
    .filter((p) => p.id !== source.id)
    .map((p) => ({ p, score: similarity(source, p) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, topN)
    .map((x) => x.p);
}

/* ----------------------------- component ---------------------------- */

export default function ProductDetail() {
  const { slug } = useParams();
  const { dispatch } = useCart();

  const product = products.find((p) => p.slug === slug);
  if (!product) return <div>Product not found.</div>;

  // SAME deterministic source list as cards (picsum → placeholder)
  const heroSources = productImageSources(product);

  const similar = getSimilarProducts(product, products, 4);

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <div className="grid grid-cols-12 gap-8">
        <SmartImage
          sources={heroSources}
          alt={product.title}
          className="col-span-6 rounded-xl object-cover w-full h-[360px]"
          loading="lazy"
        />
        <div className="col-span-6">
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="text-gray-500 mt-2">${(product.price / 100).toFixed(2)}</p>

          <button
            className="mt-6 rounded-xl bg-black px-4 py-2 text-white"
            onClick={() => {
              dispatch({ type: "add", product });
              alert("Added to cart");
            }}
          >
            Add to Cart
          </button>

          <div className="mt-4 text-sm text-gray-500">
            Tags: {product.tags.join(", ")} · Stock: {product.stock} · Rating:{" "}
            {product.rating.toFixed(1)}
          </div>

          <Link to="/" className="inline-block mt-4 text-blue-600">
            Back to catalog
          </Link>
        </div>
      </div>

      {/* Similar products */}
      <div>
        <h2 className="font-semibold mb-4">Similar products</h2>
        <div className="grid grid-cols-4 gap-6">
          {similar.length ? (
            similar.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="text-gray-500">No recommendations.</div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Recommendations are based on overlapping tags/keywords, price proximity, and rating. Images
          use deterministic seeded Picsum with a local placeholder fallback for reliability.
        </p>
      </div>
    </div>
  );
}
