import axios from "axios";

const envBase = import.meta.env?.VITE_BACKEND_URL;
const inferredBase =
  typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";

// Prefer explicit env; fallback to local dev, then inferred
const baseURL = envBase || "http://localhost:5001/api";

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
