/** @format */
import asyncHandler from "express-async-handler";
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";

// @desc    Đăng ký tham gia sự kiện
// @route   POST /api/registrations
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event || event.status !== "approved") {
    res.status(400);
    throw new Error("Sự kiện không tồn tại hoặc chưa được duyệt");
  }

  if (event.isFull) {
    res.status(400);
    throw new Error("Sự kiện đã đủ người");
  }

  const alreadyRegistered = await Registration.findOne({
    userId: req.user._id,
    eventId,
  });

  if (alreadyRegistered) {
    res.status(400);
    throw new Error("Bạn đã đăng ký sự kiện này");
  }

  const registration = await Registration.create({
    userId: req.user._id,
    eventId,
  });

  // Tăng currentParticipants
  event.currentParticipants += 1;
  await event.save();

  res.status(201).json({
    message: "Đăng ký thành công",
    data: registration,
  });
});

// @desc    Hủy đăng ký
// @route   DELETE /api/registrations/:id
// @access  Private
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đăng ký");
  }

  if (
    registration.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Không có quyền");
  }

  const event = await Event.findById(registration.eventId);
  if (event) {
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();
  }

  await registration.deleteOne();

  res.json({ message: "Hủy đăng ký thành công" });
});

export { registerForEvent, cancelRegistration };
