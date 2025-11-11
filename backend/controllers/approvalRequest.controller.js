/** @format */

import asyncHandler from "express-async-handler";
import ApprovalRequest from "../models/approvalRequestModel.js";
import Event from "../models/eventModel.js";

// @desc    Admin: Lấy danh sách yêu cầu đang chờ duyệt
const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await ApprovalRequest.find({ status: "pending" })
    .populate("event", "title location startDate image")
    .populate("requestedBy", "userName userEmail phoneNumber")
    .sort({ createdAt: -1 });

  res.json({
    message: "Danh sách yêu cầu chờ duyệt",
    count: requests.length,
    data: requests,
  });
});

// @desc    Admin: Duyệt yêu cầu
const approveRequest = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const request = await ApprovalRequest.findById(req.params.id);

  if (!request || request.status !== "pending") {
    res.status(400);
    throw new Error("Yêu cầu không tồn tại hoặc đã xử lý");
  }

  request.status = "approved";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.adminNote = adminNote || "Đã duyệt";
  await request.save();

  // Cập nhật Event
  await Event.findByIdAndUpdate(request.event, { status: "approved" });

  res.json({
    message: "Đã duyệt yêu cầu thành công",
    data: request,
  });
});

// @desc    Admin: Từ chối yêu cầu
const rejectRequest = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const request = await ApprovalRequest.findById(req.params.id);

  if (!request || request.status !== "pending") {
    res.status(400);
    throw new Error("Yêu cầu không tồn tại hoặc đã xử lý");
  }

  request.status = "rejected";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.adminNote = adminNote || "Không phù hợp";
  await request.save();

  res.json({
    message: "Đã từ chối yêu cầu",
    data: request,
  });
});

// @desc    Manager/Admin: Xem chi tiết 1 yêu cầu
const getRequestById = asyncHandler(async (req, res) => {
  const request = await ApprovalRequest.findById(req.params.id)
    .populate("event")
    .populate("requestedBy", "userName userEmail")
    .populate("reviewedBy", "userName");

  if (!request) {
    res.status(404);
    throw new Error("Không tìm thấy yêu cầu");
  }

  // Manager chỉ xem được yêu cầu của mình
  const isManager = req.user.role === "manager";
  const isOwner =
    request.requestedBy._id.toString() === req.user._id.toString();

  if (isManager && !isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Không có quyền xem yêu cầu này");
  }

  res.json({
    message: "Chi tiết yêu cầu",
    data: request,
  });
});

// @desc    Manager: Xem tất cả yêu cầu của mình
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await ApprovalRequest.find({ requestedBy: req.user._id })
    .populate("event", "title status")
    .sort({ createdAt: -1 });

  res.json({
    message: "Yêu cầu của bạn",
    count: requests.length,
    data: requests,
  });
});

export {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getRequestById,
  getMyRequests,
};
