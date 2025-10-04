// src/lib/images.ts
// Product images with category-based matching, each product gets unique variant.

import type { Product } from "../types";
import { hash32 } from "./utils";

// Multiple images per category for variety
const CATEGORY_IMAGES: Record<string, string[]> = {
  headphones: [
    'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8000623/pexels-photo-8000623.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4916168/pexels-photo-4916168.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  keyboard: [
    'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4709367/pexels-photo-4709367.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/114907/pexels-photo-114907.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  mouse: [
    'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2148216/pexels-photo-2148216.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6044818/pexels-photo-6044818.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7948042/pexels-photo-7948042.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5632382/pexels-photo-5632382.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  monitor: [
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  speaker: [
    'https://images.pexels.com/photos/3394663/pexels-photo-3394663.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1279356/pexels-photo-1279356.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/164731/pexels-photo-164731.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  webcam: [
    'https://images.pexels.com/photos/4219861/pexels-photo-4219861.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/593322/pexels-photo-593322.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6069155/pexels-photo-6069155.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  microphone: [
    'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1279356/pexels-photo-1279356.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4226865/pexels-photo-4226865.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  chair: [
    'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/7511885/pexels-photo-7511885.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  desk: [
    'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  laptop: [
    'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  technology: [
    'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

// Extract main category keyword from product title and tags
function getCategoryKeyword(product: Product): string {
  const title = product.title.toLowerCase();
  const tags = product.tags?.join(' ').toLowerCase() || '';
  const combined = `${title} ${tags}`;

  // Priority categories for better image matching
  if (combined.includes('headphone') || combined.includes('headset')) return 'headphones';
  if (combined.includes('keyboard')) return 'keyboard';
  if (combined.includes('mouse')) return 'mouse';
  if (combined.includes('monitor') || combined.includes('display')) return 'monitor';
  if (combined.includes('speaker') || combined.includes('soundbar')) return 'speaker';
  if (combined.includes('webcam') || combined.includes('camera')) return 'webcam';
  if (combined.includes('microphone') || combined.includes('mic')) return 'microphone';
  if (combined.includes('chair')) return 'chair';
  if (combined.includes('desk')) return 'desk';
  if (combined.includes('laptop')) return 'laptop';

  return 'technology';
}

// Get unique image URL for a product (deterministic based on product ID)
function getCategoryImage(product: Product): string {
  const keyword = getCategoryKeyword(product);
  const images = CATEGORY_IMAGES[keyword] || CATEGORY_IMAGES.technology;

  // Use product ID string's character codes sum for better distribution
  const key = product.slug || product.id;
  let sum = 0;
  for (let i = 0; i < key.length; i++) {
    sum += key.charCodeAt(i) * (i + 1); // Multiply by position for more variation
  }
  const index = sum % images.length;

  return images[index];
}

// Return ordered sources for <SmartImage>: category image → local placeholder
export function productImageSources(product: Product): string[] {
  return [getCategoryImage(product), "/images/placeholder.jpg"];
}

export function productThumbSources(product: Product): string[] {
  return [getCategoryImage(product), "/images/placeholder.jpg"];
}
