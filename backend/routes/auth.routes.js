/** @format */

import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

import {
  googleLogin,
  login,
  register,
  sendVerificationCode,
  verifyCode,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { uploadPicture } from "../config/cloudinarystorage.js";
const router = express.Router();

router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);
router.post("/google", googleLogin);

// @route POST /api/auth/register
router.post("/register", uploadPicture, registerUser);
// @route POST /api/auth/register-firebase
router.post("/register-firebase", uploadPicture, register);

// @route  POST /api/auth/login
router.post("/login", loginUser);
// @route POST /api/auth/login-firebase
router.post("/login-firebase", login);
export default router;
