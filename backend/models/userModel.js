/** @format */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, minlength: 1, maxlength: 50 },
    userEmail: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    //1024
    password: { type: String, required: true, minlength: 6, maxlength: 255 },
    role: {
      type: String,
      enum: ["volunteer", "manager", "admin"],
      required: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    biology: {
      type: String,
      maxlength: 500,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
