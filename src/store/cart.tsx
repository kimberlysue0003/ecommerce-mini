import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Product } from "../mocks/products";

type CartItem = { id: string; title: string; price: number; qty: number; image?: string };
type State = { items: CartItem[] };
type Action =
  | { type: "add"; product: Product }
  | { type: "inc"; id: string }
  | { type: "dec"; id: string }
  | { type: "remove"; id: string }
  | { type: "set"; state: State };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set": return action.state;
    case "add": {
      const idx = state.items.findIndex(i => i.id === action.product.id);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
        return { items };
      }
      return {
        items: [...state.items, {
          id: action.product.id,
          title: action.product.title,
          price: action.product.price,
          image: action.product.image,
          qty: 1
        }]
      };
    }
    case "inc": return { items: state.items.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i) };
    case "dec": return { items: state.items.map(i => i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i) };
    case "remove": return { items: state.items.filter(i => i.id !== action.id) };
    default: return state;
  }
}

const CartCtx = createContext<{
  state: State; dispatch: React.Dispatch<Action>; count: number; total: number;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // 读写 localStorage 实现前端持久化
  useEffect(() => {
    const raw = localStorage.getItem("mini.cart");
    if (raw) {
      try { dispatch({ type: "set", state: JSON.parse(raw) }); } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("mini.cart", JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const count = state.items.reduce((a,b)=>a+b.qty,0);
    const total = state.items.reduce((a,b)=>a+b.price*b.qty,0);
    return { state, dispatch, count, total };
  }, [state]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
