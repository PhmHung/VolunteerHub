import asyncHandler from "express-async-handler";
import Reaction from "../models/Reaction.js";
import Post from "../models/Post.js";

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

// Thêm reaction
export const addReaction = asyncHandler(async (req, res) => {
  const { post: postId, type } = req.body;
  if (!postId || !type) {
    res.status(400);
    throw new Error("postId and type are required");
  }

  const hasAccess = await checkEventAccessByPostId(req.user._id, postId);
  if (!hasAccess && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You do not have access to this post");
  }

  let reaction = await Reaction.findOne({ post: postId, user: req.user._id });
  if (reaction) {
    reaction.type = type;
    await reaction.save();
  } else {
    reaction = await Reaction.create({ post: postId, user: req.user._id, type });
  }

  res.status(201).json(reaction);
});

// Xóa reaction
export const removeReaction = asyncHandler(async (req, res) => {
  const reaction = await Reaction.findById(req.params.id).populate({
    path: "post",
    populate: { path: "channel", populate: { path: "event" } },
  });

  if (!reaction) {
    res.status(404);
    throw new Error("Reaction not found");
  }

  const event = reaction.post.channel.event;
  const isParticipant = event.participants.some(p => p.equals(req.user._id));
  const isCreator = event.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!reaction.user.equals(req.user._id) && !isCreator && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to remove this reaction");
  }

  await reaction.remove();
  res.json({ message: "Reaction removed" });
});
