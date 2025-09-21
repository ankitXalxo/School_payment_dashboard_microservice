import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "../api/apiClient";

export default function Filters({
  initialStatus = [],
  initialSchools = [],
  initialStartDate = "",
  initialEndDate = "",
  initialSearch = "",
  onApply,
}) {
  const statusOptions = [
    { value: "success", label: "Success" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  const [status, setStatus] = useState(
    initialStatus.map((s) => ({ value: s, label: s }))
  );
  const [schools, setSchools] = useState(
    initialSchools.map((s) => ({ value: s, label: s }))
  );
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [q, setQ] = useState(initialSearch);
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
        const options = uniqueSchoolIds.map((schoolId) => ({
          value: schoolId,
          label: schoolId, // You can modify this if you have school names
        }));

        if (mounted) {
          setSchoolOptions(options);
          console.log("School options from transactions:", options);
        }
      } catch (error) {
        console.error("Error loading schools from transactions:", error);
        if (mounted) {
          setSchoolOptions([]);
        }
      } finally {
        if (mounted) setLoadingSchools(false);
      }
    }

    loadSchoolsFromTransactions();
    return () => {
      mounted = false;
    };
  }, []);

  function handleApply() {
    onApply({
      status: status.map((s) => s.value),
      schools: schools.map((s) => s.value),
      startDate,
      endDate,
      q,
    });
  }

  // Custom styles for React Select to work with dark mode
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgb(255 255 255 / var(--tw-bg-opacity, 1))",
      borderColor: "rgb(209 213 219 / var(--tw-border-opacity, 1))",
      color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
      ":hover": {
        borderColor: "rgb(156 163 175 / var(--tw-border-opacity, 1))",
      },
      "&:dark": {
        backgroundColor: "rgb(31 41 55 / var(--tw-bg-opacity, 1))",
        borderColor: "rgb(75 85 99 / var(--tw-border-opacity, 1))",
        color: "rgb(243 244 246 / var(--tw-text-opacity, 1))",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(255 255 255 / var(--tw-bg-opacity, 1))",
      color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
      "&:dark": {
        backgroundColor: "rgb(31 41 55 / var(--tw-bg-opacity, 1))",
        color: "rgb(243 244 246 / var(--tw-text-opacity, 1))",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgb(243 244 246 / var(--tw-bg-opacity, 1))"
        : "rgb(255 255 255 / var(--tw-bg-opacity, 1))",
      color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
      "&:dark": {
        backgroundColor: state.isFocused
          ? "rgb(55 65 81 / var(--tw-bg-opacity, 1))"
          : "rgb(31 41 55 / var(--tw-bg-opacity, 1))",
        color: "rgb(243 244 246 / var(--tw-text-opacity, 1))",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
      "&:dark": {
        color: "rgb(243 244 246 / var(--tw-text-opacity, 1))",
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "rgb(243 244 246 / var(--tw-bg-opacity, 1))",
      "&:dark": {
        backgroundColor: "rgb(55 65 81 / var(--tw-bg-opacity, 1))",
      },
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
      "&:dark": {
        color: "rgb(243 244 246 / var(--tw-text-opacity, 1))",
      },
    }),
    input: (base) => ({
      ...base,
      color: "rgb(17 24 39 / var(--tw-text-opacity, 1))",
      "&:dark": {
        color: "rgb(243 244 246 / var(--tw-text-opacity, 1))",
      },
    }),
  };

  return (
    <div className="p-4 transition-colors duration-300 bg-white rounded-md shadow-sm dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="p-2 text-gray-900 placeholder-gray-500 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          placeholder="Search (collect_id, custom_order_id...)"
        />

        <Select
          isMulti
          value={status}
          onChange={setStatus}
          options={statusOptions}
          placeholder="Status"
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        <Select
          isMulti
          value={schools}
          onChange={setSchools}
          options={schoolOptions}
          placeholder="Schools"
          isClearable
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 p-2 text-gray-900 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 p-2 text-gray-900 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleApply}
          className="px-4 py-2 text-white transition-colors duration-300 bg-blue-600 rounded dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setStatus([]);
            setSchools([]);
            setStartDate("");
            setEndDate("");
            setQ("");
            onApply({
              status: [],
              schools: [],
              startDate: "",
              endDate: "",
              q: "",
            });
          }}
          className="px-4 py-2 transition-colors duration-300 bg-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
