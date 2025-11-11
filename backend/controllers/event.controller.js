/** @format */

import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import Registration from "../models/registrationModel.js";

// @desc    Get all APPROVED events (Public)
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: "approved" };

  // Tìm kiếm theo từ khóa
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Lọc theo tag
  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  const events = await Event.find(filter)
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .populate("createdBy", "name email");

  const total = await Event.countDocuments(filter);

  res.json({
    message: "Danh sách sự kiện được duyệt",
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: events,
  });
});

// @desc    Get event by ID (Public nếu approved)
// @route   GET /api/events/:id
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("createdBy", "name email")
    .select("-__v");

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  // Chỉ cho xem nếu đã duyệt (hoặc là admin/manager)
  if (
    event.status !== "approved" &&
    req.user?.role !== "admin" &&
    req.user?.role !== "manager"
  ) {
    res.status(403);
    throw new Error("Sự kiện chưa được duyệt");
  }

  res.json({
    message: "Chi tiết sự kiện",
    data: event,
  });
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
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  // Chỉ manager tạo hoặc admin
  if (
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Không có quyền chỉnh sửa");
  }

  // Không cho sửa nếu đã duyệt
  if (event.status === "approved") {
    res.status(400);
    throw new Error("Không thể sửa sự kiện đã duyệt");
  }

  const { startDate, endDate } = req.body;
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    res.status(400);
    throw new Error("Ngày bắt đầu phải trước ngày kết thúc");
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
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

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export { getEvents, getEventById, createEvent, updateEvent, approveEvent };
