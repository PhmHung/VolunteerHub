/** @format */
import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";

const canModifyEvent = asyncHandler(async (req, res, next) => {
  // 1. Lấy ID linh hoạt (dù route đặt là :id hay :eventId đều chạy được)
  const id = req.params.id;

  if (!id) {
    res.status(400);
    throw new Error("Missing Event ID in Route Parameters");
  }

  const event = await Event.findById(id);
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

  // 3. (Optional) Nếu muốn chặn sửa khi đã Approved (Trừ Admin)
  // Logic này lúc trước bạn để trong Controller, giờ chuyển ra đây cho sạch cũng được
  if (event.status === "approved" && !isAdmin) {
    res.status(400);
    throw new Error("Sự kiện đã duyệt, Manager không thể chỉnh sửa");
  }

  // 4. Gán event vào req để Controller dùng lại (Tiết kiệm 1 query DB)
  req.event = event;
  next();
});

export { canModifyEvent };
