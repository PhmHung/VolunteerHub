/** @format */

// Enum trạng thái điểm danh (Khớp với Attendance Model)
export const ATTENDANCE_STATUS = {
  IN_PROGRESS: "in-progress", // Đã check-in, chưa check-out
  COMPLETED: "completed", // Đã check-out xong
  ABSENT: "absent", // Vắng mặt (Có đăng ký nhưng không đến)
};

// Dữ liệu mẫu Feedback để random
export const sampleFeedbacks = [
  // 5 SAO - Khen ngợi
  {
    rating: 5,
    comment: "Sự kiện tổ chức rất chuyên nghiệp, BTC nhiệt tình hỗ trợ.",
  },
  {
    rating: 5,
    comment: "Một trải nghiệm tuyệt vời, chắc chắn sẽ tham gia lần sau!",
  },
  {
    rating: 5,
    comment: "Rất vui vì được đóng góp một phần công sức. Cảm ơn BTC.",
  },
  {
    rating: 5,
    comment: "Địa điểm thoáng mát, đồ ăn nhẹ ngon.",
  },

  // 4 SAO - Tốt nhưng có góp ý nhỏ
  {
    rating: 4,
    comment: "Sự kiện ý nghĩa. Tuy nhiên khâu check-in hơi lâu một chút.",
  },
  {
    rating: 4,
    comment: "Mọi thứ đều ổn, chỉ là thời tiết hơi nóng.",
  },
  {
    rating: 4,
    comment: "Tốt, nhưng cần chuẩn bị thêm nước uống cho TNV.",
  },

  // 3 SAO - Bình thường/Trung bình
  {
    rating: 3,
    comment: "Sự kiện bình thường, không có gì đặc sắc.",
  },
  {
    rating: 3,
    comment: "Khâu tổ chức hơi lộn xộn lúc đầu giờ.",
  },

  // 1-2 SAO - Chê/Phàn nàn
  {
    rating: 2,
    comment: "Thiếu dụng cụ làm việc trầm trọng, chúng tôi phải đợi rất lâu.",
  },
  {
    rating: 1,
    comment: "BTC không tôn trọng tình nguyện viên. Giờ giấc cao su.",
  },
];

export default sampleFeedbacks;
