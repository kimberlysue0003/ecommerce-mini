import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AISearchBar from "../components/AISearchBar";
import ActiveChips from "../components/ActiveChips";
import { getProducts, aiSearchProducts } from "../services/productService";
import type { Product } from "../types";

export default function Home() {
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let results: Product[];

        // Use AI search if there's a query, otherwise get all products with filters
        if (q.trim()) {
          results = await aiSearchProducts(q);
        } else {
          results = await getProducts({
            minPrice: priceMin,
            maxPrice: priceMax,
            limit: 50,
          });
        }

        setProducts(results);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [q, priceMin, priceMax]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <aside className="hidden lg:block lg:col-span-3">
        <Filters onApply={(min,max)=>{ setPriceMin(min); setPriceMax(max); }} />
      </aside>

      {/* Main content */}
      <section className="lg:col-span-9 space-y-4">
        <AISearchBar onSearch={setQ} />

        {/* Mobile filter - Show on small screens */}
        <div className="lg:hidden">
          <Filters onApply={(min,max)=>{ setPriceMin(min); setPriceMax(max); }} />
        </div>

        <ActiveChips
          q={q}
          priceMin={priceMin}
          priceMax={priceMax}
          onClearQ={() => setQ("")}
          onClearPrice={() => {
            setPriceMin(undefined);
            setPriceMax(undefined);
          }}
        />
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading products...
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No results found.</div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
