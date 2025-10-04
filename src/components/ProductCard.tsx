// src/components/ProductCard.tsx
// Uses the same deterministic sources as the detail page to keep images consistent.

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "../mocks/products";
import { useCart } from "../store/cart";
import { productThumbSources } from "../lib/images";
import SmartImage from "./SmartImage";

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const sources = productThumbSources(product); // picsum → placeholder

  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl border bg-white p-4">
      <Link to={`/p/${product.slug}`}>
        <SmartImage
          sources={sources}
          alt={product.title}
          className="h-40 w-full rounded-lg object-cover mb-3"
          loading="lazy"
        />
        <div className="font-medium line-clamp-1">{product.title}</div>
        <div className="mt-1 text-gray-500">${(product.price / 100).toFixed(2)}</div>
      </Link>
      <button
        onClick={() => {
          // Cart item does not need to store image URLs; regenerate by id/slug on render.
          dispatch({ type: "add", product });
        }}
        className="mt-3 w-full rounded-xl bg-black py-2 text-white"
      >
        Add to Cart
      </button>
    </motion.div>
  );
}
