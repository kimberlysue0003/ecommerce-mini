// src/components/Filters.tsx
// Price filter with safe typed refs. Call onApply(minUSD?, maxUSD?) in whole dollars.

import { useRef } from "react";

type Props = {
  // onApply expects dollar values (integers) or undefined
  onApply?: (min?: number, max?: number) => void;
};

export default function Filters({ onApply }: Props) {
  // Use object refs instead of callback refs to avoid TS/strict-mode issues
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  const apply = () => {
    const minStr = minRef.current?.value.trim() ?? "";
    const maxStr = maxRef.current?.value.trim() ?? "";

    // Parse numbers; empty string → undefined
    const min = minStr !== "" ? Number(minStr) : undefined;
    const max = maxStr !== "" ? Number(maxStr) : undefined;

    // Guard against NaN
    const minSafe = typeof min === "number" && isFinite(min) ? min : undefined;
    const maxSafe = typeof max === "number" && isFinite(max) ? max : undefined;

    onApply?.(minSafe, maxSafe);
  };

  const clear = () => {
    if (minRef.current) minRef.current.value = "";
    if (maxRef.current) maxRef.current.value = "";
    onApply?.(undefined, undefined);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") apply();
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-lg border lg:border-0 lg:bg-transparent lg:p-0">
      <div className="font-semibold text-sm lg:text-base">Price Filter</div>

      <div className="flex items-center gap-2">
        <input
          ref={minRef}
          type="number"
          inputMode="numeric"
          placeholder="Min"
          className="flex-1 lg:w-24 lg:flex-none rounded border px-3 py-2 text-sm"
          onKeyDown={onKeyDown}
        />
        <span className="text-gray-400">—</span>
        <input
          ref={maxRef}
          type="number"
          inputMode="numeric"
          placeholder="Max"
          className="flex-1 lg:w-24 lg:flex-none rounded border px-3 py-2 text-sm"
          onKeyDown={onKeyDown}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="flex-1 lg:flex-none rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800">
          Apply
        </button>
        <button onClick={clear} className="flex-1 lg:flex-none rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Clear
        </button>
      </div>
    </div>
  );
}
