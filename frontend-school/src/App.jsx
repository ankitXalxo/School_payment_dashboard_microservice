import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import TransactionsOverview from "./pages/TransactionsOverview";
import SchoolTransactions from "./pages/SchoolTransactions";
import StatusCheck from "./pages/StatusCheck";
import Login from "./pages/Login";
import MakePayment from "./pages/MakePayment";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/transactions" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/transactions" element={<TransactionsOverview />} />
        <Route path="/school" element={<SchoolTransactions />} />
        <Route path="/status-check" element={<StatusCheck />} />
        <Route path="/make-payment" element={<MakePayment />} />
        <Route path="*" element={<div className="p-6">404 - Not Found</div>} />
      </Routes>
    </Layout>
  );
}
