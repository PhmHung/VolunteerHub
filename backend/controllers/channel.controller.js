/** @format */

import asyncHandler from "express-async-handler";
import Channel from "../models/channelModel.js";
import Event from "../models/eventModel.js";
import Reaction from "../models/reactionModel.js";
import Comment from "../models/commentModel.js";
import Attendance from "../models/attendanceModel.js";
import Registration from "../models/registrationModel.js";
import { emitNotification } from "../utils/notificationHelper.js";

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
  const isManager = event.managers.some((m) => m._id.toString() === userId);
  const isVolunteer = event.volunteers.some((v) => v._id.toString() === userId);

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

  // 1️⃣ Lấy channel + event + posts + author
  const channel = await Channel.findOne({ event: eventId })
    .populate({
      path: "event",
      populate: [
        { path: "volunteers", select: "userName userEmail role" },
        { path: "managers", select: "userName userEmail role" },
      ],
    })
    .populate({
      path: "posts",
      match: { isDeleted: false },
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "author",
        select: "userName userEmail role",
      },
    });

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  // 2️⃣ Check quyền
  const event = channel.event;

  const isAdmin = req.user.role === "admin";
  const isManager = event.managers.some((m) => m._id.toString() === userId);
  const isVolunteer = event.volunteers.some((v) => v._id.toString() === userId);

  if (!isAdmin && !isManager && !isVolunteer) {
    return res.status(403).json({
      message: "Access denied — you are not part of this channel",
    });
  }

  // ===============================
  // 3️⃣ Lấy reactions cho POSTS
  // ===============================
  const postIds = channel.posts.map((p) => p._id);

  const postReactions = await Reaction.find({
    post: { $in: postIds },
  }).populate("user", "userName role");

  // Group reactions theo postId
  const reactionsByPost = {};
  postReactions.forEach((r) => {
    const key = r.post.toString();
    if (!reactionsByPost[key]) reactionsByPost[key] = [];
    reactionsByPost[key].push(r);
  });

  // ===============================
  // 4️⃣ Lấy COMMENTS (level 1)
  // ===============================
  const comments = await Comment.find({
    post: { $in: postIds },
    parentComment: null,
    isDeleted: false,
  })
    .populate("author", "userName role")
    .sort({ createdAt: 1 });

  const commentIds = comments.map((c) => c._id);

  // ===============================
  // 5️⃣ Lấy REPLIES (level 2)
  // ===============================
  const replies = await Comment.find({
    parentComment: { $in: commentIds },
    isDeleted: false,
  })
    .populate("author", "userName role")
    .sort({ createdAt: 1 });

  // ===============================
  // 6️⃣ Lấy reactions cho COMMENTS + REPLIES
  // ===============================
  const commentReactions = await Reaction.find({
    comment: { $in: [...commentIds, ...replies.map((r) => r._id)] },
  }).populate("user", "userName role");

  // Group reactions theo commentId
  const reactionsByComment = {};
  commentReactions.forEach((r) => {
    const key = r.comment.toString();
    if (!reactionsByComment[key]) reactionsByComment[key] = [];
    reactionsByComment[key].push(r);
  });

  // ===============================
  // 7️⃣ Gắn replies vào comment cha
  // ===============================
  const repliesByParent = {};
  replies.forEach((reply) => {
    const key = reply.parentComment.toString();
    if (!repliesByParent[key]) repliesByParent[key] = [];
    repliesByParent[key].push({
      ...reply.toObject(),
      reactions: reactionsByComment[reply._id.toString()] || [],
    });
  });

  // ===============================
  // 8️⃣ Gắn comments + reactions + replies vào post
  // ===============================
  const commentsByPost = {};
  comments.forEach((comment) => {
    const key = comment.post.toString();
    if (!commentsByPost[key]) commentsByPost[key] = [];
    commentsByPost[key].push({
      ...comment.toObject(),
      reactions: reactionsByComment[comment._id.toString()] || [],
      replies: repliesByParent[comment._id.toString()] || [],
    });
  });

  // ===============================
  // 9️⃣ Final payload cho frontend
  // ===============================
  const posts = channel.posts.map((post) => ({
    ...post.toObject(),
    reactions: reactionsByPost[post._id.toString()] || [],
    comments: commentsByPost[post._id.toString()] || [],
  }));

  // ===============================
  // 🔟 Lấy ATTENDANCES của EVENT
  // ===============================

  // Lấy tất cả registration của event
  const registrations = await Registration.find({
    eventId: event._id,
  }).select("_id userId");

  // Map regId
  const regIds = registrations.map((r) => r._id);

  // Lấy attendance theo regId + feedback
  const attendances = await Attendance.find({
    regId: { $in: regIds },
  })
    .select("+feedback +feedback.comment +checkOut")
    .populate({
      path: "regId",
      populate: {
        path: "userId",
        select: "userName userEmail role",
      },
    })
    .sort({ updatedAt: -1 });

  res.json({
    _id: channel._id,
    event: channel.event,
    posts,
    attendances,
    createdAt: channel.createdAt,
  });
});
