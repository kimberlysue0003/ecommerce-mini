// src/lib/images.ts
// Single-source consistency with deterministic Picsum URLs.
// Fallback: local placeholder to avoid broken images in restricted networks.

import type { Product } from "../mocks/products";

// FNV-1a 32-bit hash to generate a stable numeric seed per product
function hash32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

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
