// src/lib/images.ts
// Single-source consistency with deterministic Picsum URLs.
// Fallback: local placeholder to avoid broken images in restricted networks.

import type { Product } from "../types";
import { hash32 } from "./utils";

// Build a seeded Picsum URL for a given size
function picsum(seed: number, w: number, h: number) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// Return ordered sources for <SmartImage>: picsum → local placeholder
export function productImageSources(product: Product, w = 1200, h = 900): string[] {
  const key = product.slug || product.id;
  const seed = hash32(key) % 1_000_000;
  return [picsum(seed, w, h), "/images/placeholder.jpg"];
}

export function productThumbSources(product: Product): string[] {
  const key = product.slug || product.id;
  const seed = hash32(key) % 1_000_000;
  return [picsum(seed, 800, 600), "/images/placeholder.jpg"];
}
