import { useState } from "react";
import { Search } from "lucide-react";

export default function AISearchBar({ onSearch }: { onSearch?: (q: string)=>void }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-gray-50 px-3 lg:px-4 py-2.5 lg:py-2">
      <Search className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 flex-shrink-0" />
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        onKeyDown={(e)=>{ if (e.key === "Enter") onSearch?.(q) }}
        placeholder="Search products..."
        className="flex-1 bg-transparent outline-none text-sm lg:text-base placeholder:text-gray-400"
      />
      <button onClick={()=>onSearch?.(q)} className="rounded-lg bg-black px-3 lg:px-4 py-1.5 text-white text-sm font-medium hover:bg-gray-800 flex-shrink-0">
        Search
      </button>
    </div>
  );
}
