import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";
import { products } from "../mocks/products";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import AISearchBar from "../components/AISearchBar";
import { parseQuery } from "../lib/ai";
import ActiveChips from "../components/ActiveChips";

export default function Home() {
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();

  const filtered = useMemo(() => {
    const cond = parseQuery(q);
    const min = priceMin != null ? priceMin * 100 : cond.priceMin;
    const max = priceMax != null ? priceMax * 100 : cond.priceMax;
    const kw  = cond.text?.toLowerCase();

    return products.filter(p => {
      const okKW = !kw || p.title.toLowerCase().includes(kw) || p.tags.some(t => kw.includes(t));
      const okMin = min == null || p.price >= min;
      const okMax = max == null || p.price <= max;
      return okKW && okMin && okMax;
    });
  }, [q, priceMin, priceMax]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3">
        <Filters onApply={(min,max)=>{ setPriceMin(min); setPriceMax(max); }} />
      </aside>
      <section className="col-span-9 space-y-4">
        <AISearchBar onSearch={setQ} />
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
        <motion.div layout className="grid grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-gray-500">No results found.</div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
