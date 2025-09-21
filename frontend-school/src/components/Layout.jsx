import React from "react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { useLogout } from "../utils/logout";

export default function Layout({ children }) {
  const logout = useLogout();
  return (
    <div className="min-h-screen text-gray-900 transition-colors duration-300 bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="transition-colors duration-300 bg-white shadow dark:bg-gray-800">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
          {/* Left - Logo & Navigation */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-gray-100"
            >
              Dashboard
            </Link>

            <nav className="flex gap-4">
              <Link
                to="/transactions"
                className="text-gray-900 transition-colors duration-300 dark:text-gray-200 hover:underline"
              >
                Transactions
              </Link>
              <Link
                to="/school"
                className="text-gray-900 transition-colors duration-300 dark:text-gray-200 hover:underline"
              >
                Transactions By School
              </Link>
              <Link
                to="/status-check"
                className="text-gray-900 transition-colors duration-300 dark:text-gray-200 hover:underline"
              >
                Status Check
              </Link>
              <Link
                to="/make-payment"
                className="text-gray-900 transition-colors duration-300 dark:text-gray-200 hover:underline"
              >
                Make Payment
              </Link>
            </nav>
          </div>

          {/* Right - Dark Mode Toggle & Logout */}
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <button
              onClick={logout}
              className="px-3 py-1 text-white transition-colors duration-300 bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 transition-colors duration-300">{children}</main>
    </div>
  );
}
