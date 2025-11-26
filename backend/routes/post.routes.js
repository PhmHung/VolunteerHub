/** @format */

import express from "express";
import {
  createPost,
  getPosts,
  getPostsByChannel,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { uploadPicture } from "../config/cloudinarystorage.js";

const router = express.Router();

/**
 * @route   POST /api/post
 * @desc    Create a post (volunteer, manager, admin allowed)
 * @access  Protected
 */
router.post(
  "/",
  protect,
  uploadPicture,
  createPost
);

/**
 * @route   GET /api/post
 * @desc    Get all posts (ADMIN only)
 * @access  Protected (Admin)
 */
router.get("/all-posts", protect, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Only admin can access all posts",
    });
  }
  next();
}, getPosts);

/**
 * @route   GET /api/post/:channelId/posts
 * @desc    Get all posts of a channel
 * @access  Admin or members (volunteers/managers) of the event linked to the channel
 */

router.get("/:channelId/posts", protect, getPostsByChannel);

/**
 * @route   PUT /api/post/:id
 * @desc    Update post 
 * @access  Protected (only owner)
 */
router.put(
  "/:id",
  protect,
  uploadPicture,
  updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post:
 *          - Owner can delete own post
 *          - Manager can delete volunteer's post
 *          - Admin can delete volunteer + manager posts
 * @access  Protected
 */
router.delete("/:id", protect, deletePost);

export default router;
