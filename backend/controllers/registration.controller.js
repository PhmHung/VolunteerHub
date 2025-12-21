/** @format */

import asyncHandler from "express-async-handler";
import Registration from "../models/registrationModel.js";
import Event from "../models/eventModel.js";
import Attendance from "../models/attendanceModel.js";


// Import Enum từ file constants (Đảm bảo đường dẫn đúng với cấu trúc dự án của bạn)
import { REGISTRATION_STATUS, EVENT_STATUS } from "../config/typeEnum.js";

// @desc    Đăng ký tham gia sự kiện (Mặc định là WAITLISTED - Chờ duyệt)
// @route   POST /api/registrations
// @access  Private (Volunteer)
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  // 1. Kiểm tra sự kiện có tồn tại và đã được Approved chưa
  const event = await Event.findById(eventId);
  if (!event || event.status !== EVENT_STATUS.APPROVED) {
    res.status(400);
    throw new Error("Sự kiện không tồn tại hoặc chưa được duyệt");
  }

  // 2. Kiểm tra xem User đã có hồ sơ đăng ký chưa
  const existingReg = await Registration.findOne({
    userId: req.user._id,
    eventId,
  });

  if (existingReg) {
    // TRƯỜNG HỢP: Đã từng đăng ký nhưng bị hủy (do tự hủy hoặc bị từ chối)
    // -> Cho phép đăng ký lại (Reset về trạng thái WAITLISTED)
    if (existingReg.status === REGISTRATION_STATUS.CANCELLED) {
      existingReg.status = REGISTRATION_STATUS.WAITLISTED;
      await existingReg.save();

      return res.status(200).json({
        message: "Đăng ký lại thành công! Vui lòng chờ duyệt.",
        data: existingReg,
      });
    }

    // TRƯỜNG HỢP: Đang chờ (WAITLISTED) hoặc Đã tham gia (REGISTERED)
    res.status(400);
    throw new Error("Bạn đã đăng ký sự kiện này rồi.");
  }

  // 3. Tạo đơn đăng ký mới (Status: WAITLISTED)
  const registration = await Registration.create({
    userId: req.user._id,
    eventId,
    status: REGISTRATION_STATUS.WAITLISTED,
  });

  // LƯU Ý: KHÔNG tăng event.currentParticipants ở đây vì chưa được duyệt!

  res.status(201).json({
    message: "Đăng ký thành công, vui lòng chờ duyệt",
    data: registration,
  });
});

// @desc    Hủy đăng ký (User tự hủy)
// @route   DELETE /api/registrations/:id (Thực tế là update status)
// @access  Private (Owner/Manager)
const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đăng ký");
  }

  // Kiểm tra quyền: Chỉ chủ sở hữu đơn hoặc Manager mới được hủy
  if (
    registration.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "manager" &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Không có quyền thực hiện hành động này");
  }

  // Nếu đơn đã hủy rồi thì báo lỗi hoặc return luôn
  if (registration.status === REGISTRATION_STATUS.CANCELLED) {
    return res
      .status(400)
      .json({ message: "Đơn đăng ký này đã bị hủy trước đó." });
  }

  const event = await Event.findById(registration.eventId);

  // LOGIC ĐẾM SỐ LƯỢNG (QUAN TRỌNG):
  // Chỉ trừ slot nếu User đang ở trạng thái REGISTERED (đã chiếm chỗ).
  // Nếu đang WAITLISTED (chưa chiếm chỗ) thì không cần trừ.
  if (registration.status === REGISTRATION_STATUS.REGISTERED && event) {
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();
  }

  // Soft Delete: Chuyển trạng thái sang CANCELLED
  registration.status = REGISTRATION_STATUS.CANCELLED;
  await registration.save();

  res.json({ message: "Hủy đăng ký thành công" });
});

// @desc    Lấy danh sách đăng ký của tôi
// @route   GET /api/registrations/my-registrations
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ userId: req.user._id })
    .populate("eventId")
    .sort({ createdAt: -1 }); // Mới nhất lên đầu

  res.status(200).json({
    success: true,
    data: registrations,
  });
});

const getMyQRCode = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const registration = await Registration.findOne({
    eventId,
    userId: req.user._id,
    status: "registered",
  });

  if (!registration || !registration.qrToken) {
    return res.status(404).json({ message: "Chưa có QR" });
  }

  res.json({
    qrToken: registration.qrToken,
  });
});

export const checkOutByQr = async (req, res) => {
  try {
    const { qrToken } = req.body;
    const userId = req.user._id;

    if (!qrToken) {
      return res.status(400).json({
        message: "Thiếu qrToken",
      });
    }

    // 1️⃣ Tìm registration theo qrToken
    const registration = await Registration.findOne({ qrToken });

    if (!registration) {
      return res.status(404).json({
        message: "QR không hợp lệ hoặc không tồn tại",
      });
    }

    // 2️⃣ Tìm event
    const event = await Event.findById(registration.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện",
      });
    }

    // 3️⃣ Kiểm tra user có phải manager của event không
    const isManager = event.managers.some(
      (managerId) => managerId.toString() === userId.toString()
    );

    if (!isManager) {
      return res.status(403).json({
        message: "Bạn không có quyền check-out cho sự kiện này",
      });
    }

    // 4️⃣ Tìm attendance
    const attendance = await Attendance.findOne({
      regId: registration._id,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Trạng thái tham gia không tồn tại",
      });
    }

    console.log("ATTENDANCE FOUND:", attendance._id);

    // 5️⃣ Kiểm tra đã check-out chưa
    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Người dùng đã check-out trước đó",
      });
    }

    // 6️⃣ Thực hiện check-out
    attendance.checkOut = new Date();
    attendance.status = "completed"; // Cập nhật trạng thái thành completed
    await attendance.save();

    // 7️⃣ Populate để trả dữ liệu đẹp
    await attendance.populate({
  path: "regId",
  populate: [
    { path: "userId", select: "name email" },
    { path: "eventId", select: "title" },
  ],
});

console.log("CHECK-OUT SUCCESS");
return res.json({
  message: "Check-out thành công",
  data: {
    user: attendance.regId.userId,
    event: attendance.regId.eventId,
    checkOut: attendance.checkOut,
  },
});



  } catch (error) {
    console.error("CHECK-OUT ERROR:", error);
    return res.status(500).json({
      message: "Lỗi server khi check-out",
    });
  }
};

// @desc    Lấy TOÀN BỘ danh sách đăng ký cho Admin (thay vì chỉ pending)
// @route   GET /api/registrations/admin/all
// @access  Private (Manager/Admin)
const getAllRegistrationsForManagement = asyncHandler(async (req, res) => {
  // 1. XÓA ĐIỀU KIỆN status: { ... } ĐỂ LẤY TẤT CẢ
  const registrations = await Registration.find({})
    .populate({
      path: "userId",
      select: "userName userEmail profilePicture phoneNumber",
    })
    .populate({
      path: "eventId",
      select: "title startDate endDate",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: registrations,
  });
});

// @desc    Manager duyệt đơn đăng ký
// @route   PUT /api/registrations/:id/accept
// @access  Private (Manager/Admin)
const acceptRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đăng ký");
  }

  const event = await Event.findById(registration.eventId);
  if (!event) {
    res.status(404);
    throw new Error("Sự kiện không tồn tại");
  }

  // Check quyền sở hữu Event (Manager tạo ra event này mới được duyệt)
  if (
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền duyệt đơn cho sự kiện này");
  }

  // Kiểm tra sức chứa (Capacity)
  if (event.currentParticipants >= event.maxParticipants) {
    res.status(400);
    throw new Error("Sự kiện đã đủ người tham gia, không thể duyệt thêm.");
  }

  // Chỉ xử lý nếu đơn chưa được duyệt (tránh duyệt đi duyệt lại bị cộng dồn số)
  if (registration.status !== REGISTRATION_STATUS.REGISTERED) {
    // 1. Cập nhật trạng thái User thành REGISTERED
    registration.status = REGISTRATION_STATUS.REGISTERED;
    await registration.save();

    // 2️. Add user to volunteers (KHÔNG TRÙNG)
    const userIdStr = registration.userId.toString();
    const volunteerIds = event.volunteers.map(v => v.toString());

    if (!volunteerIds.includes(userIdStr)) {
      event.volunteers.push(registration.userId);
    } 

    await event.save();


    // 2. Tăng số lượng người tham gia trong Event (ĐÂY LÀ CHỖ DUY NHẤT TĂNG)
    event.currentParticipants += 1;
    await event.save();

    // 3️. TẠO ATTENDANCE
    await Attendance.create({
      regId: registration._id,
      status: "in-progress", // đợi checkout
    });
  }

  res.json({
    message: "Đã duyệt đơn đăng ký",
    data: registration,
  });
});

// @desc    Manager từ chối đơn đăng ký (Kick User)
// @route   PUT /api/registrations/:id/reject
// @access  Private (Manager/Admin)
const rejectRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error("Không tìm thấy đơn đăng ký");
  }

  const event = await Event.findById(registration.eventId);

  // Check quyền Manager
  if (
    event &&
    event.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Bạn không có quyền từ chối đơn này");
  }

  // LOGIC ĐẾM SỐ LƯỢNG:
  // Nếu User đã được duyệt (REGISTERED) mà Manager đổi ý muốn Reject/Kick
  // -> Phải trừ currentParticipants đi 1.
  if (registration.status === REGISTRATION_STATUS.REGISTERED && event) {
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();
  }

  // Chuyển trạng thái sang CANCELLED (Gộp chung Rejected và Cancelled vào đây theo yêu cầu)
  registration.status = REGISTRATION_STATUS.CANCELLED;
  await registration.save();

  res.json({
    message: "Đã từ chối đơn đăng ký",
    data: registration,
  });
});

export {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getMyQRCode,
  getAllRegistrationsForManagement,
  acceptRegistration,
  rejectRegistration,
};
