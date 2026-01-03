import axios from "axios";

// Resolve backend base URL:
// - Use VITE_API_BASE if provided
// - In dev, default to http://localhost:5001/api
// - In production, default to /api (same origin, served by backend)
const isProd = import.meta.env.MODE === "production";
const envBase = import.meta.env.VITE_API_BASE;
const defaultDevBase = "http://localhost:5001/api";
const defaultProdBase = "/api";

export const axiosInstance = axios.create({
  baseURL: envBase || (isProd ? defaultProdBase : defaultDevBase),
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
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
