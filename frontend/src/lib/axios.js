import axios from "axios";

// Prefer explicit env override if provided
const envBase = import.meta.env?.VITE_BACKEND_URL;

// Fixed production API endpoint (Render)
const PROD_BASE = "https://qikmeet.onrender.com/api";
// Local dev API endpoint - ensure /api suffix
const DEV_BASE = "http://localhost:5001/api";

// Resolve base URL: env override > production > development
const baseURL = envBase || (import.meta.env.PROD ? PROD_BASE : DEV_BASE);

console.log("[Axios] Using baseURL:", baseURL); // Debug log

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);
