/** @format */

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Registration from "../models/registrationModel.js";
import Attendance from "../models/attendanceModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import generateToken from "../utils/generateToken.js";
import { emitNotification } from "../utils/notificationHelper.js";

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
    //Update Biography
    user.biography = req.body.biography || user.biography;
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
      biography: updatedUser.biography,
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

// @desc   GET user by ID (with real participation history from Attendance)
// @route  GET /api/users/:id
// @access Private/Admin,Manager
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const registrationIds = await Registration.find({ userId: userId }).distinct(
    "_id"
  );

  const attendanceHistory = await Attendance.find({
    regId: { $in: registrationIds },
    status: { $in: ["completed", "absent"] },
  })
    .populate({
      path: "regId",
      select: "eventId createdAt status",
      populate: {
        path: "eventId",
        select: "title startDate endDate location status image",
      },
    })
    .sort({ checkOut: -1, checkIn: -1 })
    .exec();
  const history = attendanceHistory

    .filter((att) => att.regId && att.regId.eventId && att.regId.eventId.title)
    .map((att) => ({
      attendanceId: att._id,
      checkIn: att.checkIn,
      checkOut: att.checkOut,
      status: att.status,
      feedback: att.feedback,

      event: att.regId?.eventId,
      registeredAt: att.regId?.createdAt,
      registrationStatus: att.regId?.status,
    }));

  res.json({
    ...user.toObject(),
    history,
  });
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
      biography: user.biography,
      profilePicture: user.profilePicture,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc   Lock user
// @route  PUT /api/users/profile
// @access Private/Admin && Manager
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Kiểm tra status hợp lệ
  if (!["active", "inactive"].includes(status)) {
    res.status(400);
    throw new Error(
      "Trạng thái không hợp lệ. Chỉ chấp nhận: active hoặc inactive"
    );
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  // Cấm khóa/mở khóa tài khoản Admin
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Không thể thay đổi trạng thái tài khoản Quản trị viên");
  }

  // Manager chỉ được khóa/mở khóa tình nguyện viên
  if (req.user.role === "manager" && user.role !== "volunteer") {
    res.status(403);
    throw new Error("Bạn chỉ được phép quản lý tài khoản tình nguyện viên");
  }

  // Cập nhật trạng thái
  user.status = status;
  await user.save();
  emitNotification(req, user._id.toString(), {
    title:
      status === "active" ? "Tài khoản đã mở khóa" : "Tài khoản đã bị khóa",
    message:
      status === "active"
        ? "Chào mừng trở lại! Bạn có thể tiếp tục tham gia hoạt động."
        : "Tài khoản của bạn đã bị tạm khóa bởi quản trị viên.",
    type: status === "active" ? "success" : "danger",
    link: "/information",
  });

  res.status(200).json({
    message: `Tài khoản đã được ${
      status === "active" ? "mở khóa" : "khóa"
    } thành công`,
    user: {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      phoneNumber: user.phoneNumber,
      biology: user.biology,
      role: user.role,
      status: user.status,
    },
  });
});

// @desc    Gửi yêu cầu thăng cấp lên Manager (dành cho Volunteer đã có tài khoản)
// @route   POST /api/users/request-manager
// @access  Private (Chỉ cần bảo vệ route, logic kiểm tra vai trò sẽ xử lý ở đây)
const requestManagerRole = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. KIỂM TRA TRẠNG THÁI HIỆN TẠI VÀ QUYỀN GỬI
  const user = await User.findById(userId);

  if (user.role === "manager" || user.role === "admin") {
    res.status(400);
    throw new Error("Bạn đã là Manager hoặc Admin.");
  }

  // 2. KIỂM TRA YÊU CẦU ĐANG CHỜ DUYỆT
  const existingRequest = await ApprovalRequest.findOne({
    requestedBy: userId,
    type: "manager_promotion",
    status: "pending",
  });

  if (existingRequest) {
    res.status(400);
    throw new Error("Bạn đã có một yêu cầu thăng cấp Manager đang chờ duyệt.");
  }

  // 3. TÍNH TOÁN KINH NGHIỆM THỰC TẾ
  // Lưu ý: Hàm calculateVolunteerExperience phải được import/định nghĩa đúng
  const experienceStats = await calculateVolunteerExperience(userId);

  // 4. TẠO APPROVAL REQUEST
  const request = await ApprovalRequest.create({
    type: "manager_promotion",
    requestedBy: userId,
    status: "pending",
    // Chèn dữ liệu đã tính toán
    promotionData: experienceStats,
  });

  emitNotification(req, "admin", {
    title: "Yêu cầu thăng cấp Manager",
    message: `Người dùng ${req.user.userName} vừa gửi yêu cầu thăng cấp quyền Manager.`,
    type: "info",
    link: `/admin/dashboard?tab=managers&highlight=${userId}`,
  });

  res.status(201).json({
    message:
      "Đã gửi yêu cầu thăng cấp Manager thành công. Vui lòng chờ Admin duyệt.",
    data: request,
  });
});

// backend/controllers/user.controller.js

// @desc    Lấy danh sách gợi ý thăng cấp (Phiên bản Safe Mode)
// @route   GET /api/users/suggested-managers
const getSuggestedManagers = asyncHandler(async (req, res) => {
  try {
    // 1. Lấy danh sách ID đã gửi yêu cầu rồi để loại trừ
    const existingRequests = await ApprovalRequest.find({
      type: "manager_promotion",
      status: { $in: ["pending", "approved"] },
    }).select("requestedBy");

    // Chuyển về mảng ID string để đảm bảo so sánh đúng
    const existingRequestIds = existingRequests.map(
      (r) => r.requestedBy?._id || r.requestedBy
    );

    // 2. Aggregation Pipeline
    const suggestions = await Attendance.aggregate([
      // A. Lọc dữ liệu sạch: Phải completed VÀ có đủ checkIn/checkOut
      {
        $match: {
          status: "completed",
          checkIn: { $exists: true, $ne: null },
          checkOut: { $exists: true, $ne: null },
        },
      },

      // B. Lookup Registration
      {
        $lookup: {
          from: "registrations",
          localField: "regId",
          foreignField: "_id",
          as: "registration",
        },
      },
      { $unwind: "$registration" },

      // C. Lookup User
      {
        $lookup: {
          from: "users",
          localField: "registration.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // D. Lọc User: Volunteer, Active, Chưa request
      {
        $match: {
          "user.role": "volunteer",
          "user.status": "active",
          "user._id": { $nin: existingRequestIds },
        },
      },

      // E. Group & Tính toán
      {
        $group: {
          _id: "$user._id",
          userName: { $first: "$user.userName" },
          userEmail: { $first: "$user.userEmail" },
          profilePicture: { $first: "$user.profilePicture" },
          eventsCompleted: { $sum: 1 },
          // An toàn: Chuyển sang Date trước khi trừ để tránh lỗi
          totalDurationMs: {
            $sum: {
              $subtract: [{ $toDate: "$checkOut" }, { $toDate: "$checkIn" }],
            },
          },
          avgRating: { $avg: "$feedback.rating" },
        },
      },

      // F. Format kết quả
      {
        $project: {
          _id: 1,
          userName: 1,
          userEmail: 1,
          profilePicture: 1,
          promotionData: {
            eventsCompleted: "$eventsCompleted",
            totalAttendanceHours: {
              $round: [{ $divide: ["$totalDurationMs", 1000 * 60 * 60] }, 1],
            },
            // Dùng ifNull để tránh lỗi nếu avgRating là null
            averageRating: { $round: [{ $ifNull: ["$avgRating", 0] }, 1] },
          },
        },
      },

      { $sort: { "promotionData.totalAttendanceHours": -1 } },
      { $limit: 20 },
    ]);

    res.json({
      count: suggestions.length,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error in getSuggestedManagers:", error);
    res.status(500);
    throw new Error("Lỗi Server khi tính toán gợi ý: " + error.message);
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
  updateUserStatus,
  requestManagerRole,
  getSuggestedManagers,
};
