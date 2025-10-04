// src/components/ActiveChips.tsx
// Display active filter chips with clear buttons

type Chip = {
  label: string;
  onClose: () => void;
};

type Props = {
  q: string;
  priceMin?: number;
  priceMax?: number;
  onClearQ: () => void;
  onClearPrice: () => void;
};

export default function ActiveChips({
  q,
  priceMin,
  priceMax,
  onClearQ,
  onClearPrice,
}: Props) {
  const chips: Chip[] = [];

  if (q.trim()) {
    chips.push({ label: `Search: ${q.trim()}`, onClose: onClearQ });
  }

  if (priceMin != null || priceMax != null) {
    const a = priceMin != null ? `$${priceMin}` : "";
    const b = priceMax != null ? `$${priceMax}` : "";
    chips.push({ label: `Price: ${a}${a && b ? "-" : ""}${b}`, onClose: onClearPrice });
  }

  if (!chips.length) return null;

  return (
    <div className="flex gap-2 text-sm">
      {chips.map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
        >
          {c.label}
          <button className="text-gray-500 hover:text-black" onClick={c.onClose}>
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
