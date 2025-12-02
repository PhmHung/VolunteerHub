/** @format */

// Event Categories
export const EVENT_CATEGORIES = [
  "Tất cả",
  "Môi trường",
  "Giáo dục",
  "Cộng đồng",
  "Trẻ em",
  "Sức khỏe",
];

// Event Status
export const EVENT_STATUS = {
  approved: { label: "Đã duyệt", color: "emerald" },
  pending: { label: "Chờ duyệt", color: "amber" },
  rejected: { label: "Từ chối", color: "red" },
};

// Registration Status
export const REGISTRATION_STATUS = {
  pending: { label: "Chờ duyệt", color: "amber" },
  accepted: { label: "Đã chấp nhận", color: "emerald" },
  rejected: { label: "Từ chối", color: "red" },
  cancelled: { label: "Đã hủy", color: "gray" },
  waitlisted: { label: "Danh sách chờ", color: "blue" },
};
