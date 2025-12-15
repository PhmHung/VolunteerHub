import asyncHandler from "express-async-handler";
import Channel from "../models/channelModel.js";
import Event from "../models/eventModel.js";

// ================================
// GET ALL CHANNELS (ADMIN ONLY)
// ================================
export const getChannels = asyncHandler(async (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Only admin can access all channels",
    });
  }

  const channels = await Channel.find()
    .populate("event")
    .populate({
      path: "posts",
      populate: { path: "author", select: "userName userEmail" },
    });

  res.json(channels);
});

// ================================
// GET CHANNEL BY ID
// ADMIN or member of event
// ================================
export const getChannelById = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id)
    .populate({
      path: "event",
      populate: [
        { path: "volunteers", select: "userName userEmail" },
        { path: "managers", select: "userName userEmail" },
      ],
    })
    .populate({
      path: "posts",
      populate: { path: "author", select: "userName userEmail" },
    });

  if (!channel) {
    res.status(404);
    throw new Error("Channel not found");
  }

  const userId = req.user._id.toString();

  const event = channel.event;
  if (!event) {
    return res.status(500).json({ message: "Channel missing event reference" });
  }

  const isAdmin = req.user.role === "admin";
  const isManager = event.managers.some(
    (m) => m._id.toString() === userId
  );
  const isVolunteer = event.volunteers.some(
    (v) => v._id.toString() === userId
  );

  if (!isAdmin && !isManager && !isVolunteer) {
    return res.status(403).json({
      message: "Access denied — you are not part of this channel",
    });
  }

  res.json(channel);
});

export const getChannelByEventId = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id.toString();

  // 1️⃣ Tìm channel theo eventId
  const channel = await Channel.findOne({ event: eventId })
    .populate({
      path: "event",
      populate: [
        { path: "volunteers", select: "userName userEmail" },
        { path: "managers", select: "userName userEmail" },
      ],
    })
    .populate({
      path: "posts",
      populate: { path: "author", select: "userName userEmail" },
    });

  if (!channel) {
    res.status(404);
    throw new Error("Channel not found for this event");
  }

  // 2️⃣ Check quyền (DÙNG event ĐÃ POPULATE)
  const event = channel.event;

  const isAdmin = req.user.role === "admin";
  const isManager = event.managers.some(
    (m) => m._id.toString() === userId
  );
  const isVolunteer = event.volunteers.some(
    (v) => v._id.toString() === userId
  );

  if (!isAdmin && !isManager && !isVolunteer) {
    return res.status(403).json({
      message: "Access denied — you are not part of this channel",
    });
  }

  res.json(channel);
});
