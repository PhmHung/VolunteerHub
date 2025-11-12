import asyncHandler from "express-async-handler";
import Channel from "../models/Channel.js";

// Get all channels (optionally populate posts)
export const getChannels = asyncHandler(async (req, res) => {
  const channels = await Channel.find()
    .populate("event")
    .populate({
      path: "posts",
      populate: { path: "author", select: "name userEmail" },
    });
  res.json(channels);
});

// Get single channel
export const getChannelById = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id)
    .populate("event")
    .populate({
      path: "posts",
      populate: { path: "author", select: "name userEmail" },
    });
  if (!channel) {
    res.status(404);
    throw new Error("Channel not found");
  }
  res.json(channel);
});
