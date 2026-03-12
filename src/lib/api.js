import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const fileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL.replace(/\/api$/, "")}${url}`;
};
