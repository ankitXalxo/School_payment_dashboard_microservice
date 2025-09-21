import React, { useState } from "react";
import api from "../api/apiClient";

// ✅ helper to validate MongoDB ObjectId (24 hex characters)
function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

export default function TransactionStatus() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleCheck(e) {
    e.preventDefault();
    if (!id) {
      setError("Please enter an ID");
      return;
    }

    // ✅ Frontend validation before calling backend
    if (!isValidObjectId(id)) {
      setError("Invalid ID format. Must be a 24-character hex string.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.get(
        `/orders/check-status/${encodeURIComponent(id)}`
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Transaction Status Check</h1>

      <form onSubmit={handleCheck} className="flex gap-2 items-center mb-4">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter collect_id (24 hex chars)"
          className="p-2 border rounded w-full md:w-1/2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {result && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
