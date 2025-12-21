/** @format */

import React from "react";
import {
  Mail,
  Clock,
  Eye, // Icon Xem chi tiết
} from "lucide-react";
import { REGISTRATION_STATUS } from "../../utils/constants";

const VolunteerCard = ({
  volunteer,
  compact,
  onUserClick,
  userRole,
  addToast,
}) => {
  // Chuẩn hóa dữ liệu user và registration
  const user = volunteer.user || volunteer.userId || {};
  const status = volunteer.status;
  const registeredAt = volunteer.registeredAt;

  // Lấy cấu hình trạng thái
  const statusConfig = REGISTRATION_STATUS[status] || {
    label: status,
    color: "gray",
    icon: Clock,
  };

  const IconComponent = statusConfig.icon || Clock;

  const handleClick = (e) => {
    e?.stopPropagation();

    if (userRole !== "admin" && userRole !== "manager") {
      if (addToast) {
        addToast(
          "Bạn không có quyền xem thông tin chi tiết của người khác.",
          "warning"
        );
      }
      return;
    }

    if (onUserClick && user._id) {
      onUserClick(user._id);
    }
  };

  // ------------------------------------------------------------------
  // Chế độ Compact
  // ------------------------------------------------------------------
  if (compact) {
    return (
      <div
        onClick={handleClick}
        className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer'>
        {/* Avatar */}
        <div className='relative'>
          <div className='w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0'>
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.userName}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold'>
                {user.userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
        {/* Info */}
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-gray-900 line-clamp-1'>
            {user.userName || "Người dùng ẩn danh"}
          </p>
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <IconComponent className='w-3 h-3' />
            <span className='font-medium'>{statusConfig.label}</span>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Chế độ Mặc định (Full Card - Dùng trong EventDetailModal)
  // ------------------------------------------------------------------
  return (
    <div className='flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200'>
      {/* Left: User Info & Email */}
      <div className='flex items-center gap-4 min-w-0'>
        <div className='w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0'>
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.userName}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold'>
              {user.userName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className='min-w-0'>
          <p className='font-semibold text-gray-900 truncate'>
            {user.userName || "Người dùng ẩn danh"}
          </p>
          <p className='text-sm text-gray-500 flex items-center gap-1.5 mt-0.5 truncate'>
            <Mail className='w-3.5 h-3.5 flex-shrink-0' />
            {user.userEmail || "Không có Email"}
          </p>
        </div>
      </div>

      {/* Right: Status and Actions */}
      <div className='flex items-center gap-3 shrink-0'>
        {/* Status Badge */}
        <div className='flex flex-col items-end gap-1'>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold 
            ${
              statusConfig.color === "emerald"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}>
            <IconComponent className='w-3 h-3' />
            {statusConfig.label}
          </div>
          <p className='text-xs text-gray-400'>
            Đăng ký: {new Date(registeredAt).toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Action Button: View Details */}
        <button
          onClick={handleClick}
          className='p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition'
          title='Xem hồ sơ chi tiết'>
          <Eye className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
};

export default VolunteerCard;
