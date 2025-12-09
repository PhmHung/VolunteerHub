import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // ❌ Xóa adapter: 'fetch' để Service Worker cache được
  // adapter: 'fetch', 
});

// 1. Request Interceptor: Gắn Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Xử lý lỗi & Chặn HTML "lặp trang"
api.interceptors.response.use(
  (response) => {
    // --- CHỐT CHẶN QUAN TRỌNG ---
    // Nếu API trả về HTML (do Service Worker trả nhầm index.html khi lỗi)
    if (
      response.data && 
      typeof response.data === 'string' && 
      (response.data.includes('<!doctype html>') || response.data.includes('<html'))
    ) {
      console.error("⛔ Đã chặn HTML chui lọt vào API (Lỗi lặp trang)");
      return Promise.reject(new Error("API trả về HTML thay vì JSON"));
    }
    return response;
  },
  (error) => {
    // Xử lý 401 Unauthorized (Token hết hạn)
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth')) {
        window.location.href = '/';
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

// === CÁC API CON GIỮ NGUYÊN ===

export const approvalRequestApi = {
  getPendingRequests: () => api.get('/api/approval-requests/pending'),
  approveRequest: (requestId, adminNote = '') => api.patch(`/api/approval-requests/${requestId}/approve`, { adminNote }),
  rejectRequest: (requestId, adminNote = '') => api.patch(`/api/approval-requests/${requestId}/reject`, { adminNote }),
  getRequestById: (requestId) => api.get(`/api/approval-requests/${requestId}`),
};

export const registrationApi = {
  registerForEvent: (eventId) => api.post('/api/registrations', { eventId }),
  cancelRegistration: (registrationId) => api.delete(`/api/registrations/${registrationId}`),
  getMyRegistrations: () => api.get('/api/registrations/my-registrations'),
  getEventRegistrations: (eventId) => api.get(`/api/events/${eventId}/registrations`),
  acceptRegistration: (registrationId) => api.patch(`/api/registrations/${registrationId}/accept`),
  rejectRegistration: (registrationId, reason = '') => api.patch(`/api/registrations/${registrationId}/reject`, { reason }),
  getEventVolunteers: (eventId) => api.get(`/api/events/${eventId}/volunteers`),
};

export default api;