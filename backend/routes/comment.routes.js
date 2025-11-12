import express from "express";
import { uploadPicture } from "../config/cloudinarystorage.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";

const router = express.Router();

router.route("/")
  .post(protect, uploadPicture, createComment);

router.route("/post/:postId")
  .get(protect, getCommentsByPost);

router.route("/:id")
  .put(protect, uploadPicture, updateComment)
  .delete(protect, deleteComment);

export default router;
