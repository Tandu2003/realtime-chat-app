import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:6789",
  withCredentials: true,
});

export default axiosInstance;
