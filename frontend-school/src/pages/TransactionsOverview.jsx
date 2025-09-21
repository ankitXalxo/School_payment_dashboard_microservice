import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/apiClient";
import TransactionsTable from "../components/TransactionsTable";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";

const DEFAULT_LIMIT = 20;

function parseArrayParam(param) {
  if (!param) return [];
  if (Array.isArray(param)) return param;
  return String(param).split(",").filter(Boolean);
}

export default function TransactionsOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = parseInt(searchParams.get("limit"), 10) || DEFAULT_LIMIT;
  const sort = searchParams.get("sort") || "payment_time";
  const order = searchParams.get("order") || "desc";
  const statusFilters = parseArrayParam(searchParams.get("status"));
  const schoolFilters = parseArrayParam(searchParams.get("school_id"));
  const startDate = searchParams.get("dateFrom") || "";
  const endDate = searchParams.get("dateTo") || "";
  const search = searchParams.get("q") || "";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          sort,
          order,
          status: statusFilters.length ? statusFilters.join(",") : undefined,
          school_id: schoolFilters.length ? schoolFilters.join(",") : undefined,
          dateFrom: startDate || undefined,
          dateTo: endDate || undefined,
          q: search || undefined,
        };
        const resp = await api.get("/transactions", { params });

        // Map backend fields including latestStatus to top-level fields
        const rows = (resp.data.data ?? resp.data.rows ?? resp.data).map(
          (r) => ({
            collectId: r.collect_id ?? r.latestStatus?.collect_id,
            orderAmount: r.order_amount ?? r.latestStatus?.order_amount,
            transactionAmount:
              r.transaction_amount ?? r.latestStatus?.transaction_amount,
            status: r.status ?? r.latestStatus?.status,
            paymentTime: r.payment_time ?? r.latestStatus?.payment_time,
            gateway: r.gateway ?? r.gateway_name,
            customOrderId: r.custom_order_id,
            schoolId: r.school_id,
          })
        );

        const total = resp.data.total ?? resp.data.totalCount ?? rows.length;
        if (mounted) setData({ rows, total });
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [
    page,
    limit,
    sort,
    order,
    statusFilters.join(","),
    schoolFilters.join(","),
    startDate,
    endDate,
    search,
  ]);

  function updateQuery(newParams) {
    const merged = Object.assign(
      Object.fromEntries(searchParams.entries()),
      newParams
    );
    Object.keys(merged).forEach((k) => {
      if (merged[k] === undefined || merged[k] === null || merged[k] === "")
        delete merged[k];
    });
    setSearchParams(merged);
  }

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300 bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <div className="container p-4 mx-auto">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Transactions
        </h1>

        <Filters
          className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
          initialStatus={statusFilters}
          initialSchools={schoolFilters}
          initialStartDate={startDate}
          initialEndDate={endDate}
          initialSearch={search}
          onApply={(filters) => {
            const params = {
              page: 1,
              status: filters.status?.length
                ? filters.status.join(",")
                : undefined,
              school_id: filters.schools?.length
                ? filters.schools.join(",")
                : undefined,
              dateFrom: filters.startDate || undefined,
              dateTo: filters.endDate || undefined,
              q: filters.q || undefined,
            };
            updateQuery(params);
          }}
        />

        <div className="mt-4">
          <TransactionsTable
            className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
            loading={loading}
            rows={data.rows}
            sort={sort}
            order={order}
            onSortChange={(field) => {
              const newOrder =
                sort === field && order === "asc" ? "desc" : "asc";
              updateQuery({ sort: field, order: newOrder, page: 1 });
            }}
          />
        </div>

        <div className="mt-4">
          <Pagination
            className="text-gray-900 bg-white dark:bg-gray-800 dark:text-gray-100"
            page={page}
            limit={limit}
            total={data.total}
            onChange={(newPage) => updateQuery({ page: newPage })}
            onLimitChange={(newLimit) =>
              updateQuery({ limit: newLimit, page: 1 })
            }
          />
        </div>
      </div>
    </div>
  );
}
