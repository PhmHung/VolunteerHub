/** @format */

<<<<<<< HEAD
// Re-export api from the main api.js file
// This file exists for compatibility with slices that import from utils/apiConfig
import api from "../api";
=======
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
>>>>>>> 7dbb5f79ed20ddf44f0480c441125ad7e1bbb718

export default api;
