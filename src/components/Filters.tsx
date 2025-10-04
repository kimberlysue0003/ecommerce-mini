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
    <div className="space-y-3">
      <div className="font-semibold">Price</div>

      <div className="flex items-center gap-2">
        <input
          ref={minRef}
          type="number"
          inputMode="numeric"
          placeholder="Min"
          className="w-24 rounded border px-2 py-1"
          onKeyDown={onKeyDown}
        />
        <span>—</span>
        <input
          ref={maxRef}
          type="number"
          inputMode="numeric"
          placeholder="Max"
          className="w-24 rounded border px-2 py-1"
          onKeyDown={onKeyDown}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="rounded-md border px-3 py-1">
          Apply
        </button>
        <button onClick={clear} className="rounded-md px-3 py-1 text-gray-600 hover:bg-gray-100">
          Clear
        </button>
      </div>
    </div>
  );
}
