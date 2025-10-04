// src/lib/utils.ts
// Shared utility functions

/**
 * FNV-1a 32-bit hash function - generates a stable numeric seed from a string
 */
export function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Format price from cents to USD string
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
