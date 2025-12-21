/** @format */
import asyncHandler from "express-async-handler";
import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import Event from "../models/eventModel.js";
import Channel from "../models/channelModel.js";

// ================================
// CREATE COMMENT
// ================================
export const createComment = asyncHandler(async (req, res) => {
  const { content, post: postId, parentComment } = req.body;
  const image = req.file?.path || null;

  if (!content && !image) {
    return res
      .status(400)
      .json({ message: "Comment content or image required" });
  }

  let post = null;

  // Nếu parentComment tồn tại, lấy post từ parentComment
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent || parent.isDeleted) {
      return res.status(404).json({ message: "Parent comment not found" });
    }
    post = await Post.findById(parent.post).populate("channel");
    if (!post || post.isDeleted) {
      return res
        .status(404)
        .json({ message: "Post not found for this parent comment" });
    }
  } else if (postId) {
    post = await Post.findById(postId).populate("channel");
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }
  } else {
    return res
      .status(400)
      .json({ message: "post or parentComment is required" });
  }

  // Kiểm tra quyền: giống post
  const channel = await Channel.findById(post.channel._id).populate("event");
  const event = channel.event;
  const userId = req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isEventMember =
    event.managers.map((id) => id.toString()).includes(userId) ||
    event.volunteers.map((id) => id.toString()).includes(userId);

  if (!isAdmin && !isEventMember) {
    return res
      .status(403)
      .json({ message: "You are not allowed to comment on this post" });
  }

  // Tạo comment
  const comment = await Comment.create({
    content,
    image,
    author: req.user._id,
    post: post._id,
    parentComment: parentComment || null,
  });

  if (req.io) {
    req.io.to(event._id.toString()).emit("FEED_UPDATE", {
      type: "NEW_COMMENT",
      postId: post._id,
      data: await comment.populate("author", "userName profilePicture"),
    });
  }
  emitNotification(req, event._id.toString(), {
    title: "Thảo luận mới",
    message: `${req.user.userName} vừa bình luận trong sự kiện "${event.title}"`,
    type: "info",
    link: `/media?eventId=${event._id}&postId=${post._id}`,
  });

  if (post.author.toString() !== req.user._id.toString()) {
    emitNotification(req, post.author.toString(), {
      title: "Bình luận mới",
      message: `${
        req.user.userName
      } đã bình luận bài viết của bạn: "${content.substring(0, 30)}..."`,
      type: "success",
      link: `/media?eventId=${event._id}&postId=${post._id}`,
    });
  }

  res.status(201).json(comment);
});

// ================================
// GET COMMENTS OF A POST
// ================================
export const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;

  const post = await Post.findById(postId).populate("channel");
  if (!post || post.isDeleted) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Kiểm tra quyền: giống post
  const channel = await Channel.findById(post.channel._id).populate("event");
  const event = channel.event;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  if (userRole !== "admin") {
    const isVolunteer = event.volunteers.some((v) => v.toString() === userId);
    const isManager = event.managers.some((m) => m.toString() === userId);
    if (!isVolunteer && !isManager) {
      return res.status(403).json({
        message: "Access denied — you are not in this post's channel",
      });
    }
  }

  const comments = await Comment.find({ post: postId, isDeleted: false })
    .populate("author", "userName role")
    .populate({
      path: "parentComment",
      populate: { path: "author", select: "userName role" },
    })
    .sort({ createdAt: -1 });

  res.json(comments);
});

// ================================
// UPDATE COMMENT (OWNER ONLY)
// ================================
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.isDeleted) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only update your own comment" });
  }

  const { content } = req.body;
  const image = req.file?.path || comment.image;

  comment.content = content || comment.content;
  comment.image = image;

  const updatedComment = await comment.save();
  res.json(updatedComment);
});

// ================================
// DELETE COMMENT (ROLE-BASED)
// ================================
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate(
    "author",
    "role"
  );
  if (!comment || comment.isDeleted) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const userRole = req.user.role;
  const authorRole = comment.author.role;
  const userId = req.user._id.toString();
  const authorId = comment.author._id.toString();

  // ROLE-BASED DELETE
  if (userRole === "volunteer") {
    if (userId !== authorId) {
      return res
        .status(403)
        .json({ message: "Volunteers can only delete their own comments" });
    }
  } else if (userRole === "manager") {
    if (authorRole !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Managers can only delete volunteer comments" });
    }
  } else if (userRole === "admin") {
    if (!["volunteer", "manager"].includes(authorRole)) {
      return res
        .status(403)
        .json({ message: "Admin cannot delete another admin's comment" });
    }
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // SOFT DELETE
  comment.isDeleted = true;
  await comment.save();

  res.json({ message: "Comment deleted successfully" });
});
