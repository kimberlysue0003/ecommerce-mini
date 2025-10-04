export default function Filters({ onApply }: { onApply?: (min?: number, max?: number)=>void }) {
  let minInput: HTMLInputElement | null = null;
  let maxInput: HTMLInputElement | null = null;

  return (
    <div className="rounded-xl border bg-white p-4 sticky top-28">
      <div className="font-medium mb-3">Filters</div>
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <div className="text-gray-500">Price (USD)</div>
          <div className="flex items-center gap-2">
            <input ref={r=>minInput=r!} placeholder="Min" className="w-20 rounded border px-2 py-1" />
            <span>—</span>
            <input ref={r=>maxInput=r!} placeholder="Max" className="w-20 rounded border px-2 py-1" />
            <button
              onClick={()=>onApply?.(minInput?.value?+minInput!.value:undefined, maxInput?.value?+maxInput!.value:undefined)}
              className="ml-2 rounded bg-black text-white px-2 py-1"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
