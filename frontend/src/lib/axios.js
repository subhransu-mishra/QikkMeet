import axios from "axios";

// Resolve backend base URL:
// - Use VITE_API_BASE if provided (set in .env.production for production)
// - In dev, default to http://localhost:5001/api
// - In production, MUST set VITE_API_BASE in .env.production to backend URL
const isProd = import.meta.env.MODE === "production";
const envBase = import.meta.env.VITE_API_BASE;
const defaultDevBase = "http://localhost:5001/api";

// In production, VITE_API_BASE must be set or this will fail
export const axiosInstance = axios.create({
  baseURL: envBase || defaultDevBase,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      // Don't redirect for auth status checks; let callers handle null user
      const isAuthMe = url.includes("/auth/me");
      if (!isAuthMe) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
