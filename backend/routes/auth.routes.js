/** @format */

import express from "express";
import dotenv from "dotenv"; 
dotenv.config({ path: ".env.development.local" });

import {
  sendVerificationCode,
  verifyCode,
  register,
  login,

  firebaseLogin,
} from "../controllers/auth.controller.js";
import { uploadPicture } from "../config/cloudinarystorage.js";
const router = express.Router();

router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);
router.post("/register", uploadPicture, register);
router.post("/login", login);


router.post("/firebase-login", firebaseLogin);

export default router;
