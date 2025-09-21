import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  baseURL:
    `${import.meta.env.VITE_API_BASE_URL}/api` || "http://localhost:4000/api",
  timeout: 20000,
});

api.interceptors.request.use(
  (cfg) => {
    const token =
      localStorage.getItem("token") || import.meta.env.VITE_DEV_TOKEN;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (err) => Promise.reject(err)
);

export default api;
