/** @format */

import express from "express";
import {
  authUsers,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js"; // (Kiểm tra lại đường dẫn)

// --- Middlewares ---
import {
  authorize,
  allowAdminOnly,
  allowAdminOrManager,
  // Lưu ý: 'allowSelfOrAdmin' không còn cần thiết
  // vì chúng ta đã tách biệt route '/profile' (tự) và '/:id' (admin)
} from "../middlewares/auth.middleware.js"; // (Kiểm tra lại đường dẫn)

// --- File Upload ---
import { uploadPicture } from "../config/cloudinarystorage.js";

const router = express.Router();

/*=======================================
 * 1. AUTH ROUTES (PUBLIC)
 *=======================================*/

// @route  POST /api/users/ (Đăng ký)
router.post("/", registerUser);

// @route  POST /api/users/login (Đăng nhập)
router.post("/login", authUsers);

/*=======================================
 * 2. SELF-SERVICE ROUTES (PRIVATE - Yêu cầu `authorize`)
 * Các route này hoạt động dựa trên `req.user` (người dùng đã đăng nhập)
 *=======================================*/

// @route  GET /api/users/profile (Lấy hồ sơ CỦA TÔI)
// @route  PUT /api/users/profile (Cập nhật hồ sơ CỦA TÔI)
// @route  DELETE /api/users/profile (Xóa tài khoản CỦA TÔI)
router
  .route("/profile")
  .get(authorize, getUserProfile)
  .put(authorize, uploadPicture, updateUserProfile)
  .delete(authorize, deleteUser); // (Lưu ý: Cần chỉnh controller `deleteUser` để xử lý việc tự xóa)

// @route  PUT /api/users/profile/change-password (Đổi mật khẩu CỦA TÔI)
router.put("/profile/change-password", authorize, changePassword);

/*=======================================
 * 3. ADMIN / MANAGER ROUTES (RESTRICTED - Yêu cầu `authorize` + `Role`)
 * Các route này hoạt động dựa trên `req.params.id` (ID của người khác)
 *=======================================*/

// @route  GET /api/users/ (Lấy TẤT CẢ người dùng)
// (Cho phép Manager và Admin)
router.get("/", authorize, allowAdminOrManager, getAllUsers);

// @route  GET /api/users/:id (Lấy 1 người dùng bằng ID)
// @route  PUT /api/users/:id (Cập nhật 1 người dùng bằng ID - Admin)
// @route  DELETE /api/users/:id (Xóa 1 người dùng bằng ID - Admin)
router
  .route("/:id")
  .get(authorize, allowAdminOrManager, getUserById) // Manager/Admin có thể xem
  .put(authorize, allowAdminOnly, uploadPicture, updateUser) // Chỉ Admin được cập nhật
  .delete(authorize, allowAdminOnly, deleteUser); // Chỉ Admin được xóa

// @route  PUT /api/users/:id/role (Cập nhật VAI TRÒ của 1 người dùng)
// (Chỉ Admin)
router.put("/:id/role", authorize, allowAdminOnly, updateUserRole);

export default router;
