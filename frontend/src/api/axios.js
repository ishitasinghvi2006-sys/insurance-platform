import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    // Don't toast on 401 (handled by redirect) or validation errors (shown inline in forms)
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;