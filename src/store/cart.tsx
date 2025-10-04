// src/store/cart.tsx
// Cart context with quantity accumulation, decrement, remove, and clear.
// Persistent via localStorage. All comments in English.

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Product } from "../mocks/products";

export type CartItem = { product: Product; quantity: number };
export type CartState = { items: CartItem[] };

type AddAction = { type: "add"; product: Product; delta?: number };
type RemoveAction = { type: "remove"; productId?: string; id?: string };
type DecrementAction = { type: "decrement"; productId: string; by?: number };
type SetQtyAction = { type: "setQuantity"; productId: string; quantity: number };
type ClearAction = { type: "clear" };

type CartAction = AddAction | RemoveAction | DecrementAction | SetQtyAction | ClearAction;

const STORAGE_KEY = "mini-shop:cart";

function loadInitialState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) {
        // sanitize items
        const items = parsed.items
          .map((it: any) => {
            if (!it || !it.product) return null;
            const qty = Number(it.quantity ?? 1);
            const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
            return { product: it.product as Product, quantity } as CartItem;
          })
          .filter(Boolean) as CartItem[];
        return { items };
      }
    }
  } catch {}
  return { items: [] };
}

function saveState(state: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const delta = Number(action.delta ?? 1);
      const by = Number.isFinite(delta) && delta > 0 ? delta : 1;
      const id = action.product.id;

      const idx = state.items.findIndex((it) => it.product.id === id);
      if (idx >= 0) {
        // accumulate quantity
        const next = [...state.items];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + by };
        return { items: next };
      }
      return { items: [...state.items, { product: action.product, quantity: by }] };
    }

    case "decrement": {
      const by = Number(action.by ?? 1);
      const id = action.productId;
      if (!id) return state;
      const idx = state.items.findIndex((it) => it.product.id === id);
      if (idx < 0) return state;

      const nextQty = state.items[idx].quantity - (Number.isFinite(by) && by > 0 ? by : 1);
      if (nextQty <= 0) {
        // remove if goes to zero
        const next = state.items.filter((it) => it.product.id !== id);
        return { items: next };
      }
      const next = [...state.items];
      next[idx] = { ...next[idx], quantity: nextQty };
      return { items: next };
    }

    case "setQuantity": {
      const { productId, quantity } = action;
      if (!productId) return state;
      const q = Math.max(0, Math.floor(quantity));
      const idx = state.items.findIndex((it) => it.product.id === productId);
      if (idx < 0) return state;
      if (q === 0) {
        return { items: state.items.filter((it) => it.product.id !== productId) };
      }
      const next = [...state.items];
      next[idx] = { ...next[idx], quantity: q };
      return { items: next };
    }

    case "remove": {
      const id = action.productId ?? action.id;
      if (!id) return state;
      return { items: state.items.filter((it) => it.product.id !== String(id)) };
    }

    case "clear":
      return { items: [] };

    default:
      return state;
  }
}

const CartCtx = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined as unknown as CartState, loadInitialState);

  // persist on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
