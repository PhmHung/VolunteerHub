/** @format */

// =================================================================
// 1. EVENT STATUS (TRẠNG THÁI SỰ KIỆN)
// =================================================================
export const EVENT_STATUS = {
  PENDING: "pending", // Chờ Admin duyệt
  APPROVED: "approved", // Đã duyệt (Public)
  REJECTED: "rejected", // Bị từ chối
  CANCELLED: "cancelled", // Đã hủy
};

// =================================================================
// 2. REGISTRATION STATUS (TRẠNG THÁI ĐĂNG KÝ)
// =================================================================
export const REGISTRATION_STATUS = {
  WAITLISTED: "waitlisted", // Chờ Manager duyệt
  REGISTERED: "registered", // Đã tham gia (Manager đã duyệt)
  CANCELLED: "cancelled", // Đã hủy/Từ chối (Gộp chung)
};

// =================================================================
// 3. ATTENDANCE STATUS (TRẠNG THÁI ĐIỂM DANH)
// =================================================================
export const ATTENDANCE_STATUS = {
  IN_PROGRESS: "in-progress", // Sự kiện đang diễn ra
  COMPLETED: "completed", // Đã hoàn thành nhiệm vụ
  ABSENT: "absent", // Vắng mặt
};

// =================================================================
// 4. MAPPING HIỂN THỊ (LABEL TIẾNG VIỆT)
// =================================================================
export const STATUS_LABELS = {
  // Event
  [EVENT_STATUS.PENDING]: "Chờ duyệt",
  [EVENT_STATUS.APPROVED]: "Đang hoạt động",
  [EVENT_STATUS.REJECTED]: "Bị từ chối",
  [EVENT_STATUS.CANCELLED]: "Đã hủy",

  // Registration
  [REGISTRATION_STATUS.WAITLISTED]: "Chờ xác nhận",
  [REGISTRATION_STATUS.REGISTERED]: "Đã xác nhận",
  [REGISTRATION_STATUS.CANCELLED]: "Đã hủy/Từ chối",

  // Attendance
  [ATTENDANCE_STATUS.IN_PROGRESS]: "Đang tham gia",
  [ATTENDANCE_STATUS.COMPLETED]: "Hoàn thành",
  [ATTENDANCE_STATUS.ABSENT]: "Vắng mặt",
};

// =================================================================
// 5. MAPPING MÀU SẮC (Dùng cho Badge/Tag UI)
// (Ví dụ theo bảng màu Ant Design hoặc Tailwind)
// =================================================================
export const STATUS_COLORS = {
  // --- Event ---
  [EVENT_STATUS.PENDING]: "orange", // gold/warning
  [EVENT_STATUS.APPROVED]: "green", // success
  [EVENT_STATUS.REJECTED]: "red", // error
  [EVENT_STATUS.CANCELLED]: "default", // gray

  // --- Registration ---
  [REGISTRATION_STATUS.WAITLISTED]: "blue", // processing
  [REGISTRATION_STATUS.REGISTERED]: "green", // success
  [REGISTRATION_STATUS.CANCELLED]: "red", // error

  // --- Attendance ---
  [ATTENDANCE_STATUS.IN_PROGRESS]: "cyan",
  [ATTENDANCE_STATUS.COMPLETED]: "green",
  [ATTENDANCE_STATUS.ABSENT]: "volcano",
};

// =================================================================
// Helper Function: Lấy Label và Color theo Status
// =================================================================
export const getStatusInfo = (status) => {
  return {
    label: STATUS_LABELS[status] || "Không xác định",
    color: STATUS_COLORS[status] || "default",
  };
};

export default {
  EVENT_STATUS,
  REGISTRATION_STATUS,
  ATTENDANCE_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  getStatusInfo,
};
