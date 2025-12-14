/** @format */

import React from "react";
import {
  Users,
  Mail,
  Phone,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { REGISTRATION_STATUS } from "../../utils/constants";

// --- Volunteer Card Component ---
const VolunteerCard = ({
  volunteer,
  compact,
  // XÓA CÁC PROPS KHÔNG ĐƯỢC DÙNG (onAccept, onReject, isCreator)
}) => {
  const user = volunteer.user || volunteer.userId || {};
  const status = volunteer.status;
  const registeredAt = volunteer.registeredAt;

  const statusConfig = REGISTRATION_STATUS[status] || {
    label: status,
    color: "gray",
    icon: Clock,
  };
  const Icon = statusConfig.icon;

  if (compact) {
    return (
      <div className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer'>
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
        <div>
          <p className='font-medium text-gray-900 line-clamp-1'>
            {user.userName || "Người dùng ẩn danh"}
          </p>
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <Icon className='w-3 h-3' />
            <span className='font-medium'>{statusConfig.label}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200'>
      {/* Left: User Info */}
      <div className='flex items-center gap-4'>
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
        <div>
          <p className='font-semibold text-gray-900'>
            {user.userName || "Người dùng ẩn danh"}
          </p>
          <p className='text-sm text-gray-500 flex items-center gap-1.5 mt-0.5'>
            <Mail className='w-3.5 h-3.5' />
            {user.userEmail || "Không có Email"}
          </p>
        </div>
      </div>

      {/* Right: Status and Date */}
      <div className='flex flex-col items-end gap-2'>
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold 
          ${
            statusConfig.color === "emerald"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}>
          <Icon className='w-3 h-3' />
          {statusConfig.label}
        </div>
        <p className='text-xs text-gray-400'>
          Đăng ký: {new Date(registeredAt).toLocaleDateString("vi-VN")}
        </p>
      </div>
    </div>
  );
};

// --- Main VolunteersList Component ---
const VolunteersList = ({
  registrations = [],
  users = [],
  compact = false,
  canView = true,
  // XÓA CÁC PROPS KHÔNG ĐƯỢC DÙNG (onAccept, onReject, isCreator)
}) => {
  const volunteers = registrations.map((reg) => {
    const user =
      users.find(
        (u) => u._id === (reg.userId?._id || reg.userId || reg.volunteer?._id)
      ) ||
      reg.userId ||
      {};

    return {
      ...reg,
      user: user,
    };
  });

  if (!canView && !compact) {
    return (
      <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center'>
        <AlertCircle className='w-12 h-12 text-amber-500 mx-auto mb-3' />
        <h3 className='text-lg font-medium'>Chưa thể xem danh sách</h3>
        <p className='text-gray-500'>
          Bạn cần tham gia sự kiện để xem danh sách thành viên.
        </p>
      </div>
    );
  }

  if (volunteers.length === 0) {
    return (
      <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center'>
        <Users className='w-12 h-12 text-gray-300 mx-auto mb-3' />
        <p className='text-gray-500'>Chưa có thành viên nào.</p>
      </div>
    );
  }

  return (
    <div>
      {!compact && (
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold text-gray-900'>
            Danh sách tham gia ({volunteers.length})
          </h2>
        </div>
      )}

      <div className='space-y-3 max-h-96 overflow-y-auto'>
        {volunteers.map((volunteer) => (
          <VolunteerCard
            key={volunteer._id}
            volunteer={volunteer}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

export default VolunteersList;
