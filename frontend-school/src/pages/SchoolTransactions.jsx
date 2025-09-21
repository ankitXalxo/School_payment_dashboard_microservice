import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import TransactionsTable from "../components/TransactionsTable";
import Select from "react-select";
import Pagination from "../components/Pagination";

const DEFAULT_LIMIT = 20;

export default function SchoolTransactions() {
  const [schools, setSchools] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sort, setSort] = useState("payment_time");
  const [order, setOrder] = useState("desc");
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSchoolsFromTransactions() {
      setLoadingSchools(true);
      try {
        // Get schools from transactions data
        const response = await api.get("/transactions", {
          params: { limit: 100 }, // Get enough records to find unique schools
        });

        const transactions =
          response.data.data ?? response.data.rows ?? response.data;

        // Extract unique school IDs from transactions
        const uniqueSchoolIds = Array.from(
          new Set(transactions.map((t) => t.school_id).filter(Boolean))
        );

        // Create options for the dropdown
        const schoolOptions = uniqueSchoolIds.map((schoolId) => ({
          value: schoolId,
          label: schoolId,
        }));

        if (mounted) {
          setSchools(schoolOptions);
          console.log("Available schools:", schoolOptions);
        }
      } catch (error) {
        console.error("Error loading schools:", error);
      } finally {
        if (mounted) setLoadingSchools(false);
      }
    }

    loadSchoolsFromTransactions();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) {
      setRows([]);
      setTotal(0);
      return;
    }

    let mounted = true;

    async function loadTransactions() {
      setLoading(true);
      try {
        const params = { page, limit, sort, order };
        const res = await api.get(
          `/transactions/school/${encodeURIComponent(selected.value)}`,
          { params }
        );

        console.log("School transactions response:", res.data);

        // Map backend fields including latestStatus to top-level fields
        const fetchedRows = (res.data.data ?? res.data.rows ?? res.data).map(
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

        const totalCount =
          res.data.total ?? res.data.totalCount ?? fetchedRows.length;
        if (mounted) {
          setRows(fetchedRows);
          setTotal(totalCount);
        }
      } catch (e) {
        console.error("Error loading school transactions:", e);
        if (mounted) {
          setRows([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTransactions();
    return () => {
      mounted = false;
    };
  }, [selected, page, limit, sort, order]);

  const handleSortChange = (field) => {
    const newOrder = sort === field && order === "asc" ? "desc" : "asc";
    setSort(field);
    setOrder(newOrder);
    setPage(1);
  };

  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300 bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <div className="container p-4 mx-auto">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Transactions by School
        </h1>

        <div className="mb-4">
          <Select
            options={schools}
            value={selected}
            onChange={(s) => {
              setSelected(s);
              setPage(1);
            }}
            placeholder={
              loadingSchools ? "Loading schools..." : "Select school"
            }
            isClearable
            isLoading={loadingSchools}
            className="text-gray-900"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "rgb(255 255 255 / var(--tw-bg-opacity, 1))",
                borderColor: "rgb(209 213 219 / var(--tw-border-opacity, 1))",
                color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
                ":hover": {
                  borderColor: "rgb(156 163 175 / var(--tw-border-opacity, 1))",
                },
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "rgb(255 255 255 / var(--tw-bg-opacity, 1))",
                color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? "rgb(243 244 246 / var(--tw-bg-opacity, 1))"
                  : "rgb(255 255 255 / var(--tw-bg-opacity, 1))",
                color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
              }),
              singleValue: (base) => ({
                ...base,
                color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
              }),
            }}
          />
        </div>

        {selected && (
          <>
            <TransactionsTable
              rows={rows}
              loading={loading}
              sort={sort}
              order={order}
              onSortChange={handleSortChange}
            />

            <div className="mt-4">
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onChange={setPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
