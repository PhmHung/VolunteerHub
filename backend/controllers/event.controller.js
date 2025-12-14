/** @format */

import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import Registration from "../models/registrationModel.js";

// @desc    Get all APPROVED events (Public)
// @route   GET /api/events
const getEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = { status: "approved" };

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.minRating)
    filter.averageRating = { $gte: parseFloat(req.query.minRating) };

  let sortOption = { startDate: 1 };
  if (req.query.sort === "newest") sortOption = { createdAt: -1 };

  const events = await Event.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .populate("createdBy", "userName userEmail profilePicture phoneNumber");

  const total = await Event.countDocuments(filter);

  res.json({
    message: "Danh sách sự kiện",
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: events,
  });
});

// @desc    Get event by ID
// @route   GET /api/events/:eventId
const getEventById = asyncHandler(async (req, res) => {
  // 👇 Dùng trực tiếp eventId
  const event = await Event.findById(req.params.eventId)
    .populate("createdBy", "userName userEmail profilePicture phoneNumber")
    .select("-__v");

  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }
  res.json(event);
});

// @desc    Manager tạo sự kiện
// @route   POST /api/events
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
    throw new Error("Vui lòng điền đầy đủ thông tin");
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
    type: "event_approval",
  });

  event.approvalRequest = approvalRequest._id;
  await event.save();

  res.status(201).json({ message: "Tạo sự kiện thành công", data: event });
});

// @desc    Update event
// @route   PUT /api/events/:eventId
const updateEvent = asyncHandler(async (req, res) => {
  // 👇 Dùng trực tiếp eventId
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.eventId,
    req.body,
    {
      new: true,
    }
  );
  res.json({ message: "Cập nhật thành công", data: updatedEvent });
});

// @desc    Admin duyệt/hủy sự kiện
// @route   PATCH /api/events/:eventId/approve
const approveEvent = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  // 👇 Dùng trực tiếp eventId
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error(`Sự kiện không tồn tại (ID: ${req.params.eventId})`);
  }

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Trạng thái không hợp lệ");
  }

  // 1. Cập nhật Event
  event.status = status;
  await event.save();

  // 2. Cập nhật ApprovalRequest
  await ApprovalRequest.findOneAndUpdate(
    { event: event._id, status: "pending" },
    {
      status: status,
      adminNote: adminNote,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    }
  );

  res.json({
    message: `Sự kiện đã được ${status === "approved" ? "duyệt" : "từ chối"}`,
    data: event,
  });
});

// @desc    Manager/Admin: Hủy sự kiện
// @route   PUT /api/events/:eventId/cancel
const cancelEvent = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  // 👇 Dùng trực tiếp eventId
  const eventId = req.params.eventId;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền hủy sự kiện này.");
  }

  // Logic Hủy
  event.status = "cancelled";
  event.cancellationReason = reason || "Không có lý do cụ thể.";
  event.cancelledBy = req.user._id;
  await event.save();

  // Hủy vé
  await Registration.updateMany(
    {
      eventId: eventId,
      status: { $in: ["pending", "registered", "waitlisted"] },
    },
    { status: "event_cancelled" }
  );

  // Duyệt luôn request hủy nếu có
  await ApprovalRequest.findOneAndUpdate(
    { event: eventId, type: "event_cancellation", status: "pending" },
    { status: "approved", adminNote: "Đã thực hiện hủy trực tiếp." }
  );

  res.json({
    message: "Đã hủy sự kiện thành công.",
    data: event,
  });
});

// @desc    Lấy danh sách đăng ký
// @route   GET /api/events/:eventId/registrations
const getEventRegistrations = asyncHandler(async (req, res) => {
  // 👇 Dùng trực tiếp eventId
  const registrations = await Registration.find({ eventId: req.params.eventId })
    .populate("userId", "userName userEmail profilePicture phoneNumber")
    .sort({ createdAt: -1 });

  const formatted = registrations.map((reg) => ({
    ...reg.toObject(),
    volunteer: reg.userId,
    user: reg.userId,
  }));

  res.json(formatted);
});

// @desc    Lấy danh sách quản lý (Admin View)
// @route   GET /api/events/management
const getAllEvents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: "i" } },
      { location: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const events = await Event.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "userName userEmail");

  res.json({
    message: "Success",
    data: events,
    pagination: { page: 1, limit: 100, total: events.length },
  });
});

// @desc    Xóa sự kiện
// @route   DELETE /api/events/:eventId
const deleteEvent = asyncHandler(async (req, res) => {
  // 👇 Dùng trực tiếp eventId
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error("Không tìm thấy sự kiện");
  }

  await ApprovalRequest.deleteMany({ event: event._id });
  await Registration.deleteMany({ eventId: event._id });
  await Event.findByIdAndDelete(event._id);

  res.json({ message: "Đã xóa sự kiện thành công" });
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
  cancelEvent,
};
