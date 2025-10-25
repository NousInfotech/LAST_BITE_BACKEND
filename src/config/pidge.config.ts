// pidge.config.ts
import axios, { AxiosInstance } from "axios";
import { config } from "./env.js";

let pidgeToken: string | null = null;

const BASE_URL = config.pidgeBaseUrl;

const pidgeAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function: Login and get token
const loginAndGetToken = async (): Promise<string> => {
  try {
    const response = await axios.post(`${BASE_URL}/v1.0/store/channel/vendor/login`, {
      username: config.pidgeUserName,
      password: config.pidgePassword,
    });
    
    const token = response.data?.data?.token;
    if (!token) throw new Error("Pidge login failed: No token received");
    pidgeToken = token;
    return token;
  } catch (error) {
    console.error("Pidge login failed:", error);
    throw error;
  }
};

// Interceptor: Add auth header
pidgeAxios.interceptors.request.use(
  async (req) => {
    if (!pidgeToken) {
      pidgeToken = await loginAndGetToken();
    }
    req.headers["Authorization"] = pidgeToken;
    return req;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Retry on 401 by refreshing token
pidgeAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      pidgeToken = await loginAndGetToken();
      originalRequest.headers["Authorization"] = pidgeToken;
      return pidgeAxios(originalRequest);
    }
    return Promise.reject(error);
  }
);

export { pidgeAxios };
