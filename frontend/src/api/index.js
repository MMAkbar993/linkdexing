import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

export const publicApi = axios.create({
  baseURL,
});

export const privateApi = axios.create({
  baseURL,
});

privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jxidwrtdy");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
