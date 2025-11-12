import express from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadPicture } from "../config/cloudinarystorage.js";


const router = express.Router();

// Các route đều cần login để kiểm tra quyền với event
router.route("/")
  .get(protect, getPosts)
  .post(protect, uploadPicture, createPost);

router.route("/:id")
  .get(protect, getPostById)
  .put(protect, uploadPicture, updatePost)
  .delete(protect, deletePost);

export default router;
