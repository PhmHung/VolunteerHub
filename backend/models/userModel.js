/** @format */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    userName: { type: String, required: true, minlength: 1, maxlength: 50 },
    userEmail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 8, maxlength: 32 },
    role: {
      type: String,
      enum: ["volunteer", "manager", "admin"],
      required: true,
    },
    phoneNumber: {
      type: String,
      match: /^0\d{9,10}$/,
      minlength: 10,
      maxlength: 11,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
