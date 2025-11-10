/** @format */

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
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
  const user = await User.findOne({ userEmail });
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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Email not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    console.log(token);

    res.status(200).json({
      message: "Login successful",
      picture: user.personalInformation.picture,
      token,
    });
  } catch (error) {
    next(error);
  }
};
// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { userName, userEmail, password, role } = req.body;
  if (!userName || !userEmail || !password || !role) {
    res.status(400);
    throw new Error("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
  }
  const userExists = await User.findOne({ userEmail });

  if (userExists) {
    res.status(400);
    throw new Error("Địa chỉ email này đã được sử dụng.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    userName,
    userEmail,
    password: hashedPassword,
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

const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, name, biography } = req.body;

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      throw new Error(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number."
      );
    }

    if (name.trim() === "") {
      throw new Error("Name is required and must be a non-empty string");
    }

    let pictureUrl = null;
    if (req.file) {
      pictureUrl = req.file.path; // Cloudinary trả về URL trực tiếp
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const personalInformation = {
      name,
      biography: biography || "",
      picture: pictureUrl,
    };

    const user = new User({
      email,
      password: hashedPassword,
      personalInformation,
    });
    await user.save({ session });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "User created successfully", user, token });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("Abort failed:", abortErr);
    }
    session.endSession();
    next(error);
  }
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

    // Verify token từ Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { uid, email, name, picture } = decodedToken;

    // Kiểm tra user trong DB
    let user = await User.findOne({ email });

    // Nếu chưa có user thì tạo mới
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
