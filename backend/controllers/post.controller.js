import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import Channel from "../models/Channel.js";
import Event from "../models/Event.js";
import { uploadPicture } from "../config/cloudinarystorage.js";

// Kiểm tra quyền của user: là participant hoặc createdBy của event
const checkEventAccess = async (userId, eventId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  // user là participant
  const isParticipant = event.participants.some(p => p.equals(userId));

  // user là creator
  const isCreator = event.createdBy.equals(userId);

  return isParticipant || isCreator;
};

// @desc    Tạo bài viết mới
// @route   POST /api/posts
// @access  Protected
export const createPost = asyncHandler(async (req, res) => {
  const { content, channel: channelId } = req.body;

  if (!content || !channelId) {
    res.status(400);
    throw new Error("Content and channel are required");
  }

  // Lấy channel và event
  const channel = await Channel.findById(channelId).populate("event");
  if (!channel) {
    res.status(404);
    throw new Error("Channel not found");
  }

  const hasAccess = await checkEventAccess(req.user._id, channel.event._id);
  if (!hasAccess && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not a participant of this event");
  }

  if (req.file && req.file.path) {
    imageUrl = req.file.path
  }

  const post = await Post.create({
    content,
    channel: channelId,
    image: imageUrl,
    author: req.user._id,
  });

  res.status(201).json(post);
});

// @desc    Lấy danh sách bài viết (có tìm kiếm)
// @route   GET /api/posts
// @access  Protected (user phải thuộc event hoặc admin)
export const getPosts = asyncHandler(async (req, res) => {
  const { search, channel: channelId } = req.query;
  let query = { isDeleted: false };

  if (search) query.content = { $regex: search, $options: "i" };
  if (channelId) query.channel = channelId;

  let posts = await Post.find(query)
    .populate("author", "name userEmail")
    .populate({
      path: "channel",
      populate: { path: "event" },
    })
    .populate("comments")
    .populate("reactions");

  // Lọc các post theo quyền user
  posts = posts.filter(post => {
    const event = post.channel.event;
    const isParticipant = event.participants.some(p => p.equals(req.user._id));
    const isCreator = event.createdBy.equals(req.user._id);
    const isAdmin = req.user.role === "admin";
    return isParticipant || isCreator || isAdmin;
  });

  res.json(posts);
});

// @desc    Lấy bài viết theo ID
// @route   GET /api/posts/:id
// @access  Protected
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name userEmail")
    .populate({
      path: "channel",
      populate: { path: "event" },
    })
    .populate("comments")
    .populate("reactions");

  if (!post || post.isDeleted) {
    res.status(404);
    throw new Error("Post not found");
  }

  const event = post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(req.user._id));
  const isCreator = event.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isParticipant && !isCreator && !isAdmin) {
    res.status(403);
    throw new Error("You do not have access to this post");
  }

  res.json(post);
});

// @desc    Cập nhật bài viết
// @route   PUT /api/posts/:id
// @access  Protected
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: "channel",
    populate: { path: "event" },
  });

  if (!post || post.isDeleted) {
    res.status(404);
    throw new Error("Post not found");
  }

  const event = post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(req.user._id));
  const isCreator = event.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!req.user._id.equals(post.author) && !isCreator && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this post");
  }

  const { content } = req.body;
  if (content) post.content = content;
  if (req.file && req.file.path) {
    post.image = req.file.path
  }

  await post.save();
  res.json(post);
});

// @desc    Xóa bài viết (soft delete)
// @route   DELETE /api/posts/:id
// @access  Protected
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: "channel",
    populate: { path: "event" },
  });

  if (!post || post.isDeleted) {
    res.status(404);
    throw new Error("Post not found");
  }

  const event = post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(req.user._id));
  const isCreator = event.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!req.user._id.equals(post.author) && !isCreator && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to delete this post");
  }

  post.isDeleted = true;
  post.deletedAt = new Date();
  await post.save();

  res.json({ message: "Post deleted" });
});
