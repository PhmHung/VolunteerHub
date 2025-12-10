/** @format */

export const EVENT_STATUS = {
  PENDING: "pending", // Chờ Admin duyệt
  APPROVED: "approved", // Đã duyệt (Public)
  REJECTED: "rejected", // Bị từ chối
  CANCELLED: "cancelled", // Đã hủy
};

export const REGISTRATION_STATUS = {
  WAITLISTED: "waitlisted", // Chờ Manager duyệt
  REGISTERED: "registered", // Đã tham gia (Manager đã duyệt)
  CANCELLED: "cancelled", // Đã hủy/Từ chối (Gộp chung)
};

export const ATTENDANCE_STATUS = {
  IN_PROGRESS: "in-progress", // Sự kiện đang diễn ra
  COMPLETED: "completed", // Đã hoàn thành nhiệm vụ
  ABSENT: "absent", // Vắng mặt
};
