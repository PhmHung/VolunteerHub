/** @format */

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Calendar,
  Clock,
  Mail,
  Phone,
  Shield,
  Lock,
  Unlock,
  Trash2,
  History,
  UserCheck,
  Briefcase,
  TrendingUp,
} from "lucide-react";

// Import actions
import {
  fetchUserById,
  clearSelectedUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../features/userSlice";
const UserDetailModal = ({
  viewingUser,
  onClose,
  addToast,
  setConfirmModal,
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("info");

  // Lấy dữ liệu chi tiết từ Redux
  const { selectedUser, selectedUserLoading } = useSelector(
    (state) => state.user
  );
  const { profile } = useSelector((state) => state.user);
  const isAdmin = profile?.role === "admin";
  const displayUser = selectedUser || viewingUser;
  const isLoading = selectedUserLoading;
  const userId = viewingUser?._id;

  // 1. Fetch dữ liệu chi tiết khi mở modal
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }

    // Cleanup khi đóng modal
    return () => {
      dispatch(clearSelectedUser());
      setActiveTab("info");
    };
  }, [dispatch, userId]); // Chỉ chạy lại khi ID thay đổi

  const calculatedTotalHours = useMemo(() => {
    // 1. Ưu tiên lấy con số tổng hợp từ Backend để đồng bộ với PotentialManagerList
    if (displayUser?.promotionData?.totalAttendanceHours) {
      return displayUser.promotionData.totalAttendanceHours;
    }

    // 2. Nếu không có, thực hiện tổng hợp trực tiếp từ mảng history (attendance records)
    const history = displayUser?.history || [];
    return history.reduce((sum, record) => {
      // Chỉ tính toán khi có đầy đủ dữ liệu vào và ra
      if (record.checkIn && record.checkOut) {
        const checkIn = new Date(record.checkIn);
        const checkOut = new Date(record.checkOut);

        // Kiểm tra tính hợp lệ của ngày tháng
        if (!isNaN(checkIn) && !isNaN(checkOut)) {
          const durationMs = checkOut - checkIn;
          const hours = durationMs / (1000 * 60 * 60); // Quy đổi ms sang giờ

          // Chỉ cộng nếu số giờ dương (tránh lỗi dữ liệu ngược)
          return sum + (hours > 0 ? hours : 0);
        }
      }
      return sum;
    }, 0);
  }, [displayUser]);
  if (!viewingUser) return null;

  // Ưu tiên hiển thị dữ liệu mới nhất từ API, nếu chưa có thì dùng tạm dữ liệu từ props

  // --- HANDLERS ---

  const handleToggleLock = () => {
    if (!displayUser) return;
    const isActive = displayUser.status === "active";
    const newStatus = isActive ? "inactive" : "active";

    setConfirmModal({
      isOpen: true,
      title: isActive ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: `Bạn có chắc muốn ${isActive ? "khóa" : "mở khóa"} tài khoản "${
        displayUser.userName
      }"?`,
      type: isActive ? "warning" : "success",
      confirmText: isActive ? "Khóa ngay" : "Mở khóa",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserStatus({ userId: displayUser._id, status: newStatus })
          ).unwrap();
          addToast(
            isActive ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!",
            "success"
          );
          // Refresh lại data
          dispatch(fetchUserById(displayUser._id));
        } catch (error) {
          addToast(error || "Thao tác thất bại", "error");
        }
      },
    });
  };

  const handleDeleteUser = () => {
    if (!displayUser) return;
    setConfirmModal({
      isOpen: true,
      title: "Xóa tài khoản vĩnh viễn",
      message: (
        <div>
          <p className='text-red-600 font-bold mb-2'>
            Hành động này không thể hoàn tác!
          </p>
          <p>
            Bạn sắp xóa hoàn toàn người dùng:{" "}
            <strong>{displayUser.userName}</strong>
          </p>
        </div>
      ),
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        try {
          await dispatch(deleteUser(displayUser._id)).unwrap();
          addToast("Đã xóa người dùng thành công!", "success");
          onClose(); // Đóng modal sau khi xóa
        } catch (error) {
          addToast(error || "Không thể xóa người dùng", "error");
        }
      },
    });
  };

  const handlePromoteToManager = () => {
    if (!displayUser) return;
    setConfirmModal({
      isOpen: true,
      title: "Bổ nhiệm Manager",
      message: `Bạn có chắc muốn thăng cấp "${displayUser.userName}" lên làm Quản lý (Manager)?`,
      type: "info",
      confirmText: "Thăng cấp",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserRole({ userId: displayUser._id, role: "manager" })
          ).unwrap();
          addToast("Đã thăng cấp thành công!", "success");
          dispatch(fetchUserById(displayUser._id));
        } catch (error) {
          addToast(error || "Lỗi khi thăng cấp", "error");
        }
      },
    });
  };

  // --- RENDER HISTORY ---
  const renderHistory = () => {
    const historyList = selectedUser?.history || [];

    if (!historyList || historyList.length === 0) {
      return (
        <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200'>
          <History className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 font-medium'>
            Chưa có lịch sử tham gia sự kiện.
          </p>
        </div>
      );
    }

    return historyList.map((item, idx) => {
      const eventData = item.event || {};
      const status = item.status;

      const badgeClasses =
        status === "completed"
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-red-100 text-red-700 border-red-200";

      const badgeText = status === "completed" ? "Hoàn thành" : "Vắng mặt";

      return (
        <div
          key={idx}
          className='flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors'>
          {/* Thông tin sự kiện */}
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0'>
              {eventData.image ? (
                <img
                  src={eventData.image}
                  alt={eventData.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold'>
                  EVT
                </div>
              )}
            </div>
            <div>
              <p className='font-semibold text-gray-900 line-clamp-1'>
                {eventData.title || "Sự kiện không xác định"}
              </p>
              <div className='flex flex-col gap-1 mt-1 text-xs text-gray-500'>
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  {eventData.startDate
                    ? new Date(eventData.startDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
                <div className='flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='w-3 h-3' />
                    {eventData.startDate
                      ? new Date(eventData.startDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </span>

                  {item.checkIn && item.checkOut ? (
                    <span className='flex items-center gap-1 text-blue-600 font-medium'>
                      <Clock className='w-3 h-3' />
                      {/* Tính thời lượng: (CheckOut - CheckIn) */}
                      {(
                        (new Date(item.checkOut) - new Date(item.checkIn)) /
                        (1000 * 60 * 60)
                      ).toFixed(1)}{" "}
                      giờ (
                      {new Date(item.checkIn).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      -
                      {new Date(item.checkOut).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </span>
                  ) : (
                    item.checkIn && (
                      <span className='flex items-center gap-1 text-emerald-600'>
                        <Clock className='w-3 h-3' />
                        Vào:{" "}
                        {new Date(item.checkIn).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div className='flex flex-col items-end gap-1 shrink-0'>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeClasses}`}>
              {badgeText}
            </span>
            {status === "completed" && item.rating > 0 && (
              <span className='text-xs text-yellow-500 font-bold'>
                ★ {item.rating}
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  // --- RENDER MAIN UI ---
  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* HEADER */}
        <div className='p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/80'>
          <div className='flex items-center gap-5'>
            <div className='relative'>
              <div className='w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-3xl border-4 border-white shadow-sm overflow-hidden'>
                {displayUser.profilePicture ? (
                  <img
                    src={displayUser.profilePicture}
                    alt=''
                    className='w-full h-full object-cover'
                  />
                ) : (
                  displayUser.userName?.charAt(0).toUpperCase()
                )}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-6 h-6 border-4 border-white rounded-full ${
                  displayUser.status === "active"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}></span>
            </div>

            <div>
              <h3 className='text-2xl font-bold text-gray-900'>
                {displayUser.userName}
              </h3>
              <p className='text-gray-500 flex items-center gap-1.5 mt-1'>
                <Mail className='w-4 h-4' /> {displayUser.userEmail}
              </p>
              <div className='flex gap-2 mt-3'>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    displayUser.role === "manager"
                      ? "bg-purple-100 text-purple-700"
                      : displayUser.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                  {displayUser.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-200 rounded-full transition text-gray-400 hover:text-gray-600'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* TABS */}
        <div className='flex border-b border-gray-100 px-6'>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition ${
              activeTab === "info"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <UserCheck className='w-4 h-4' /> Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition ml-6 ${
              activeTab === "history"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <History className='w-4 h-4' /> Lịch sử hoạt động
          </button>
        </div>

        {/* CONTENT */}
        <div className='p-6 overflow-y-auto bg-white custom-scrollbar flex-1'>
          {isLoading && !selectedUser ? (
            <div className='flex flex-col justify-center items-center py-12 gap-3'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600'></div>
              <span className='text-sm text-gray-500'>
                Đang tải dữ liệu chi tiết...
              </span>
            </div>
          ) : (
            <>
              {/* TAB: INFO */}
              {activeTab === "info" && (
                <div className='space-y-8 animate-in slide-in-from-left-4 duration-300'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>
                        Số điện thoại
                      </p>
                      <p className='text-gray-900 font-medium flex items-center gap-2'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        {displayUser.phoneNumber || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>
                        Ngày tham gia
                      </p>
                      <p className='text-gray-900 font-medium flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        {displayUser.createdAt
                          ? new Date(displayUser.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                    </div>
                    {/* Sự kiện hoàn thành */}
                    <div className='p-4 bg-emerald-50 rounded-xl border border-emerald-100'>
                      <p className='text-xs font-semibold text-emerald-600 uppercase mb-1'>
                        Sự kiện hoàn thành
                      </p>
                      <p className='text-emerald-900 font-bold text-lg flex items-center gap-2'>
                        <Briefcase className='w-5 h-5 text-emerald-500' />
                        {displayUser.promotionData?.eventsCompleted ||
                          displayUser.history?.length ||
                          0}
                      </p>
                    </div>

                    {/* Tổng giờ cống hiến */}
                    <div className='p-4 bg-blue-50 rounded-xl border border-blue-100'>
                      <p className='text-xs font-semibold text-blue-600 uppercase mb-1'>
                        Tổng giờ cống hiến
                      </p>
                      <p className='text-blue-900 font-bold text-lg flex items-center gap-2'>
                        <Clock className='w-5 h-5 text-blue-500' />
                        {/* Dùng giá trị vừa tính thay vì promotionData */}
                        {calculatedTotalHours.toFixed(1)} giờ
                      </p>
                    </div>
                  </div>

                  {/* ADMIN ACTIONS */}
                  {displayUser.role !== "admin" && (
                    <div className='border-t border-gray-100 pt-6'>
                      <h4 className='text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider'>
                        Hành động quản trị
                      </h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/* Promote (Admin Only) */}
                        {isAdmin && displayUser.role === "volunteer" && (
                          <button
                            onClick={handlePromoteToManager}
                            className='flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition border border-indigo-200'>
                            <Shield className='w-4 h-4' /> Thăng cấp Manager
                          </button>
                        )}

                        {/* Lock/Unlock */}
                        <button
                          onClick={handleToggleLock}
                          className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium transition border ${
                            displayUser.status === "active"
                              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}>
                          {displayUser.status === "active" ? (
                            <>
                              <Lock className='w-4 h-4' /> Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Unlock className='w-4 h-4' /> Mở khóa tài khoản
                            </>
                          )}
                        </button>

                        {/* Delete (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={handleDeleteUser}
                            className='sm:col-span-2 flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition border border-red-200 mt-2'>
                            <Trash2 className='w-4 h-4' /> Xóa tài khoản vĩnh
                            viễn
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: HISTORY */}
              {activeTab === "history" && (
                <div className='space-y-4 animate-in slide-in-from-right-4 duration-300'>
                  {renderHistory()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
