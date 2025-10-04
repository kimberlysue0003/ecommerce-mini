// src/components/Navbar.tsx
// Navbar with body-portal cart drawer (no clipping), auto width, robust cart normalization.

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../store/cart";
import { products, type Product } from "../mocks/products";
import Portal from "./Portal";

type CartItem = { product: Product; quantity: number };

// FNV-1a for fallback ids
function hash32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

// Normalize multiple legacy shapes into { product, quantity }
function normalizeCartItems(raw: any[]): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];

  for (const it of raw) {
    if (!it) continue;
    const qn = Number(it.quantity ?? 1);
    const quantity = Number.isFinite(qn) && qn > 0 ? qn : 1;

    let p: any = it.product;
    const key = String(it.productId ?? it.id ?? (p ? p.id : "") ?? "");

    if (!p && key) {
      const found = products.find((x) => String(x.id) === key);
      if (found) p = found;
    }

    if (!p) {
      const title = String(it.title ?? it.name ?? "Item");
      const priceNum = Number(it.price ?? 0);
      const price = Number.isFinite(priceNum) && priceNum >= 0 ? priceNum : 0;
      const fallbackId = hash32(title + ":" + String(price) + ":" + Math.random().toString().slice(2)).toString();
      const id = key || fallbackId;

      p = {
        id,
        slug: String(it.slug ?? id),
        title,
        price,
        tags: Array.isArray(it.tags) ? it.tags : [],
        stock: Number.isFinite(it.stock) ? it.stock : 1,
        rating: Number.isFinite(it.rating) ? it.rating : 4.0,
        image: it.image,
      } as Product;
    } else {
      const ensuredId = String(p.id ?? (key || hash32(JSON.stringify(p)).toString()));
      const ensuredPrice = Number.isFinite(p.price) ? p.price : Number(it.price ?? 0);

      p = {
        ...p,
        id: ensuredId,
        slug: String(p.slug ?? p.id),
        title: String(p.title ?? it.title ?? it.name ?? "Item"),
        price: ensuredPrice,
        tags: Array.isArray(p.tags) ? p.tags : [],
        stock: Number.isFinite(p.stock) ? p.stock : 1,
        rating: Number.isFinite(p.rating) ? p.rating : 4.0,
      } as Product;
    }

    out.push({ product: p as Product, quantity });
  }

  return out;
}

export default function Navbar() {
  const BRAND = "MiniShop";
  const { state, dispatch } = useCart() as unknown as {
    state: { items: any[] };
    dispatch: (action: any) => void;
  };

  const items = useMemo(() => normalizeCartItems(state?.items ?? []), [state?.items]);
  const [open, setOpen] = useState(false);

  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, it) => sum + Number(it.product.price || 0) * it.quantity,
    0
  );
  const subtotal = subtotalCents / 100;

  // Drawer width auto grows with item count, clamped [360, 640], also capped to 90vw
  const drawerWidth = Math.min(640, Math.max(360, 320 + items.length * 24));

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-14 flex items-center justify-between">
            {/* Brand clickable */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-xl
                           bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500
                           shadow-sm ring-1 ring-black/10"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12h5M15 12h5" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 5v2M12 17v2M5 12a7 7 0 0 1 14 0" />
                </svg>
              </span>

              <span
                className="text-lg font-semibold tracking-tight
                           bg-clip-text text-transparent
                           bg-[linear-gradient(90deg,#0ea5e9,#22d3ee,#3b82f6)]
                           drop-shadow-[0_0_8px_rgba(59,130,246,0.15)]"
              >
                {BRAND}
              </span>

              <span className="ml-1 rounded-full border px-2 py-0.5 text-xs text-slate-600 bg-white/60">
                demo
              </span>
            </Link>

            {/* Cart button */}
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-1 rounded-lg border px-3 py-1.5
                         text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              🛒 Cart
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Portal the drawer to <body> to avoid any clipping from header/layout */}
      <Portal>
        <AnimatePresence>
          {open && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] bg-black"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="fixed right-0 top-0 bottom-0 z-[1000] bg-white border-l shadow-xl flex flex-col max-w-[90vw]"
                style={{ width: drawerWidth }}
                role="dialog"
                aria-label="Cart drawer"
              >
                {/* Header */}
                <div className="p-5 flex justify-between items-center border-b">
                  <h2 className="text-lg font-semibold">Your Cart</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                    aria-label="Close cart"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {items.length === 0 ? (
                    <div className="text-gray-500 text-sm">Your cart is empty.</div>
                  ) : (
                    items.map((it) => (
                    <div
                        key={it.product.id}
                        className="flex items-center justify-between border-b pb-3"
                    >
                        <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm leading-snug break-words">
                            {it.product.title || "Item"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            ${(Number(it.product.price || 0) / 100).toFixed(2)} × {it.quantity}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                            <button
                            onClick={() =>
                                dispatch({ type: "decrement", productId: it.product.id })
                            }
                            className="w-6 h-6 flex items-center justify-center rounded border text-sm hover:bg-gray-100"
                            >
                            −
                            </button>
                            <span className="w-6 text-center text-sm">{it.quantity}</span>
                            <button
                            onClick={() =>
                                dispatch({ type: "add", product: it.product, delta: 1 })
                            }
                            className="w-6 h-6 flex items-center justify-center rounded border text-sm hover:bg-gray-100"
                            >
                            +
                            </button>
                        </div>
                        </div>

                        {/* Remove button */}
                        <button
                        onClick={() =>
                            dispatch({
                            type: "remove",
                            productId: it.product.id,
                            id: it.product.id,
                            })
                        }
                        className="text-gray-400 hover:text-red-500 text-sm ml-2"
                        aria-label="Remove item"
                        >
                        ✕
                        </button>
                    </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="border-t p-5 space-y-3">
                    <div className="flex justify-between font-medium">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        alert("Checkout (mock)");
                        setOpen(false);
                      }}
                      className="w-full rounded-xl bg-black py-2 text-white"
                    >
                      Checkout
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
