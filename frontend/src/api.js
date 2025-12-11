/** @format */

import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired/invalid) - auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth page
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/auth")
      ) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export function fullUrl(path) {
  if (!path) return path;
  if (typeof path !== "string") return path;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

// === APPROVAL REQUEST APIs ===
export const approvalRequestApi = {
  // Lấy danh sách yêu cầu chờ duyệt
  getPendingRequests: () => api.get("/api/approval-requests/pending"),

  // Duyệt yêu cầu
  approveRequest: (requestId, adminNote = "") =>
    api.patch(`/api/approval-requests/${requestId}/approve`, { adminNote }),

  // Từ chối yêu cầu
  rejectRequest: (requestId, adminNote = "") =>
    api.patch(`/api/approval-requests/${requestId}/reject`, { adminNote }),

  // Xem chi tiết yêu cầu
  getRequestById: (requestId) => api.get(`/api/approval-requests/${requestId}`),
};

// === REGISTRATION APIs ===
export const registrationApi = {
  // Đăng ký sự kiện (tạo registration với status = pending)
  registerForEvent: (eventId) => api.post("/api/registrations", { eventId }),

  // Hủy đăng ký
  cancelRegistration: (registrationId) =>
    api.delete(`/api/registrations/${registrationId}`),

  // Lấy danh sách registrations của user
  getMyRegistrations: () => api.get("/api/registrations/my-registrations"),

  // [Manager/Admin] Lấy danh sách registrations của 1 event
  getEventRegistrations: (eventId) =>
    api.get(`/api/events/${eventId}/registrations`),

  // [Manager/Admin] Accept volunteer registration
  acceptRegistration: (registrationId) =>
    api.patch(`/api/registrations/${registrationId}/accept`),

  // [Manager/Admin] Reject volunteer registration
  rejectRegistration: (registrationId, reason = "") =>
    api.patch(`/api/registrations/${registrationId}/reject`, { reason }),

  // Lấy danh sách volunteers của event (chỉ khi đã accepted)
  getEventVolunteers: (eventId) => api.get(`/api/events/${eventId}/volunteers`),
};

export default api;
