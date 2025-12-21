/** @format */
import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";

const canModifyEvent = asyncHandler(async (req, res, next) => {
  // ✅ SỬA TẠI ĐÂY: Lấy eventId thay vì id để khớp với file routes
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400);
    // Đây chính là dòng gây ra thông báo lỗi màu đỏ trên màn hình của bạn
    throw new Error("Missing Event ID in Route Parameters");
  }

  // ✅ SỬA TẠI ĐÂY: Dùng eventId để tìm trong Database
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  // 2. Check quyền (Owner hoặc Admin)
  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền chỉnh sửa sự kiện này");
  }

  // 3. Nếu đã Duyệt (Approved), chỉ Admin mới được sửa hoặc xóa
  if (event.status === "approved" && !isAdmin) {
    res.status(400);
    throw new Error("Sự kiện đã duyệt, Manager không thể chỉnh sửa");
  }

  req.event = event;
  next();
});

export { canModifyEvent };
