/** @format */

import express from "express";
import { uploadPicture } from "../config/cloudinarystorage.js";

import {
  protect,
  allowAdminOnly,
  allowAdminOrManager,
} from "../middlewares/auth.middleware.js";

import {
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUserRole,
  changeUserPassword,
  getUserProfile,
} from "../controllers/user.controller.js";
const router = express.Router();

// @route  GET /api/users/profile (Lấy hồ sơ CỦA TÔI)
// @route  PUT /api/users/profile (Cập nhật hồ sơ CỦA TÔI)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, uploadPicture, updateUserProfile);

// @route  PUT /api/users/profile/change-password
router.put("/profile/change-password", protect, changeUserPassword);

// @route  GET /api/users/
router.get("/", protect, allowAdminOrManager, getAllUsers);

// @route  GET /api/users/:id
// @route  DELETE /api/users/:id
router
  .route("/:id")
  .get(protect, allowAdminOrManager, getUserById)
  .delete(protect, allowAdminOnly, deleteUser);

// @route  PUT /api/users/:id/role
router.put("/:id/role", protect, allowAdminOnly, updateUserRole);

export default router;
