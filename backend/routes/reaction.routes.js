/** @format */

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addReaction,
  removeReaction,
  getReactions,
} from "../controllers/reaction.controller.js";

const router = express.Router();

/**
 * @route   POST /api/reaction
 * @desc    Add reaction to a post or comment
 * @access  Protected
 */
router.post("/", protect, addReaction);

/**
 * @route   DELETE /api/reaction/:id
 * @desc    Remove a reaction (owner only)
 * @access  Protected
 */
router.delete("/:id", protect, removeReaction);

/**
 * @route   GET /api/reaction
 * @desc    Get reactions of a post or comment
 * @access  Protected
 * @query   ?post=postId or ?comment=commentId
 */
router.get("/", protect, getReactions);

export default router;
