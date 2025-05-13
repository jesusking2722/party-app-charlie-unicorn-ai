// axiosInstance.ts
import { API_ENDPOINT } from "@/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("Authorization");
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to unwrap response.data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const setAuthToken = async (token: string | null) => {
  try {
    if (token) {
      await AsyncStorage.setItem("Authorization", token);
      axiosInstance.defaults.headers.common["Authorization"] = token;
    } else {
      await AsyncStorage.removeItem("Authorization");
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export default axiosInstance;
