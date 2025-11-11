/** @format */

import asyncHandler from "express-async-handler";
import ApprovalRequest from "../models/approvalRequestModel.js";
// Giả định: import ApprovalRequest Model và User Model

/**
 * Các Controller cho việc xử lý các Yêu Cầu Phê Duyệt (Approval Requests)
 */

// @desc    Create a new approval request
// @route   POST /api/v1/approval-requests
// @access  Private
const createApprovalRequest = asyncHandler(async (req, res) => {
  const { type, content, requestedBy } = req.body;

  // Yêu cầu: Đảm bảo người dùng đã đăng nhập (Private access)
  // Logic: Lưu yêu cầu mới vào DB với trạng thái mặc định là 'Pending'
  const newRequest = await ApprovalRequest.create({
    user: req.user._id,
    type,
    content,
  });

  res.status(201).json({
    message: "Approval request created successfully",
    id: newRequest._id,
  });
});

// @desc    Get all approval requests (Filterable by status, user)
// @route   GET /api/v1/approval-requests
// @access  Private/Manager
const getApprovalRequests = asyncHandler(async (req, res) => {
  // Yêu cầu: Chỉ Admin/Manager mới được truy cập danh sách này
  // Logic: Lấy tất cả các requests, áp dụng filter từ query params (ví dụ: ?status=Pending)
  const requests = await ApprovalRequest.find(req.query).populate(
    "user",
    "name email"
  );

  res.json({
    message: "List of approval requests retrieved",
    count: 15,
    // data: requests
  });
});

// @desc    Get single approval request by ID
// @route   GET /api/v1/approval-requests/:id
// @access  Private
const getApprovalRequestById = asyncHandler(async (req, res) => {
  // Logic: Tìm request theo ID
  const request = await ApprovalRequest.findById(req.params.id).populate(
    "user",
    "name"
  );

  if (!request) {
    res.status(404).send("Approval request not found");
  }

  res.json({
    message: `Details for request ID: ${req.params.id}`,
    // data: request
  });
});

// @desc    Update approval request status (Approve/Reject)
// @route   PATCH /api/v1/approval-requests/:id/status
// @access  Private/Manager
const updateApprovalStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body; // status phải là 'Approved' hoặc 'Rejected'

  // Yêu cầu: Chỉ Manager mới được phép thay đổi trạng thái
  // Logic: Cập nhật trường status và lưu người phê duyệt (approvedBy: req.user._id)
  const request = await ApprovalRequest.findById(req.params.id);
  request.status = status;
  request.approvedBy = req.user._id;
  await request.save();

  res.json({
    message: `Request ID ${req.params.id} updated to ${status}`,
    newStatus: status,
  });
});

// @desc    Delete an approval request
// @route   DELETE /api/v1/approval-requests/:id
// @access  Private/Admin
const deleteApprovalRequest = asyncHandler(async (req, res) => {
  // Yêu cầu: Chỉ Admin hoặc người tạo request mới có quyền xóa
  // Logic: Xóa request khỏi DB
  await ApprovalRequest.deleteOne({ _id: req.params.id });

  res.json({ message: `Request ID ${req.params.id} successfully removed` });
});

export {
  createApprovalRequest,
  getApprovalRequests,
  getApprovalRequestById,
  updateApprovalStatus,
  deleteApprovalRequest,
};
