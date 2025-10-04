import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "../mocks/products";
import { useCart } from "../store/cart";

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-2xl border bg-white p-4">
      <Link to={`/p/${product.slug}`}>
        <img src={product.image} alt={product.title} className="h-40 w-full rounded-lg object-cover mb-3" />
        <div className="font-medium line-clamp-1">{product.title}</div>
        <div className="mt-1 text-gray-500">${(product.price/100).toFixed(2)}</div>
      </Link>
      <button
        onClick={()=>dispatch({ type:"add", product })}
        className="mt-3 w-full rounded-xl bg-black py-2 text-white"
      >
        Add to Cart
      </button>
    </motion.div>
  );
}
