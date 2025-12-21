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
} from "lucide-react";

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

  const { selectedUser, selectedUserLoading } = useSelector(
    (state) => state.user
  );
  const { profile } = useSelector((state) => state.user);

  // 1. Hòa trộn dữ liệu: Giữ lại promotionData từ danh sách Potential
  const displayUser = useMemo(() => {
    const base = selectedUser || viewingUser || {};
    return {
      ...base,
      promotionData: selectedUser?.promotionData || viewingUser?.promotionData,
    };
  }, [selectedUser, viewingUser]);

  // 2. Logic thống kê: Sử dụng promotionData từ Backend nếu có
  const stats = useMemo(() => {
    const pData = displayUser?.promotionData;

    // Ưu tiên dùng dữ liệu tính sẵn từ Backend (Gợi ý Manager/Duyệt Manager)
    if (pData) {
      return {
        hours: pData.totalAttendanceHours || 0,
        events: pData.eventsCompleted || 0,
      };
    }

    // Dự phòng: Tự tính từ history nếu mở từ danh sách User thông thường
    const history = displayUser?.history || [];
    const completed = history.filter((h) => h.status === "completed");
    const totalMs = completed.reduce((sum, record) => {
      if (record.checkIn && record.checkOut) {
        const duration = new Date(record.checkOut) - new Date(record.checkIn);
        return sum + (duration > 0 ? duration : 0);
      }
      return sum;
    }, 0);

    return {
      hours: Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10,
      events: completed.length,
    };
  }, [displayUser]);

  const isAdmin = profile?.role === "admin";
  const isLoading = selectedUserLoading;
  const userId = viewingUser?._id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserById(userId));
    }
    return () => {
      dispatch(clearSelectedUser());
      setActiveTab("info");
    };
  }, [dispatch, userId]);

  // ✅ ĐÃ XÓA BIẾN calculatedTotalHours DƯ THỪA ĐỂ HẾT LỖI 'NEVER USED'

  if (!viewingUser) return null;

  // --- HANDLERS ---
  const handleToggleLock = () => {
    if (!displayUser?._id) return;
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
          addToast(isActive ? "Đã khóa!" : "Đã mở khóa!", "success");
          dispatch(fetchUserById(displayUser._id));
        } catch (error) {
          addToast(error || "Thao tác thất bại", "error");
        }
      },
    });
  };

  const handleDeleteUser = () => {
    if (!displayUser?._id) return;
    setConfirmModal({
      isOpen: true,
      title: "Xóa vĩnh viễn",
      message: `Hành động này không thể hoàn tác! Xóa người dùng: ${displayUser.userName}?`,
      type: "danger",
      confirmText: "Xóa ngay",
      onConfirm: async () => {
        try {
          await dispatch(deleteUser(displayUser._id)).unwrap();
          addToast("Đã xóa thành công!", "success");
          onClose();
        } catch (error) {
          addToast(error || "Không thể xóa", "error");
        }
      },
    });
  };

  const handlePromoteToManager = () => {
    if (!displayUser?._id) return;
    setConfirmModal({
      isOpen: true,
      title: "Bổ nhiệm Manager",
      message: `Thăng cấp "${displayUser.userName}" lên làm Quản lý?`,
      type: "info",
      confirmText: "Thăng cấp",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserRole({ userId: displayUser._id, role: "manager" })
          ).unwrap();
          addToast("Thành công!", "success");
          dispatch(fetchUserById(displayUser._id));
        } catch (error) {
          addToast(error || "Lỗi thăng cấp", "error");
        }
      },
    });
  };

  const renderHistory = () => {
    const historyList = displayUser?.history || [];
    if (historyList.length === 0) {
      return (
        <div className='text-center py-12 bg-gray-50 rounded-xl'>
          <History className='w-12 h-12 text-gray-300 mx-auto mb-2' />
          <p className='text-gray-500'>Chưa có lịch sử tham gia.</p>
        </div>
      );
    }
    return historyList.map((item, idx) => (
      <div
        key={idx}
        className='flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 mb-3 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0'>
            {item.event?.image ? (
              <img
                src={item.event.image}
                alt=''
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-xs'>
                EVT
              </div>
            )}
          </div>
          <div>
            <p className='font-semibold text-gray-900'>
              {item.event?.title || "Sự kiện"}
            </p>
            <div className='flex items-center gap-3 text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                {item.event?.startDate
                  ? new Date(item.event.startDate).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
              {item.checkIn && item.checkOut && (
                <span className='flex items-center gap-1 text-blue-600'>
                  <Clock className='w-3 h-3' />
                  {(
                    (new Date(item.checkOut) - new Date(item.checkIn)) /
                    (1000 * 60 * 60)
                  ).toFixed(1)}{" "}
                  giờ
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
            item.status === "completed"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-red-100 text-red-700 border-red-200"
          }`}>
          {item.status === "completed" ? "Hoàn thành" : "Vắng mặt"}
        </span>
      </div>
    ));
  };

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50'>
          <div className='flex items-center gap-5'>
            <div className='relative'>
              <div className='w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-3xl border-4 border-white overflow-hidden shadow-sm'>
                {displayUser?.profilePicture ? (
                  <img
                    src={displayUser.profilePicture}
                    alt=''
                    className='w-full h-full object-cover'
                  />
                ) : (
                  displayUser?.userName?.charAt(0).toUpperCase()
                )}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-6 h-6 border-4 border-white rounded-full ${
                  displayUser?.status === "active"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}></span>
            </div>
            <div>
              <h3 className='text-2xl font-bold text-gray-900'>
                {displayUser?.userName}
              </h3>
              <p className='text-gray-500 flex items-center gap-1.5 mt-1'>
                <Mail className='w-4 h-4' /> {displayUser?.userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-200 rounded-full transition text-gray-400'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className='flex border-b border-gray-100 px-6'>
          <button
            onClick={() => setActiveTab("info")}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition ${
              activeTab === "info"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500"
            }`}>
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-2 text-sm font-medium border-b-2 transition ml-6 ${
              activeTab === "history"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500"
            }`}>
            Lịch sử tham gia
          </button>
        </div>

        {/* Content Section */}
        <div className='p-6 overflow-y-auto bg-white custom-scrollbar flex-1'>
          {isLoading && !selectedUser ? (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600'></div>
            </div>
          ) : (
            <>
              {activeTab === "info" && (
                <div className='space-y-6 animate-in slide-in-from-left-4 duration-300'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>
                        Số điện thoại
                      </p>
                      <p className='text-gray-900 font-medium flex items-center gap-2'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        {displayUser?.phoneNumber || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>
                        Ngày tham gia
                      </p>
                      <p className='text-gray-900 font-medium flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        {displayUser?.createdAt
                          ? new Date(displayUser.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </p>
                    </div>

                    <div className='p-4 bg-emerald-50 rounded-xl border border-emerald-100'>
                      <p className='text-xs font-semibold text-emerald-600 uppercase mb-1'>
                        Sự kiện hoàn thành
                      </p>
                      <p className='text-emerald-900 font-bold text-lg flex items-center gap-2'>
                        <Briefcase className='w-5 h-5 text-emerald-500' />
                        {stats.events}
                      </p>
                    </div>

                    <div className='p-4 bg-blue-50 rounded-xl border border-blue-100'>
                      <p className='text-xs font-semibold text-blue-600 uppercase mb-1'>
                        Tổng giờ cống hiến
                      </p>
                      <p className='text-blue-900 font-bold text-lg flex items-center gap-2'>
                        <Clock className='w-5 h-5 text-blue-500' />
                        {stats.hours.toFixed(1)} giờ
                      </p>
                    </div>
                  </div>

                  {/* Quản trị viên Action */}
                  {displayUser?.role !== "admin" && (
                    <div className='border-t border-gray-100 pt-6'>
                      <h4 className='text-sm font-bold text-gray-900 mb-4 uppercase'>
                        Hành động quản trị
                      </h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {isAdmin && displayUser?.role === "volunteer" && (
                          <button
                            onClick={handlePromoteToManager}
                            className='flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 hover:bg-indigo-100'>
                            <Shield className='w-4 h-4' /> Thăng cấp Manager
                          </button>
                        )}
                        <button
                          onClick={handleToggleLock}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border ${
                            displayUser?.status === "active"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                          {displayUser?.status === "active" ? (
                            <>
                              <Lock className='w-4 h-4' /> Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Unlock className='w-4 h-4' /> Mở khóa
                            </>
                          )}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={handleDeleteUser}
                            className='sm:col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-700 rounded-xl border border-red-200'>
                            <Trash2 className='w-4 h-4' /> Xóa vĩnh viễn
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "history" && (
                <div className='animate-in slide-in-from-right-4 duration-300'>
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
