/**
 * @file constants.js
 * @description Application-wide constants and enums
 * @pattern Constants Module Pattern
 */

// ==================== EVENT CONSTANTS ====================

/**
 * Available event categories
 * @type {string[]}
 */
export const EVENT_CATEGORIES = [
  "Tất cả",
  "Môi trường",
  "Giáo dục",
  "Cộng đồng",
  "Trẻ em",
  "Sức khỏe",
];

/**
 * Event status definitions with labels and colors
 * @type {Object.<string, {label: string, color: string}>}
 */
export const EVENT_STATUS = {
  approved: { label: "Đã duyệt", color: "emerald" },
  pending: { label: "Chờ duyệt", color: "amber" },
  rejected: { label: "Từ chối", color: "red" },
};

// ==================== REGISTRATION CONSTANTS ====================

/**
 * Registration status definitions with labels and colors
 * @type {Object.<string, {label: string, color: string}>}
 */
export const REGISTRATION_STATUS = {
  pending: { label: "Chờ duyệt", color: "amber" },
  accepted: { label: "Đã chấp nhận", color: "emerald" },
  rejected: { label: "Từ chối", color: "red" },
  cancelled: { label: "Đã hủy", color: "gray" },
  waitlisted: { label: "Danh sách chờ", color: "blue" },
};
