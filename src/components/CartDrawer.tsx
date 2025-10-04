import { useCart } from "../store/cart";
import { X } from "lucide-react";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: ()=>void }) {
  const { state, dispatch, total } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* 右侧抽屉 */}
      <div
        className={`absolute right-0 top-0 h-full w-[380px] bg-white shadow-xl p-4 transition-transform
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Your Cart</div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
          {state.items.length === 0 && <div className="text-gray-500">Cart is empty.</div>}
          {state.items.map(it => (
            <div key={it.id} className="flex gap-3 items-center border rounded-lg p-2">
              {it.image && <img src={it.image} className="h-14 w-14 rounded object-cover" />}
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{it.title}</div>
                <div className="text-sm text-gray-500">${(it.price/100).toFixed(2)}</div>
                <div className="mt-1 flex items-center gap-2">
                  <button className="px-2 border rounded" onClick={()=>dispatch({ type:"dec", id: it.id })}>-</button>
                  <span>{it.qty}</span>
                  <button className="px-2 border rounded" onClick={()=>dispatch({ type:"inc", id: it.id })}>+</button>
                  <button className="ml-auto text-red-600 text-sm" onClick={()=>dispatch({ type:"remove", id: it.id })}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-lg font-semibold">${(total/100).toFixed(2)}</div>
          </div>
          <button
            className="w-full rounded-xl bg-black text-white py-2"
            onClick={()=>alert(`Mock checkout: total $${(total/100).toFixed(2)}`)}
            disabled={state.items.length===0}
          >
            Checkout (mock)
          </button>
        </div>
      </div>
    </div>
  );
}