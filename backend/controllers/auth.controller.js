/** @format */

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
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
  await redis.set(`verify:${email}`, code, "EX", 60); // 1 phút
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

    const existingUser = await User.findOne({ email });
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

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { userEmail, password } = req.body;
  const user = await User.findOne({ userEmail }).select("+password");

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không hợp lệ.");
  }
});

// @desc   Login user
// @route  POST /api/auth/login-firebase
// @access Public
const login = async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("Firebase ID Token is required.");
  }
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
    throw new Error("Account not found. Please register first.");
  }

  const appToken = generateToken(user._id);

  res.status(200).json({
    message: "Login successful",
    _id: user._id,
    userName: user.userName,
    userEmail: user.userEmail,
    phoneNumber: user.phoneNumber,
    profilePicture: user.profilePicture,
    role: user.role,
    token: appToken,
  });
};
// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { userName, userEmail, password, role, phoneNumber } = req.body;
  if (!userName || !userEmail || !password || !role) {
    res.status(400);
    throw new Error("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
  }
  const userExists = await User.findOne({ userEmail });

  if (userExists) {
    res.status(400);
    throw new Error("Địa chỉ email này đã được sử dụng.");
  }

  const user = await User.create({
    userName,
    userEmail,
    password: password,
    phoneNumber,
    role: role || "volunteer",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Dữ liệu người dùng không hợp lệ.");
  }
});

// @desc   Login user
// @route  POST /api/auth/register-firebase
// @access Public
const register = async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error("Firebase ID Token is required.");
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired Firebase token.");
  }

  const {
    email,
    name: firebaseName,
    picture: firebasePicture,
    uid: firebaseUid,
  } = decodedToken;

  const existingUser = await User.findOne({ userEmail: email });

  if (existingUser) {
    res.status(409);
    throw new Error("Email already registered. Please login.");
  }

  const tempPassword = Math.floor(
    10000000 + Math.random() * 90000000
  ).toString();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(tempPassword, salt);
  const newUser = new User({
    userEmail: email,
    password: hashedPassword,
    userName: firebaseName || email.split("@")[0],
    role: "volunteer",
    profilePicture: firebasePicture || null,
    googleId: firebaseUid,
    isEmailVerified: true,
    status: "active",
  });

  await newUser.save();
  const appToken = generateToken(newUser._id);

  res.status(201).json({
    message: "Registration successful",
    _id: newUser._id,
    userName: newUser.userName,
    userEmail: newUser.userEmail,
    profilePicture: newUser.profilePicture,
    role: newUser.role,
    token: appToken,
  });
};

// Khởi tạo Firebase Admin
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

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing token" });
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;
    let user = await User.findOne({ email });
    if (!user) {
      const personalInformation = {
        name: name || "No Name",
        picture: picture || null,
        biography: "",
      };

      const password = Math.floor(100000 + Math.random() * 900000); // 6 chữ số

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.toString(), salt);

      user = new User({
        email,
        password: hashedPassword, // không có password vì login bằng Google
        personalInformation,
      });

      await user.save();
      console.log("Created new user:", user);
    }

    // Tạo JWT cho app
    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: "Login successful",
      picture: user.personalInformation.picture,
      token: appToken,
    });

    console.log({
      message: "Login successful",
      picture: user.personalInformation.picture,
      token: appToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};

export {
  saveCode,
  checkCode,
  sendVerificationCode,
  verifyCode,
  loginUser,
  login,
  registerUser,
  register,
  googleLogin,
};
