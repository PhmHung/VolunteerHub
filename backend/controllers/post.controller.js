/** @format */
import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import Channel from "../models/channelModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import { emitNotification } from "../utils/notificationHelper.js";

// ================================
// CREATE POST
// ================================
export const createPost = asyncHandler(async (req, res) => {
  const { content, channel: channelId } = req.body;
  const image = req.file?.path || null; // nếu upload ảnh

  if (!content && !image) {
    return res.status(400).json({ message: "Post content or image required" });
  }

  // Lấy thông tin channel và event liên quan
  const channel = await Channel.findById(channelId).populate("event");
  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  const event = await Event.findById(channel.event._id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Kiểm tra quyền: admin hoặc thuộc event
  const userId = req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isEventMember =
    event.managers.map((id) => id.toString()).includes(userId) ||
    event.volunteers.map((id) => id.toString()).includes(userId);

  if (!isAdmin && !isEventMember) {
    return res
      .status(403)
      .json({ message: "You are not allowed to post in this channel" });
  }

  // Tạo post
  const post = await Post.create({
    content,
    image,
    author: req.user._id,
    channel: channelId,
  });

  channel.posts.push(post._id);
  await channel.save();
  if (req.io) {
    req.io.to(event._id.toString()).emit("FEED_UPDATE", {
      type: "NEW_POST",
      data: await post.populate("author", "userName profilePicture"),
    });
  }
  emitNotification(req, event._id.toString(), {
    title: "Bài viết mới trong Channel",
    message: `${req.user.userName} vừa đăng bài trong sự kiện "${event.title}"`,
    type: "info",
    link: `/media?eventId=${event._id}&postId=${post._id}`,
  });

  res.status(201).json(post);
});

// ================================
// GET ALL POSTS (ADMIN ONLY)
// ================================
export const getPosts = asyncHandler(async (req, res) => {
  // admin check đã có ở route
  const posts = await Post.find({})
    .populate("author", "userName role")
    .populate("channel")
    .populate({
      path: "comments",
      populate: { path: "author", select: "userName role" },
    })
    .sort({ createdAt: -1 });

  res.json(posts);
});

// ================================
// GET ALL POSTS OF A CHANNEL (Admin or event member)
// ================================
export const getPostsByChannel = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;

  const channel = await Channel.findById(channelId).populate({
    path: "event",
    populate: [
      { path: "volunteers", select: "_id userName role" },
      { path: "managers", select: "_id userName role" },
    ],
  });

  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  const event = channel.event;
  const userId = req.user?._id?.toString();
  const userRole = req.user?.role;

  // Admin luôn có quyền
  if (userRole !== "admin") {
    // Nếu không phải admin, phải là thành viên event
    const isVolunteer =
      event?.volunteers?.some((v) => v._id.toString() === userId) || false;
    const isManager =
      event?.managers?.some((m) => m._id.toString() === userId) || false;

    if (!isVolunteer && !isManager) {
      return res
        .status(403)
        .json({ message: "Access denied — you are not in this channel" });
    }
  }

  // Lấy tất cả post của channel (không lấy isDeleted)
  const posts = await Post.find({ channel: channelId, isDeleted: false })
    .populate("author", "userName role")
    .populate({
      path: "comments",
      populate: { path: "author", select: "userName role" },
    })
    .sort({ createdAt: -1 });

  res.json(posts);
});

// ================================
// UPDATE POST (OWNER ONLY)
// ================================
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post || post.isDeleted) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only update your own post" });
  }

  const { content } = req.body;
  const image = req.file?.path || post.image;

  post.content = content || post.content;
  post.image = image;

  const updatedPost = await post.save();
  res.json(updatedPost);
});

// ================================
// DELETE POST (ROLE BASED)
// ================================
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "role");

  if (!post || post.isDeleted) {
    res.status(404);
    throw new Error("Post not found");
  }

  const userRole = req.user.role;
  const authorRole = post.author.role;
  const userId = req.user._id.toString();
  const authorId = post.author._id.toString();

  // ROLE-BASED DELETE
  if (userRole === "volunteer") {
    if (userId !== authorId) {
      return res
        .status(403)
        .json({ message: "Volunteers can only delete their own posts" });
    }
  } else if (userRole === "manager") {
    if (authorRole !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Managers can only delete volunteer posts" });
    }
  } else if (userRole === "admin") {
    // Admin can delete volunteer and manager posts
    if (!["volunteer", "manager"].includes(authorRole)) {
      return res
        .status(403)
        .json({ message: "Admin cannot delete another admin's post" });
    }
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // SOFT DELETE
  post.isDeleted = true;
  await post.save();

  res.json({ message: "Post deleted successfully" });
});
