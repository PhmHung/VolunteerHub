/** @format */

// Hàm sinh dữ liệu Approval Request
const generateApprovalRequests = (volunteers, pendingEvents, managers) => {
  const requests = [];

  // ======================================================
  // LOẠI 1: APPROVAL REQUEST CHO EVENT (ADMIN DUYỆT SỰ KIỆN MỚI)
  // ======================================================
  pendingEvents.forEach((event) => {
    // Lấy ngẫu nhiên 1 manager làm người yêu cầu (nếu event chưa có createdBy)
    const randomManager = managers[Math.floor(Math.random() * managers.length)];

    requests.push({
      type: "event_approval",
      event: event._id, // ID sự kiện đang pending
      requestedBy: event.createdBy || randomManager?._id, // Người tạo (Manager)
      status: "pending",
      // Event approval không cần promotionData
    });
  });

  // ======================================================
  // LOẠI 2: APPROVAL REQUEST CHO MANAGER (USER ĐĂNG KÝ LÀM QUẢN LÝ)
  // ======================================================

  // Giả sử chúng ta lấy 10 Volunteer đầu tiên trong danh sách để làm người xin thăng chức
  // Hoặc lọc các user có tên cụ thể nếu muốn (ví dụ: "Ứng Viên...")
  const candidates = volunteers.slice(0, 10);

  candidates.forEach((vol) => {
    requests.push({
      type: "manager_promotion",
      requestedBy: vol._id, // Volunteer muốn lên Manager
      status: "pending",

      // Giả lập dữ liệu hiệu suất (Dữ liệu này bình thường sẽ được tính từ Attendance)
      promotionData: {
        eventsCompleted: Math.floor(Math.random() * 20) + 5, // Đã tham gia 5 - 25 sự kiện
        totalAttendanceHours: parseFloat((Math.random() * 50 + 20).toFixed(1)), // 20 - 70 giờ
        averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // Rating 3.5 - 5.0
      },
    });
  });

  // Tạo thêm 1 vài request đã bị TỪ CHỐI (để test tab lịch sử/từ chối)
  if (volunteers.length > 12) {
    requests.push({
      type: "manager_promotion",
      requestedBy: volunteers[11]._id,
      status: "rejected",
      adminNote:
        "Hồ sơ chưa đủ kinh nghiệm lãnh đạo. Cần tham gia thêm các sự kiện lớn.",
      reviewedAt: new Date(),
      promotionData: {
        eventsCompleted: 2,
        totalAttendanceHours: 8.5,
        averageRating: 3.8,
      },
    });
  }

  // Tạo thêm 1 vài request đã ĐƯỢC DUYỆT (để test)
  if (volunteers.length > 13) {
    requests.push({
      type: "manager_promotion",
      requestedBy: volunteers[12]._id,
      status: "approved",
      adminNote: "Thành tích xuất sắc. Đồng ý thăng cấp.",
      reviewedAt: new Date(),
      promotionData: {
        eventsCompleted: 30,
        totalAttendanceHours: 120,
        averageRating: 4.9,
      },
    });
  }

  return requests;
};

export default generateApprovalRequests;
