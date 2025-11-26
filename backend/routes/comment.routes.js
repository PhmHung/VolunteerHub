/** @format */

import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadPicture } from "../config/cloudinarystorage.js";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

/**
 * @route   POST /api/comment
 * @desc    Create a comment (on post or another comment)
 * @access  Protected (Admin / manager / volunteer)
 */
router.post("/", protect, uploadPicture, createComment);

/**
 * @route   GET /api/comment/:postId
 * @desc    Get all comments of a post
 * @access  Admin or event members
 */
router.get("/:postId", protect, getCommentsByPost);

/**
 * @route   PUT /api/comment/:id
 * @desc    Update comment (owner only)
 * @access  Protected
 */
router.put("/:id", protect, uploadPicture, updateComment);

/**
 * @route   DELETE /api/comment/:id
 * @desc    Delete comment (role-based, similar to post)
 * @access  Protected
 */
router.delete("/:id", protect, deleteComment);

export default router;
