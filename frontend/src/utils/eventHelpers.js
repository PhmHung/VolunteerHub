/** @format */

// Kiểm tra xem sự kiện đã kết thúc chưa
export const getEventTimeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "ONGOING";
  return "EXPIRED";
};
