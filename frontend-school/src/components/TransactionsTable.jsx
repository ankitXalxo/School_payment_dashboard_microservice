import React from "react";
import { format } from "date-fns";

export default function TransactionsTable({
  rows = [],
  loading,
  sort,
  order,
  onSortChange,
}) {
  const headers = [
    { key: "collectId", label: "Collect ID" },
    { key: "schoolId", label: "School ID" },
    { key: "gateway", label: "Gateway" },
    { key: "orderAmount", label: "Order Amount" },
    { key: "transactionAmount", label: "Transaction Amount" },
    { key: "status", label: "Status" },
    { key: "customOrderId", label: "Custom Order ID" },
    { key: "paymentTime", label: "Payment Time" },
  ];

  return (
    <div className="overflow-x-auto bg-white rounded-md shadow-sm dark:bg-gray-800">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                className="px-4 py-3 text-sm font-medium text-left text-gray-900 cursor-pointer select-none dark:text-gray-100"
                onClick={() => onSortChange(h.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{h.label}</span>
                  {sort === h.key && (
                    <span className="text-xs">
                      {order === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {loading ? (
            <tr>
              <td
                colSpan={headers.length}
                className="p-8 text-center text-gray-900 dark:text-gray-100"
              >
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="p-8 text-center text-gray-900 dark:text-gray-100"
              >
                No transactions
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.collectId ?? row.customOrderId}
                className="hover:shadow-md hover:-translate-y-0.5 transform transition bg-white dark:bg-gray-800"
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.collectId || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.schoolId || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.gateway || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.orderAmount || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.transactionAmount || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      row.status === "success"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : row.status === "failed"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {row.status || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.customOrderId || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {row.paymentTime
                    ? format(new Date(row.paymentTime), "yyyy-MM-dd HH:mm")
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
