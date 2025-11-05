/** @format */

import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc   Update user profile
// @route  PUT /api/users/profile
// @access Public
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    //Update User name
    user.userName = req.body.userName || user.userName;

    //Update Phone number
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    //Update Profile Picture
    if (req.file && req.file.path) {
      user.profilePicture = req.file.path;
    }
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      userName: updatedUser.userName,
      userEmail: updatedUser.userEmail,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc   GET all user
// @route  GET/api/users
// @access Private/Admin,Manager
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

// @desc   Delete user
// @route  DELETE/api/users
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete admin user");
  }

  await user.deleteOne();
  res.status(200).json({ message: "User removed" });
});

// @desc   GET user by ID
// @route  GET/api/users/:id
// @access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// @desc   Update user role, Admin only
// @route  PUT/api/users/:id/role
// @access Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role: newRole } = req.body;
  if (!newRole) {
    res.status(400);
    throw new Error("Role is required");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const currentRole = user.role;
  if (currentRole === "admin") {
    res.status(400);
    throw new Error("Admin cannot change admin role");
  }
  if (currentRole === newRole) {
    res.status(0);
    throw new Error("User already has this role");
  }

  if (currentRole === "volunteer" && newRole === "admin") {
    res.status(400);
    throw new Error("Cannot promote volunteer directly to admin");
  }

  user.role = newRole;
  const updatedUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    userName: updatedUser.userName,
    role: updatedUser.role,
  });
});

// @desc Change user password
// @route PUT /api/users/profile/change-password
// @access Private
const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }

  const user = await User.findById(req.user._id);
  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    sendPasswordChangeEmail(user.userEmail, user.userName).catch((err) => {
      console.error("Error sending password change email:", err);
    });
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
});

// @desc   Get user profile
// @route  GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user) {
    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUserRole,
  changeUserPassword,
  getUserProfile,
};
