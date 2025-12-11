/** @format */

import React, { useEffect, useState } from "react";
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
  Info,
  MapPin,
  UserCheck,
} from "lucide-react";
import {
  fetchUserById,
  clearSelectedUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../features/user/userSlice";

const UserDetailModal = ({
  viewingUser, // User object từ danh sách (chỉ dùng để lấy ID ban đầu)
  onClose,
  addToast,
  setConfirmModal,
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("info");

  // 1. Lấy dữ liệu từ Redux Store (Nơi chứa dữ liệu chi tiết mới nhất)
  const { selectedUser, selectedUserLoading } = useSelector(
    (state) => state.user
  );
  const { profile } = useSelector((state) => state.user);
  const isAdmin = profile?.role === "admin";

  // 2. Fetch API lấy chi tiết User ngay khi mở Modal
  useEffect(() => {
    if (viewingUser?._id) {
      // Gọi API fetchUserById để lấy history và data mới nhất
      dispatch(fetchUserById(viewingUser._id));
    }

    // Cleanup: Xóa dữ liệu cũ khi đóng modal
    return () => {
      dispatch(clearSelectedUser());
      setActiveTab("info");
    };
  }, [dispatch, viewingUser]);

  // Debug: Kiểm tra dữ liệu history trong console
  useEffect(() => {
    if (selectedUser) {
      console.log("Details fetched:", selectedUser);
    }
  }, [selectedUser]);

  if (!viewingUser) return null;

  // Ưu tiên hiển thị dữ liệu từ API (selectedUser), nếu chưa tải xong thì dùng tạm data từ danh sách (viewingUser)
  const displayUser = selectedUser || viewingUser;
  const isLoading = selectedUserLoading;

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
          // Dispatch lại để cập nhật UI ngay lập tức
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
          onClose();
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
          dispatch(fetchUserById(displayUser._id)); // Refresh data
        } catch (error) {
          addToast(error || "Lỗi khi thăng cấp", "error");
        }
      },
    });
  };

  // --- RENDER HISTORY ---
  const renderHistory = () => {
    // Logic tìm mảng history tương tự file Manager bạn cung cấp
    // Backend có thể trả về: history, registrations, hoặc events
    const historyList =
      selectedUser?.history || selectedUser?.registrations || [];

    if (!historyList || historyList.length === 0) {
      return (
        <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200'>
          <History className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 font-medium'>Chưa có lịch sử hoạt động</p>
        </div>
      );
    }

    return historyList.map((item, idx) => {
      // Xử lý dữ liệu populate: item.eventId (object) hoặc item.event (object)
      const eventData = item.eventId || item.event || {};
      const eventTitle = eventData.title || "Sự kiện không xác định";
      const eventDate = eventData.startDate || eventData.date;
      const status = item.status || "unknown";

      return (
        <div
          key={idx}
          className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50 transition-colors'>
          <div>
            <p className='font-semibold text-gray-900'>{eventTitle}</p>
            <div className='flex flex-col gap-1 mt-1 text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {eventDate
                  ? new Date(eventDate).toLocaleDateString("vi-VN")
                  : "N/A"}
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              status === "accepted" ||
              status === "approved" ||
              status === "Đã tham gia"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : status === "pending"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-red-100 text-red-700 border-red-200"
            }`}>
            {status === "accepted" || status === "approved"
              ? "Đã tham gia"
              : status === "pending"
              ? "Chờ duyệt"
              : status}
          </span>
        </div>
      );
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* --- HEADER --- */}
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

        {/* --- TABS --- */}
        <div className='flex border-b border-gray-100 px-6'>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition ${
              activeTab === "info"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <UserCheck className='w-4 h-4' /> Thông tin
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

        {/* --- BODY --- */}
        <div className='p-6 overflow-y-auto bg-white custom-scrollbar flex-1'>
          {/* Loading State */}
          {isLoading && !selectedUser ? (
            <div className='flex flex-col justify-center items-center py-12 gap-3'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600'></div>
              <span className='text-sm text-gray-500'>
                Đang tải dữ liệu chi tiết...
              </span>
            </div>
          ) : (
            <>
              {/* TAB 1: INFO & ACTIONS */}
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
                  </div>

                  {/* ADMIN ACTIONS */}
                  {displayUser.role !== "admin" && (
                    <div className='border-t border-gray-100 pt-6'>
                      <h4 className='text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider'>
                        Hành động quản trị
                      </h4>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/* Promote Button */}
                        {isAdmin && displayUser.role === "volunteer" && (
                          <button
                            onClick={handlePromoteToManager}
                            className='flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition border border-indigo-200'>
                            <Shield className='w-4 h-4' /> Thăng cấp Manager
                          </button>
                        )}

                        {/* Lock/Unlock Button */}
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

                        {/* Delete Button */}
                        <button
                          onClick={handleDeleteUser}
                          className='sm:col-span-2 flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition border border-red-200 mt-2'>
                          <Trash2 className='w-4 h-4' /> Xóa tài khoản vĩnh viễn
                        </button>
                      </div>
                      <p className='text-center text-xs text-gray-400 mt-4'>
                        * Các hành động trên sẽ ảnh hưởng trực tiếp đến người
                        dùng.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: HISTORY */}
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
