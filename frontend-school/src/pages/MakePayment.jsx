import { useState } from "react";
import axios from "axios";

// Accessing the environment variable using process.env
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://school-backend-qfki.onrender.com";

function MakePayment() {
  const [form, setForm] = useState({
    amount: "",
    name: "",
    id: "",
    email: "",
    trustee_id: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setMessage("");
    setIsError(false);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You must be logged in to make a payment");
        setIsError(true);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/orders/create-payment`,
        {
          amount: form.amount,
          student_info: {
            name: form.name,
            id: form.id,
            email: form.email,
          },
          trustee_id: form.trustee_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // attach JWT here
          },
        }
      );

      // Redirect to payment URL
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error(error);
      setMessage("Payment failed");
      setIsError(true);
    }
  };

  return (
    <div className="flex flex-col max-w-md gap-4 p-6 mx-auto transition-colors duration-300 bg-white shadow dark:bg-gray-800 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Make a Payment
      </h2>

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        className="p-2 text-gray-900 placeholder-gray-500 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
      <input
        type="text"
        name="name"
        placeholder="Student Name"
        value={form.name}
        onChange={handleChange}
        className="p-2 text-gray-900 placeholder-gray-500 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
      <input
        type="text"
        name="id"
        placeholder="Student ID"
        value={form.id}
        onChange={handleChange}
        className="p-2 text-gray-900 placeholder-gray-500 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
      <input
        type="email"
        name="email"
        placeholder="Student Email"
        value={form.email}
        onChange={handleChange}
        className="p-2 text-gray-900 placeholder-gray-500 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />
      <input
        type="text"
        name="trustee_id"
        placeholder="Trustee ID"
        value={form.trustee_id}
        onChange={handleChange}
        className="p-2 text-gray-900 placeholder-gray-500 transition-colors duration-300 bg-white border border-gray-300 rounded dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
      />

      <button
        onClick={handlePayment}
        className="px-4 py-2 text-white transition-colors duration-300 bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Pay Now
      </button>

      {message && (
        <p
          className={`mt-2 text-center text-sm ${
            isError ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default MakePayment;
