/** @format */

import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Redis from "ioredis";
import generateToken from "../utils/generateToken.js";
import {
  sendVerificationEmail,
  sendPasswordChangeEmail,
} from "../utils/send-email.js";
import admin from "firebase-admin";

import dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

let redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
} else {
  const store = new Map();
  redis = {
    set: async (key, value, mode, seconds) => {
      store.set(key, String(value));
      if (mode === "EX" && typeof seconds === "number") {
        setTimeout(() => store.delete(key), seconds * 1000);
      }
      return "OK";
    },
    get: async (key) => {
      return store.has(key) ? store.get(key) : null;
    },
  };
}

const saveCode = async (email, code) => {
  await redis.set(`verify:${email}`, code, "EX", 300); // 5 phút
};

const checkCode = async (email, code) => {
  const savedCode = await redis.get(`verify:${email}`);
  return savedCode === code;
};

const sendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ message: "Invalid email" });

    const existingUser = await User.findOne({ userEmail: email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const code = Math.floor(100000 + Math.random() * 900000);
    // Save in Redis
    await saveCode(email, code);

    await sendVerificationEmail(email, code);

    res.json({ message: "Verification code sent" });
  } catch (error) {
    next(error);
  }
};

const verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const isValid = await checkCode(email, code);
    if (!isValid)
      return res.status(400).json({ message: "Invalid or expired code" });

    // Tạo token chứa email
    const verifyToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    res.json({
      message: "Email verified successfully",
      verifyToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { userName, verifyToken, password, role, biology, phoneNumber } =
    req.body;
  if (!userName || !password || !role) {
    res.status(400);
    throw new Error("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
  }

  if (!verifyToken) {
    res.status(400);
    throw new Error("Vui lòng xác minh email trước khi đăng ký.");
  }

  // Giải mã token để lấy email
  let userEmail;
  try {
    const decoded = jwt.verify(verifyToken, process.env.JWT_SECRET);
    userEmail = decoded.email;
  } catch (error) {
    res.status(400);
    throw new Error("Token không hợp lệ hoặc đã hết hạn.");
  }

  // Kiểm tra email đã tồn tại chưa
  const userExists = await User.findOne({ userEmail });

  if (userExists) {
    res.status(400);
    throw new Error("Địa chỉ email này đã được sử dụng.");
  }

  const user = await User.create({
    userName,
    userEmail,
    password: password || null,
    phoneNumber,
    biology,
    profilePicture: req.file ? req.file.path : null,
    role: role,
  });

  if (user) {
    const payload = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      phoneNumber: user.phoneNumber,
      biology: user.biology,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    };

    console.log("Login information:", payload);

    res.status(201).json(payload);
  } else {
    res.status(400);
    throw new Error("Dữ liệu người dùng không hợp lệ.");
  }
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { userEmail, password } = req.body;
  const user = await User.findOne({ userEmail }).select("+password");

  if (user && (await bcrypt.compare(password, user.password))) {
    const payload = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      phoneNumber: user.phoneNumber,
      biology: user.biology,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    };

    console.log("Login information:", payload);

    res.json(payload);
  } else {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không hợp lệ.");
  }
});

// Khởi tạo Firebase Admin (làm 1 lần trong app)
if (!admin.apps.length) {
  try {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
      process.env;
    if (
      !FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ) {
      console.warn(
        "Firebase admin credentials not fully provided in environment variables. Skipping admin.initializeApp()."
      );
    } else {
      const privateKey = FIREBASE_PRIVATE_KEY.includes("\\n")
        ? FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : FIREBASE_PRIVATE_KEY;
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
  } catch (initErr) {
    console.error("Failed to initialize Firebase admin:", initErr);
  }
}

const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("Firebase ID Token is required.");
  }

  // ... (giữ nguyên phần verify token) ...
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired Firebase token.");
  }

  const { email } = decodedToken;
  const user = await User.findOne({ userEmail: email });

  if (!user) {
    res.status(404);
    // 👇 Bây giờ dòng này sẽ trả về JSON lỗi 404 cho frontend chứ không làm sập server nữa
    throw new Error("Account not found. Please register first.");
  }

  // ... (phần trả về payload giữ nguyên)
  const payload = {
    _id: user._id,
    userName: user.userName,
    userEmail: user.userEmail,
    role: user.role,
    phoneNumber: user.phoneNumber,
    biology: user.biology,
    profilePicture: user.profilePicture,
    token: generateToken(user._id),
  };

<<<<<<< Updated upstream
  res.status(200).json(payload);
=======
  console.log("Login information:", payload);  

  res.status(201).json(payload);  
>>>>>>> Stashed changes
});

export {
  saveCode,
  checkCode,
  sendVerificationCode,
  verifyCode,
  register,
  // loginUser,
  login,
  firebaseLogin,
};
