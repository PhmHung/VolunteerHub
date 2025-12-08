
const events = [
  {
    title: "Dọn rác công viên Tao Đàn",
    description: "Thu gom rác, làm sạch công viên, trồng cây xanh",
    location: "Công viên Tao Đàn, Q1, TP.HCM",
    coordinates: { lat: 10.7745, lng: 106.6923 }, // Công viên Tao Đàn
    startDate: "2025-11-15T08:00:00+07:00",
    endDate: "2025-11-15T12:00:00+07:00",
    maxParticipants: 50,
    tags: ["môi trường", "cộng đồng", "TP.HCM"],
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    status: "approved",
  },
  {
    title: "Hiến máu nhân đạo",
    description: "Hiến máu cứu người tại Bệnh viện Chợ Rẫy",
    location: "Bệnh viện Chợ Rẫy, Q5, TP.HCM",
    coordinates: { lat: 10.7578, lng: 106.6597 }, // Bệnh viện Chợ Rẫy
    startDate: "2025-11-20T07:30:00+07:00",
    endDate: "2025-11-20T11:30:00+07:00",
    maxParticipants: 100,
    tags: ["sức khỏe", "hiến máu"],
    image: "https://images.unsplash.com/photo-1615461065929-4f8ffed6ca40?w=800",
    status: "pending",
  },
  {
    title: "Chiến dịch trồng cây xanh tại công viên Thống Nhất",
    description:
      "Tham gia cùng chúng tôi trồng 500 cây xanh nhằm cải thiện môi trường đô thị. Mang theo tinh thần nhiệt huyết và sẵn sàng làm việc ngoài trời.",
    location: "Công viên Thống Nhất, Hai Bà Trưng, Hà Nội",
    coordinates: { lat: 21.0175, lng: 105.8427 }, // Công viên Thống Nhất
    startDate: "2025-11-15T07:00:00.000Z",
    endDate: "2025-11-15T11:00:00.000Z",
    maxParticipants: 50,
    tags: ["môi trường", "ngoài trời", "sức khỏe"],
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    status: "approved",
  },
  {
    title: "Dạy học miễn phí cho trẻ em vùng cao Sapa",
    description:
      "Chương trình giáo dục 2 tuần dành cho học sinh tiểu học tại các bản làng vùng cao. Yêu cầu có kinh nghiệm giảng dạy hoặc đã qua đào tạo.",
    location: "Xã Tả Van, Sapa, Lào Cai",
    coordinates: { lat: 22.3224, lng: 103.8925 }, // Khu vực bản Tả Van
    startDate: "2025-12-01T08:00:00.000Z",
    endDate: "2025-12-01T17:00:00.000Z",
    maxParticipants: 15,
    tags: ["giáo dục", "trẻ em", "vùng cao"],
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    status: "approved",
  },
  {
    title: "Hỗ trợ người già tại Viện Dưỡng lão Hà Đông",
    description:
      "Đến thăm, trò chuyện và tổ chức các hoạt động giải trí cho các cụ cao tuổi. Mang theo sự ấm áp và tinh thần lạc quan.",
    location: "Viện Dưỡng lão Hà Đông, Quang Trung, Hà Đông",
    coordinates: { lat: 20.9692, lng: 105.7727 }, // Khu vực P. Quang Trung, Hà Đông
    startDate: "2025-10-28T14:00:00.000Z",
    endDate: "2025-10-28T17:00:00.000Z",
    maxParticipants: 20,
    tags: ["cộng đồng", "người già", "trong nhà"],
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    status: "approved",
  },
  {
    title: "Dọn rác bãi biển Sầm Sơn",
    description:
      "Cùng nhau làm sạch bãi biển, thu gom rác thải nhựa và nâng cao nhận thức về bảo vệ môi trường biển.",
    location: "Bãi biển Sầm Sơn, Thanh Hóa",
    coordinates: { lat: 19.7423, lng: 105.9038 }, // Bãi biển Sầm Sơn
    startDate: "2025-11-08T06:00:00.000Z",
    endDate: "2025-11-08T10:00:00.000Z",
    maxParticipants: 100,
    tags: ["môi trường", "biển", "ngoài trời"],
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800",
    status: "approved",
  },
  {
    title: "Tổ chức Tết Trung thu cho trẻ em mồ côi",
    description:
      "Mang niềm vui Trung thu đến các em nhỏ tại Làng trẻ SOS. Tham gia tổ chức trò chơi, tặng quà và múa lân.",
    location: "Làng trẻ SOS Hà Nội, Từ Liêm",
    coordinates: { lat: 21.0396, lng: 105.782 }, // Làng trẻ SOS Hà Nội (Phạm Thận Duật)
    startDate: "2025-10-25T15:00:00.000Z",
    endDate: "2025-10-25T19:00:00.000Z",
    maxParticipants: 30,
    tags: ["trẻ em", "lễ hội", "trong nhà"],
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
    status: "pending",
  },
  {
    title: "Hiến máu tình nguyện tại Bệnh viện Bạch Mai",
    description:
      "Tham gia hiến máu nhân đạo giúp cứu sống bệnh nhân. Được kiểm tra sức khỏe miễn phí và nhận quà lưu niệm.",
    location: "Bệnh viện Bạch Mai, Đống Đa, Hà Nội",
    coordinates: { lat: 21.0025, lng: 105.8415 }, // Bệnh viện Bạch Mai
    startDate: "2025-11-20T08:00:00.000Z",
    endDate: "2025-11-20T12:00:00.000Z",
    maxParticipants: 20,
    tags: ["sức khỏe", "hiến máu", "trong nhà"],
    image: "https://images.unsplash.com/photo-1615461065929-4f8ffed6ca40?w=800",
    status: "approved",
  },
  {
    title: "Dạy kỹ năng lập trình cho thanh niên khó khăn",
    description:
      "Giảng dạy lập trình Python cơ bản và kỹ năng việc làm cho thanh niên vùng ngoại thành. Tạo cơ hội khởi nghiệp.",
    location: "Trung tâm Phát triển xã hội, Thủ Đức, TP.HCM",
    coordinates: { lat: 10.8769, lng: 106.7648 },
    startDate: "2025-12-05T09:00:00.000Z",
    endDate: "2025-12-05T17:00:00.000Z",
    maxParticipants: 25,
    tags: ["giáo dục", "kỹ năng", "công nghệ"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    status: "approved",
  },
  {
    title: "Xây dựng trường học cho trẻ vùng nông thôn",
    description:
      "Tham gia xây dựng phòng học mới cho trẻ em tại huyện Thạch Thất. Mang theo công cụ, năng lượng và tình yêu thương.",
    location: "Trường tiểu học Sơn Phú, Thạch Thất, Hà Nội",
    coordinates: { lat: 21.0846, lng: 105.5584 },
    startDate: "2025-12-10T08:00:00.000Z",
    endDate: "2025-12-10T16:00:00.000Z",
    maxParticipants: 40,
    tags: ["xây dựng", "giáo dục", "nông thôn"],
    image: "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800",
    status: "pending",
  },
  {
    title: "Chương trình tặng quần áo ấm cho trẻ vùng cao",
    description:
      "Quyên góp và phân phát quần áo ấm cho trẻ em tại tỉnh Hà Giang. Mỗi chiếc áo sẽ mang đến ấm áp cho các em.",
    location: "Huyện Yên Minh, Hà Giang",
    coordinates: { lat: 23.1934, lng: 104.6811 },
    startDate: "2025-12-15T07:00:00.000Z",
    endDate: "2025-12-15T14:00:00.000Z",
    maxParticipants: 35,
    tags: ["từ thiện", "trẻ em", "vùng cao"],
    image: "https://images.unsplash.com/photo-1559732206-641ccc001df7?w=800",
    status: "approved",
  },
  {
    title: "Tham gia bảo tồn rừng phòng hộ Cúc Phương",
    description:
      "Chương trình bảo tồn thiên nhiên và trải nghiệm du lịch sinh thái tại Vườn Quốc gia Cúc Phương. Học về đa dạng sinh học.",
    location: "Vườn Quốc gia Cúc Phương, Ninh Bình",
    coordinates: { lat: 20.3553, lng: 105.649 },
    startDate: "2025-12-18T06:00:00.000Z",
    endDate: "2025-12-18T18:00:00.000Z",
    maxParticipants: 50,
    tags: ["môi trường", "bảo tồn", "ngoài trời"],
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    status: "approved",
  },
  {
    title: "Dạy toán cơ bản cho trẻ em học lực yếu",
    description:
      "Hỗ trợ bù đắp kiến thức toán học cho các em học sinh có hoàn cảnh khó khăn. Giáo viên hỗ trợ trực tiếp từng em.",
    location: "Trung tâm Hỗ trợ học tập, Cầu Giấy, Hà Nội",
    coordinates: { lat: 21.0447, lng: 105.7869 },
    startDate: "2025-12-20T15:00:00.000Z",
    endDate: "2025-12-20T17:30:00.000Z",
    maxParticipants: 15,
    tags: ["giáo dục", "trẻ em", "toán học"],
    image: "https://images.unsplash.com/photo-1427504494785-cdcdfeabc846?w=800",
    status: "pending",
  },
  {
    title: "Vệ sinh công cộng tại Chợ quê Gò Vấp",
    description:
      "Dọn vệ sinh và tổ chức lại không gian chợ quê tại khu dân cư. Tạo môi trường sạch sẽ và an toàn cho cộng đồng.",
    location: "Chợ Gò Vấp, Q.Gò Vấp, TP.HCM",
    coordinates: { lat: 10.8567, lng: 106.6844 },
    startDate: "2025-12-22T07:00:00.000Z",
    endDate: "2025-12-22T11:00:00.000Z",
    maxParticipants: 30,
    tags: ["cộng đồng", "vệ sinh", "công cộng"],
    image: "https://images.unsplash.com/photo-1559531215-cd4628902d4a?w=800",
    status: "approved",
  },
];

export default events;
