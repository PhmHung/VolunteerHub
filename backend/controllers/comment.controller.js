import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { uploadPicture } from "../config/cloudinarystorage.js";

// Kiểm tra quyền user theo event của post
const checkEventAccessByPostId = async (userId, postId) => {
  const post = await Post.findById(postId).populate({
    path: "channel",
    populate: { path: "event" },
  });
  if (!post) throw new Error("Post not found");
  const event = post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(userId));
  const isCreator = event.createdBy.equals(userId);
  return isParticipant || isCreator;
};

// Tạo comment
export const createComment = asyncHandler(async (req, res) => {
  const { content, post: postId, parentComment } = req.body;
  if (!content || !postId) {
    res.status(400);
    throw new Error("Content and postId are required");
  }

  const hasAccess = await checkEventAccessByPostId(req.user._id, postId);
  if (!hasAccess && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You do not have access to this post");
  }

  if (req.file && req.file.path) {
    imageUrl = req.file.path
  }

  const comment = await Comment.create({
    content,
    post: postId,
    parentComment: parentComment || null,
    image: imageUrl,
    author: req.user._id,
  });

  res.status(201).json(comment);
});

// Lấy comment theo post
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const hasAccess = await checkEventAccessByPostId(req.user._id, postId);
  if (!hasAccess && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You do not have access to this post");
  }

  const comments = await Comment.find({ post: postId })
    .populate("author", "name userEmail")
    .populate("parentComment");

  res.json(comments);
});

// Update comment
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate({
    path: "post",
    populate: { path: "channel", populate: { path: "event" } },
  });

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const event = comment.post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(req.user._id));
  const isCreator = event.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!req.user._id.equals(comment.author) && !isCreator && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this comment");
  }

  if (req.body.content) comment.content = req.body.content;
  if (req.file && req.file.path) {
    comment.image = req.file.path
  }

  await comment.save();
  res.json(comment);
});

// Delete comment
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate({
    path: "post",
    populate: { path: "channel", populate: { path: "event" } },
  });

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const event = comment.post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(req.user._id));
  const isCreator = event.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!req.user._id.equals(comment.author) && !isCreator && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  await comment.remove();
  res.json({ message: "Comment deleted" });
});
