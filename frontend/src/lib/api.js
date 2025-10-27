import { axiosInstance } from "./axios";

export const apiBaseURL = axiosInstance.defaults.baseURL;

export async function healthCheck() {
  try {
    const res = await axiosInstance.get("/health");
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: e?.response?.data || e.message };
  }
}
