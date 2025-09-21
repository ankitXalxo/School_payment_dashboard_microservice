import React from "react";

export default function Pagination({
  page = 1,
  limit = 20,
  total = 0,
  onChange,
  onLimitChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(1)}
          className="px-2 py-1 border rounded"
        >
          First
        </button>
        <button onClick={prev} className="px-2 py-1 border rounded">
          Prev
        </button>
        <span className="px-3">
          Page {page} of {totalPages}
        </span>
        <button onClick={next} className="px-2 py-1 border rounded">
          Next
        </button>
        <button
          onClick={() => onChange(totalPages)}
          className="px-2 py-1 border rounded"
        >
          Last
        </button>
      </div>

      <div>
        <label className="text-sm mr-2">Per page</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border rounded p-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
