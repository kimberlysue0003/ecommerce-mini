import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import AISearchBar from "./AISearchBar";
import { useCart } from "../store/cart";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-xl">
          mini.shop
        </motion.div>
        <div className="flex-1" />
        <button className="relative rounded-full p-2 hover:bg-gray-100" onClick={()=>setOpen(true)}>
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 text-xs bg-black text-white rounded-full h-5 w-5 grid place-items-center">
            {count}
          </span>
        </button>
      </div>
      <div className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-3">
        </div>
      </div>

      <CartDrawer open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
