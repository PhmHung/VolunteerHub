/** @format */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    //userId: { type: mongoose.Schema.Types.ObjectId },
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
      //default : "volunteer",
      required: true,
    },
    phoneNumber: {
      type: String,
      match: /^0\d{9,10}$/,
      minlength: 0,
      maxlength: 12,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    // googleId: {
    //   type: String,
    //   unique: true,
    //   sparse: true,
    // },
    // isEmailVerified: {
    //   type: Boolean,
    //   default: false,
    // },
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
