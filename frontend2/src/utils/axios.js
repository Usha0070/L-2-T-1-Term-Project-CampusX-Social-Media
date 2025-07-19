import axios from "axios";
import { getCurrentUserToken, clearCurrentUser } from "./auth";

const instance = axios.create({
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use((config) => {
  const token = getCurrentUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearCurrentUser();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
