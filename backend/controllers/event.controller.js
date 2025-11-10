/** @format */

import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js"; // Giả định: Import Event Model
// Có thể cần import thêm Registration Model nếu muốn xóa đăng ký liên quan khi xóa sự kiện

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  // 1. Xây dựng điều kiện lọc (Query filter)
  // Ví dụ: Lọc theo từ khóa, trạng thái active, hoặc ngày
  const filter = {
    isActive: true, // Chỉ lấy sự kiện đang hoạt động
    ...req.query,
  };

  // 2. Lấy dữ liệu và phân trang (Pagination)
  const events = await Event.find(filter)
    .sort({ date: 1 }) // Sắp xếp theo ngày tăng dần
    .select("-__v"); // Loại bỏ trường __v của Mongoose

  if (!events || events.length === 0) {
    return res
      .status(200)
      .json({ message: "No active events found.", data: [] });
  }

  res.json({
    message: "List of events retrieved successfully",
    count: events.length,
    data: events,
  });
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  // 1. Tìm sự kiện theo ID
  const event = await Event.findById(req.params.id).select("-__v");

  // 2. Xử lý trường hợp không tìm thấy
  if (!event) {
    res.status(404);
    throw new Error(`Event with ID ${req.params.id} not found.`);
  }

  res.json({
    message: `Event details for ID: ${req.params.id}`,
    data: event,
  });
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  // req.user._id được lấy từ middleware xác thực (Auth Middleware)
  const { name, date, location, description } = req.body;

  // 1. Kiểm tra dữ liệu đầu vào cơ bản
  if (!name || !date || !location) {
    res.status(400);
    throw new Error("Please provide name, date, and location for the event.");
  }

  // 2. Tạo sự kiện mới và lưu người tạo
  const event = await Event.create({
    name,
    date,
    location,
    description,
    createdBy: req.user._id, // Gắn ID người dùng tạo sự kiện
  });

  res.status(201).json({
    message: "Event created successfully",
    data: event,
  });
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  // 1. Cập nhật sự kiện theo ID, sử dụng dữ liệu từ req.body
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error(`Event with ID ${req.params.id} not found.`);
  }

  // 2. Thêm logic kiểm tra quyền (ví dụ: chỉ Admin hoặc người tạo sự kiện mới được sửa)
  // if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  //     res.status(403);
  //     throw new Error('Not authorized to update this event.');
  // }

  // 3. Cập nhật dữ liệu
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Trả về tài liệu đã cập nhật
    runValidators: true, // Chạy lại các validators của schema
  }).select("-__v");

  res.json({
    message: `Event ID ${req.params.id} updated successfully`,
    data: updatedEvent,
  });
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error(`Event with ID ${req.params.id} not found.`);
  }

  // 1. Xử lý logic phụ thuộc (Nếu có Registration Model)
  // Ví dụ: Xóa tất cả bản ghi đăng ký liên quan đến sự kiện này
  // await Registration.deleteMany({ event: req.params.id });

  // 2. Xóa sự kiện khỏi DB
  await event.deleteOne();

  res.json({
    message: `Event ID ${req.params.id} and all related registrations removed`,
  });
});

export { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
