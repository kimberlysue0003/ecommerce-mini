import { useState } from "react";
import { Search } from "lucide-react";

export default function AISearchBar({ onSearch }: { onSearch?: (q: string)=>void }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-gray-50 px-4 py-2">
      <Search className="h-5 w-5" />
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        onKeyDown={(e)=>{ if (e.key === "Enter") onSearch?.(q) }}
        placeholder="e.g. bluetooth headphones under $100 / keyboard 300-600"
        className="flex-1 bg-transparent outline-none"
      />
      <button onClick={()=>onSearch?.(q)} className="rounded-lg bg-black px-3 py-1.5 text-white">
        Search
      </button>
    </div>
  );
}
