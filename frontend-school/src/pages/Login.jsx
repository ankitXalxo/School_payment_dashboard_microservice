import React, { useState } from "react";
import api from "../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // LOGIN FLOW
        const res = await api.post("/auth/login", { email, password });
        const token = res.data.token || res.data.accessToken;
        if (token) {
          localStorage.setItem("token", token);
          navigate("/transactions");
        } else {
          setError("No token returned");
        }
      } else {
        // REGISTER FLOW
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await api.post("/auth/register", { name, email, password });
        alert("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl">{isLogin ? "Login" : "Register"}</h2>
      {error && <div className="mb-2 text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLogin && (
          <input
            className="w-full p-2 border rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isLogin && (
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
              ? "Login"
              : "Register"}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        {isLogin ? (
          <p>
            Don’t have an account?{" "}
            <button
              onClick={() => setIsLogin(false)}
              className="text-blue-500 underline"
            >
              Register here
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              onClick={() => setIsLogin(true)}
              className="text-blue-500 underline"
            >
              Login here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
