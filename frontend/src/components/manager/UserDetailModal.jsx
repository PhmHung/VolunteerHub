/** @format */

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearSelectedUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../../features/user/userSlice";
import {
  FaTimes,
  FaUserShield,
  FaLock,
  FaUnlock,
  FaHistory,
  FaUserCircle,
} from "react-icons/fa";

const UserDetailModal = ({ isOpen, onClose, addToast, setConfirmModal }) => {
  const dispatch = useDispatch();
  const { selectedUser, selectedUserLoading } = useSelector(
    (state) => state.user
  );
  const { profile } = useSelector((state) => state.user);
  const isAdmin = profile?.role === "admin";

  // State để chuyển Tab
  const [activeTab, setActiveTab] = useState("info"); // 'info' hoặc 'history'

  const handleClose = () => {
    dispatch(clearSelectedUser());
    setActiveTab("info"); // Reset về tab info khi đóng
    onClose();
  };

  const handlePromoteToManager = () => {
    if (window.confirm(`Thăng cấp ${selectedUser.userName} thành Manager?`)) {
      dispatch(updateUserRole({ userId: selectedUser._id, role: "manager" }))
        .unwrap()
        .then(() => alert("Thành công!"))
        .catch((err) => alert(err));
    }
  };
  // KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleLock = () => {
    const isActive = selectedUser.status === "active";
    const newStatus = isActive ? "inactive" : "active";

    setConfirmModal({
      isOpen: true,
      title: isActive ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: `Bạn có chắc muốn ${isActive ? "khóa" : "mở khóa"} tài khoản "${
        selectedUser.userName
      }"?`,
      type: isActive ? "warning" : "success",
      confirmText: isActive ? "Khóa tài khoản" : "Mở khóa",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserStatus({ userId: selectedUser._id, status: newStatus })
          ).unwrap();
          addToast(
            isActive ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!",
            "success"
          );
          handleClose();
        } catch {
          addToast("Thao tác thất bại", "error");
        }
      },
    });
  };

  // XÓA NGƯỜI DÙNG
  const handleDeleteUser = () => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa tài khoản vĩnh viễn",
      message: (
        <div>
          <p className='font-bold text-error-600'>Không thể hoàn tác!</p>
          <p>
            Bạn sắp xóa tài khoản: <strong>"{selectedUser.userName}"</strong>
          </p>
        </div>
      ),
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        try {
          await dispatch(deleteUser(selectedUser._id)).unwrap();
          addToast("Đã xóa người dùng thành công!", "success");
          handleClose();
        } catch {
          addToast("Không thể xóa người dùng", "error");
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl w-full max-w-2xl relative shadow-2xl flex flex-col max-h-[90vh]'>
        {/* Header & Tabs */}
        <div className='p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl'>
          <div className='flex space-x-4'>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "info"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-200"
              }`}>
              <FaUserCircle /> Thông tin
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "history"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-200"
              }`}>
              <FaHistory /> Lịch sử tham gia
            </button>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-red-500'>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className='p-6 overflow-y-auto'>
          {selectedUserLoading ? (
            <div className='text-center py-10 text-gray-500'>
              Đang tải dữ liệu...
            </div>
          ) : selectedUser ? (
            <>
              {/* --- TAB 1: INFO --- */}
              {activeTab === "info" && (
                <div className='animate-fade-in space-y-6'>
                  <div className='flex flex-col items-center'>
                    <img
                      src={
                        selectedUser.profilePicture ||
                        "https://placehold.co/150"
                      }
                      alt='Avatar'
                      className='w-28 h-28 rounded-full object-cover border-4 border-white shadow-md mb-3'
                    />
                    <h3 className='text-xl font-bold text-gray-800'>
                      {selectedUser.userName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                        selectedUser.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : selectedUser.role === "manager"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}>
                      {selectedUser.role}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg'>
                    <div>
                      <p className='text-xs text-gray-500 uppercase'>Email</p>
                      <p className='font-medium'>{selectedUser.userEmail}</p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 uppercase'>
                        Số điện thoại
                      </p>
                      <p className='font-medium'>
                        {selectedUser.phoneNumber || "---"}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 uppercase'>
                        Ngày tham gia
                      </p>
                      <p className='font-medium'>20/10/2024</p>{" "}
                      {/* Cần thêm field createdAt từ backend */}
                    </div>
                  </div>

                  {/* Khu vực Action */}
                  {/* {isAdmin && selectedUser.role === "volunteer" && (
                    <div className='pt-4 border-t'>
                      <button
                        onClick={handlePromoteToManager}
                        className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1'>
                        <FaUserShield size={18} /> Bổ nhiệm làm Manager
                      </button>
                      <p className='text-xs text-center text-gray-400 mt-2'>
                        *Hành động này sẽ cấp quyền quản lý sự kiện cho người
                        dùng.
                      </p>
                    </div>
                  )} */}
                  {/* KHU VỰC HÀNH ĐỘNG NGUY HIỂM */}
                  {selectedUser.role !== "admin" && (
                    <div className='mt-8 pt-6 border-t border-gray-200'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Bổ nhiệm Manager (chỉ Admin) */}
                        {isAdmin && selectedUser.role === "volunteer" && (
                          <button
                            onClick={handlePromoteToManager}
                            className='bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1'>
                            <FaUserShield className='text-xl' />
                            Bổ nhiệm làm Manager
                          </button>
                        )}

                        {/* Khóa / Mở khóa */}
                        <button
                          onClick={handleToggleLock}
                          className={`py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl ${
                            selectedUser.status === "active"
                              ? "bg-orange-600 hover:bg-orange-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}>
                          {selectedUser.status === "active" ? (
                            <>
                              <FaLock className='text-xl' />
                              Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <FaUnlock className='text-xl' />
                              Mở khóa tài khoản
                            </>
                          )}
                        </button>

                        {/* XÓA VĨNH VIỄN - NỔI BẬT NHẤT */}
                        <button
                          onClick={handleDeleteUser}
                          className='md:col-span-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition transform hover:scale-105'>
                          <FaTrash className='text-xl' />
                          Xóa tài khoản vĩnh viễn
                        </button>
                      </div>

                      <p className='text-center text-xs text-gray-500 mt-4'>
                        Các hành động trên không thể hoàn tác. Vui lòng cân nhắc
                        kỹ.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* --- TAB 2: HISTORY (MOCKUP) --- */}
              {activeTab === "history" && (
                <div className='animate-fade-in'>
                  <h4 className='font-bold text-gray-700 mb-4'>
                    Các sự kiện gần đây
                  </h4>

                  {selectedUser.history && selectedUser.history.length > 0 ? (
                    <div className='space-y-3'>
                      {selectedUser.history.map((reg, index) => (
                        <div
                          key={index}
                          className='flex justify-between items-center p-3 bg-white border rounded-lg hover:shadow-md transition'>
                          <div>
                            <p className='font-semibold text-gray-800'>
                              {reg.eventId?.title || "Sự kiện không tồn tại"}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {reg.eventId?.startDate
                                ? new Date(
                                    reg.eventId.startDate
                                  ).toLocaleDateString("vi-VN")
                                : "---"}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                              reg.status === "approved" ||
                              reg.status === "Đã tham gia"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {reg.status || "Chưa xác định"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 bg-gray-50 rounded-lg border border-dashed'>
                      <p className='text-gray-500'>
                        Chưa có dữ liệu tham gia sự kiện.
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>
                        (Tính năng đang phát triển)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className='text-center text-red-500'>
              Không tìm thấy dữ liệu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
