import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

export function fullUrl(path) {
  if (!path) return path;
  if (typeof path !== "string") return path;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

// === APPROVAL REQUEST APIs ===
export const approvalRequestApi = {
  // Lấy danh sách yêu cầu chờ duyệt
  getPendingRequests: () => api.get('/api/approval-requests/pending'),
  
  // Duyệt yêu cầu
  approveRequest: (requestId, adminNote = '') => 
    api.patch(`/api/approval-requests/${requestId}/approve`, { adminNote }),
  
  // Từ chối yêu cầu
  rejectRequest: (requestId, adminNote = '') => 
    api.patch(`/api/approval-requests/${requestId}/reject`, { adminNote }),
  
  // Xem chi tiết yêu cầu
  getRequestById: (requestId) => 
    api.get(`/api/approval-requests/${requestId}`),
};

export default api;
