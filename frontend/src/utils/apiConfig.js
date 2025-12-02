/** @format */

import axios from "axios";

// Đây là "Cầu nối" đến Router Backend của bạn
const api = axios.create({
  // Đảm bảo cổng 5000 trùng với cổng server backend của bạn đang chạy
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gửi kèm Token đăng nhập (nếu có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Lấy token từ bộ nhớ trình duyệt
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
