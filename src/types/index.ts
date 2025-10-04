// src/types/index.ts
// Centralized type definitions

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number; // in cents
  tags: string[];
  stock: number;
  rating: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};
