/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

// 👇 IMPORT MODELS (Lùi ra 1 cấp thư mục cha "..")
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";

// 👇 IMPORT DATA HELPER (Lùi ra 1 cấp để vào thư mục "data")
import generateApprovalRequests from "../database/approvalRequests.js";

// 👇 IMPORT KẾT NỐI DB (Giống seederUser.js)
import connectDB from "../config/mongodb.js";

// Load biến môi trường
dotenv.config();

// Kết nối Database
connectDB();

const seedApprovalRequests = async () => {
  try {
    console.log("Đang xử lý dữ liệu Approval Requests...".yellow);

    // 1. Dọn dẹp dữ liệu cũ
    await ApprovalRequest.deleteMany();
    console.log("Đã xóa Approval Requests cũ...".red);

    // 2. Lấy dữ liệu thực tế từ DB để liên kết
    // - Lấy các sự kiện đang chờ duyệt
    const pendingEvents = await Event.find({ status: "pending" });

    // - Lấy danh sách Volunteer active
    const volunteers = await User.find({ role: "volunteer", status: "active" });

    // - Lấy danh sách Manager
    const managers = await User.find({ role: "manager" });

    // Kiểm tra dữ liệu đầu vào
    if (volunteers.length === 0) {
      console.log(
        "Cảnh báo: Không tìm thấy Volunteer nào để tạo yêu cầu.".yellow
      );
      process.exit();
    }

    // 3. Sinh dữ liệu từ hàm helper
    const requestsToInsert = generateApprovalRequests(
      volunteers,
      pendingEvents,
      managers
    );

    // 4. Insert vào Database
    await ApprovalRequest.insertMany(requestsToInsert);

    console.log("Data Imported Successfully!".green.inverse);
    console.log(`- Đã tạo: ${requestsToInsert.length} yêu cầu duyệt.`);

    process.exit();
  } catch (error) {
    console.error(`Lỗi: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Chạy hàm
seedApprovalRequests();
