/** @format */

import asyncHandler from "express-async-handler";
import ApprovalRequest from "../models/approvalRequestModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import Registration from "../models/registrationModel.js";
import {
  emitNotification,
  emitToMultiple,
} from "../utils/notificationHelper.js";

// @desc    Admin: Lấy danh sách yêu cầu đang chờ duyệt
const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await ApprovalRequest.find({ status: "pending" })
    .populate("event", "title location startDate image")
    .populate("requestedBy", "userName userEmail phoneNumber profilePicture")
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

  // --- LOGIC XỬ LÝ ĐA HÌNH (POLYMORPHIC) ---

  if (request.type === "event_approval") {
    // 1. DUYỆT ĐĂNG SỰ KIỆN MỚI
    if (!request.event) {
      res.status(400);
      throw new Error("Không tìm thấy Event ID trong yêu cầu.");
    }
    await Event.findByIdAndUpdate(request.event, { status: "approved" });
  } else if (request.type === "manager_promotion") {
    await User.findByIdAndUpdate(request.requestedBy, { role: "manager" });
  } else if (request.type === "event_cancellation") {
    if (!request.event) {
      res.status(400);
      throw new Error("Không tìm thấy Event ID.");
    }

    // A. Cập nhật trạng thái sự kiện thành Cancelled
    await Event.findByIdAndUpdate(request.event, {
      status: "cancelled",
      cancellationReason:
        request.reason || adminNote || "Admin phê duyệt yêu cầu hủy",
      cancelledBy: req.user._id,
    });

    // B. Hủy tất cả vé đăng ký của sự kiện đó (Chỉ hủy vé đang hoạt động)
    await Registration.updateMany(
      {
        eventId: request.event,
        status: { $in: ["registered", "pending", "waitlisted"] },
      },
      { status: "event_cancelled" }
    );
  } else {
    // Xử lý loại request không xác định
    res.status(400);
    throw new Error(`Loại yêu cầu không hợp lệ: ${request.type}`);
  }

  // ---------------------------

  // Cập nhật trạng thái ApprovalRequest
  request.status = "approved";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.adminNote = adminNote || "Đã duyệt";
  await request.save();
  const targetRoom = request.requestedBy.toString();
  let notificationData = {
    type: "success",
    id: request._id,
  };

  if (request.type === "manager_promotion") {
    notificationData.title = "Thăng cấp thành công!";
    notificationData.message =
      "Chúc mừng! Bạn đã chính thức trở thành Manager của hệ thống.";
    notificationData.link = "/information";
  } else if (request.type === "event_approval") {
    notificationData.title = "Sự kiện đã được duyệt";
    notificationData.message = `Sự kiện "${request.event?.title}" của bạn đã được đăng công khai.`;
    notificationData.link = `/dashboard?tab=events&highlight=${request.event?._id}`;
  } else if (request.type === "event_cancellation") {
    notificationData.title = "Đã duyệt hủy sự kiện";
    notificationData.message = `Yêu cầu hủy sự kiện "${request.event?.title}" đã được Admin chấp thuận.`;
    notificationData.link = "/dashboard";
  }
  const registrations = await Registration.find({
    eventId: request.event,
  }).select("userId");
  const volunteerIds = registrations.map((reg) => reg.userId.toString());

  emitToMultiple(req, volunteerIds, {
    title: "Sự kiện đã bị HỦY",
    message: `Sự kiện "${request.event.title}" đã bị hủy theo yêu cầu của ban tổ chức.`,
    type: "danger",
    link: "/history",
  });
  emitNotification(req, request.requestedBy.toString(), {
    title: "Yêu cầu hủy đã được duyệt",
    message: `Sự kiện "${request.event.title}" của bạn đã được hủy thành công.`,
    type: "success",
    link: "/dashboard",
  });
  res.json({
    message: "Đã duyệt yêu cầu thành công",
    data: request,
  });
});

// @desc  Admin: Từ chối yêu cầu
const rejectRequest = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const request = await ApprovalRequest.findById(req.params.id);

  if (!request || request.status !== "pending") {
    res.status(400);
    throw new Error("Yêu cầu không tồn tại hoặc đã xử lý");
  }

  // 👇 LOGIC BỔ SUNG: Nếu từ chối yêu cầu HỦY, cần khôi phục trạng thái sự kiện
  if (request.type === "event_cancellation" && request.event) {
    // Nếu sự kiện đang ở trạng thái 'cancel_pending' (chờ hủy), trả về 'approved' (hoạt động bình thường)
    const event = await Event.findById(request.event);
    if (event && event.status === "cancel_pending") {
      event.status = "approved";
      await event.save();
    }
  }

  request.status = "rejected";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.adminNote = adminNote || "Không phù hợp";
  await request.save();
  const targetRoom = request.requestedBy.toString();
  let notificationData = {
    type: "danger",
    id: request._id,
  };

  if (request.type === "manager_promotion") {
    notificationData.title = "Yêu cầu thăng cấp bị từ chối";
    notificationData.message = `Rất tiếc, yêu cầu làm Manager của bạn chưa được duyệt. Lý do: ${adminNote}`;
    notificationData.link = "/information";
  } else if (request.type === "event_approval") {
    notificationData.title = "Từ chối đăng sự kiện";
    notificationData.message = `Sự kiện "${request.event?.title}" bị từ chối đăng. Lý do: ${adminNote}`;
    notificationData.link = "/dashboard";
  } else if (request.type === "event_cancellation") {
    notificationData.title = "Từ chối yêu cầu hủy";
    notificationData.message = `Admin không chấp thuận hủy sự kiện "${request.event?.title}". Sự kiện sẽ tiếp tục hoạt động.`;
    notificationData.link = `/dashboard?tab=events&highlight=${request.event?._id}`;
  }

  emitNotification(req, targetRoom, notificationData);

  res.json({
    message: "Đã từ chối yêu cầu",
    data: request,
  });
});

// @desc Manager/Admin: Xem chi tiết 1 yêu cầu
const getRequestById = asyncHandler(async (req, res) => {
  const request = await ApprovalRequest.findById(req.params.id)
    .populate("event")
    .populate("requestedBy", "userName userEmail profilePicture")
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

// @desc Manager: Xem tất cả yêu cầu của mình
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
