// src/components/CartDrawer.tsx
// Drawer for the cart that matches current store shape: { product, quantity }.
// Uses reducer actions: add (delta +1), decrement, remove.
// Subtotal is computed locally; no "total" from context.
// Thumbnails use productThumbSources + <SmartImage>.

import { X } from "lucide-react";
import { useMemo } from "react";
import { useCart } from "../store/cart";
import SmartImage from "./SmartImage";
import { productThumbSources } from "../lib/images";

type Props = { open: boolean; onClose: () => void };

export default function CartDrawer({ open, onClose }: Props) {
  const { state, dispatch } = useCart();

  // items are { product, quantity }
  const items = Array.isArray(state?.items) ? state.items : [];

  const subtotalCents = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + Number(it.product?.price || 0) * Number(it.quantity || 0),
        0
      ),
    [items]
  );

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-[420px] max-w-[90vw] bg-white shadow-xl p-4 border-l
                    transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Cart"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Your Cart</div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
          {items.length === 0 && <div className="text-gray-500">Cart is empty.</div>}

          {items.map((it) => {
            const p = it.product;
            const sources = productThumbSources(p);
            return (
              <div key={p.id} className="flex gap-3 items-center border rounded-lg p-2">
                {/* thumbnail (with fallback) */}
                <SmartImage sources={sources} alt={p.title} className="h-14 w-14 rounded object-cover flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{p.title}</div>
                  <div className="text-sm text-gray-500">
                    ${(Number(p.price || 0) / 100).toFixed(2)}
                  </div>

                  {/* quantity controls */}
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      className="px-2 border rounded"
                      onClick={() => dispatch({ type: "decrement", productId: p.id })}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center">{it.quantity}</span>
                    <button
                      className="px-2 border rounded"
                      onClick={() => dispatch({ type: "add", product: p, delta: 1 })}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                    <button
                      className="ml-auto text-red-600 text-sm"
                      onClick={() => dispatch({ type: "remove", productId: p.id, id: p.id })}
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-lg font-semibold">${(subtotalCents / 100).toFixed(2)}</div>
          </div>
          <button
            className="w-full rounded-xl bg-black text-white py-2 disabled:opacity-60"
            onClick={() => alert(`Mock checkout: total $${(subtotalCents / 100).toFixed(2)}`)}
            disabled={items.length === 0}
          >
            Checkout (mock)
          </button>
        </div>
      </div>
    </div>
  );
}
