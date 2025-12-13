/** @format */

import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import Registration from "../models/registrationModel.js";

// @desc    Get all APPROVED events (Public)
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  // 1. Phân trang
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // 2. Bộ lọc cơ bản (Chỉ lấy sự kiện đã duyệt)
  const filter = { status: "approved" };

  // 3. Tìm kiếm từ khóa (Title hoặc Description)
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // 4. Lọc theo Tag
  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  // 5. [MỚI] Lọc theo số sao tối thiểu (VD: ?minRating=4)
  if (req.query.minRating) {
    filter.averageRating = { $gte: parseFloat(req.query.minRating) };
  }

  // 6. [MỚI] Xử lý Sắp xếp (Sort)
  // Mặc định: Sắp xếp theo ngày bắt đầu (Sự kiện sắp tới hiện trước)
  let sortOption = { startDate: 1 };

  if (req.query.sort) {
    switch (req.query.sort) {
      case "rating_desc":
        // Đánh giá cao nhất (Nếu bằng điểm thì ưu tiên cái nào nhiều vote hơn)
        sortOption = { averageRating: -1, ratingCount: -1 };
        break;
      case "rating_asc":
        // Đánh giá thấp nhất
        sortOption = { averageRating: 1 };
        break;
      case "popular":
        // Nhiều lượt đánh giá nhất
        sortOption = { ratingCount: -1 };
        break;
      case "newest":
        // Mới tạo gần đây nhất
        sortOption = { createdAt: -1 };
        break;
      case "upcoming":
        // Sắp diễn ra (Default)
        sortOption = { startDate: 1 };
        break;
      default:
        sortOption = { startDate: 1 };
    }
  }

  // 7. Thực thi Query
  const events = await Event.find(filter)
    .sort(sortOption) // Áp dụng sort
    .skip(skip)
    .limit(limit)
    .select("-__v") // Loại bỏ field version key
    // Populate user tạo sự kiện (Lấy thêm ảnh và SĐT để hiển thị card đẹp hơn)
    .populate("createdBy", "userName userEmail profilePicture phoneNumber");

  const total = await Event.countDocuments(filter);

  res.json({
    message: "Danh sách sự kiện",
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: events,
  });
});

// @desc    Get event by ID (Public nếu approved)
// @route   GET /api/events/:id
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId)
    // --- SỬA Ở ĐÂY ---
    // Frontend cần: userName (tên), profilePicture (ảnh), phoneNumber (liên hệ)
    // Backend cũ chỉ trả về: name, email -> Thiếu ảnh và sđt
    .populate("createdBy", "userName userEmail profilePicture phoneNumber")
    .select("-__v");

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  // Check quyền (giữ nguyên)
  if (
    event.status !== "approved" &&
    req.user?.role !== "admin" &&
    req.user?.role !== "manager"
  ) {
    res.status(403);
    throw new Error("Sự kiện chưa được duyệt");
  }

  res.json(event);
});

// @desc    Manager tạo sự kiện + gửi yêu cầu duyệt
// @route   POST /api/events
// @access  Private/Manager
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    startDate,
    endDate,
    maxParticipants,
    tags,
    image,
  } = req.body;

  if (!title || !startDate || !endDate || !location || !maxParticipants) {
    res.status(400);
    throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
  }

  if (new Date(startDate) >= new Date(endDate)) {
    res.status(400);
    throw new Error("Ngày bắt đầu phải trước ngày kết thúc");
  }

  const event = await Event.create({
    title,
    description,
    location,
    startDate,
    endDate,
    maxParticipants,
    tags,
    image,
    createdBy: req.user._id,
    status: "pending",
  });

  const approvalRequest = await ApprovalRequest.create({
    event: event._id,
    requestedBy: req.user._id,
  });

  event.approvalRequest = approvalRequest._id;
  await event.save();

  res.status(201).json({
    message: "Tạo sự kiện thành công. Đang chờ duyệt.",
    data: event,
  });
});

// @desc    Update event (chỉ manager sở hữu + chưa duyệt)
// @route   PUT /api/events/:id
// @access  Private/Manager
const updateEvent = asyncHandler(async (req, res) => {
  const event = req.event;
  if (event.status === "approved" && req.user.role !== "admin") {
    res.status(400);
    throw new Error("Không thể sửa sự kiện đã duyệt");
  }

  const { startDate, endDate } = req.body;
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    res.status(400);
    throw new Error("Ngày bắt đầu phải trước ngày kết thúc");
  }

  // Update trực tiếp
  const updatedEvent = await Event.findByIdAndUpdate(event._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    message: "Cập nhật sự kiện thành công",
    data: updatedEvent,
  });
});

// @desc    Admin duyệt/hủy sự kiện
// @route   PATCH /api/events/:id/approve
// @access  Private/Admin
const approveEvent = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body; // approved | rejected
  const event = await Event.findById(req.params.id).populate("approvalRequest");

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  if (!event.approvalRequest) {
    res.status(400);
    throw new Error("Yêu cầu duyệt không tồn tại");
  }

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Trạng thái không hợp lệ");
  }

  event.status = status;
  await event.save();

  // Cập nhật ApprovalRequest
  event.approvalRequest.status = status;
  event.approvalRequest.adminNote = adminNote;
  event.approvalRequest.reviewedBy = req.user._id;
  event.approvalRequest.reviewedAt = new Date();
  await event.approvalRequest.save();

  res.json({
    message: `Sự kiện đã được ${
      status === "approved" ? "approved" : "rejected"
    }`,
    data: event,
  });
});

// @desc    Lấy danh sách đăng ký theo sự kiện (ĐÃ FIX THEO SCHEMA)
// @route   GET /api/events/:eventId/registrations
// @access  Private (Admin/Manager)
const getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  try {
    // 1. Tìm theo đúng trường 'eventId' trong Schema
    const registrations = await Registration.find({ eventId: eventId })
      // 2. Populate đúng trường 'userId' trong Schema
      // Lấy các field: userName, email, ảnh, sđt để hiển thị
      .populate("userId", "userName userEmail profilePicture phoneNumber")
      .sort({ createdAt: -1 });

    // 3. Chuẩn hóa dữ liệu trả về cho Frontend
    // Frontend đang gọi reg.volunteer, nhưng DB lại là reg.userId
    // Ta sẽ gán userId vào volunteer để Frontend không bị lỗi
    const formattedRegistrations = registrations.map((reg) => {
      const regObj = reg.toObject(); // Chuyển Mongoose Document sang Object thường
      return {
        ...regObj,
        volunteer: regObj.userId, // Map userId sang volunteer cho khớp Frontend
        user: regObj.userId, // Map thêm user cho chắc
      };
    });

    res.status(200).json(formattedRegistrations);
  } catch (error) {
    console.error("❌ Error getting registrations:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// @desc    Lấy danh sách sự kiện quản lý
// @route   GET /api/private/events
// @access  Private (Admin/Manager)
const getAllEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status; // pending, rejected, approved...
  }

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const events = await Event.find(filter)
    .sort({ createdAt: -1 }) // Admin cần xem mới nhất trước
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email profilePicture ")
    .populate("approvalRequest");

  const total = await Event.countDocuments(filter);

  res.json({
    message: "Danh sách sự kiện (Admin View)",
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: events,
  });
});

// @desc    Xóa sự kiện
// @route   DELETE /api/events/:eventId
// @access  Private (Admin hoặc Manager sở hữu)
const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  // Chỉ Admin hoặc người tạo mới được xóa
  if (
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền xóa sự kiện này");
  }

  // Xóa approval request nếu có
  if (event.approvalRequest) {
    await ApprovalRequest.findByIdAndDelete(event.approvalRequest);
  }
  await Registration.deleteMany({ eventId: eventId });
  await Event.findByIdAndDelete(eventId);

  res.json({
    message: "Đã xóa sự kiện và toàn bộ đăng ký liên quan thành công!",
  });
});

export {
  getEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getEventRegistrations,
};
