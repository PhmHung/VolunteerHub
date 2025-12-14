/** @format */

import React from "react";
import {
  X,
  Check,
  User,
  Briefcase,
  TrendingUp,
  Clock,
  Star,
  Calendar,
} from "lucide-react"; // Thêm icons liên quan đến hiệu suất

const ManagerApprovalModal = ({ request, onClose, onApprove, onReject }) => {
  if (!request) return null;

  // FIX: Lấy dữ liệu từ trường promotionData đã được tính toán
  const candidate = request.requestedBy || {};
  const appliedAt = request.createdAt;
  const promotionData = request.promotionData || {}; // Dữ liệu hiệu suất

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
          <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Briefcase className='w-5 h-5 text-blue-600' />
            Duyệt Yêu Cầu Thăng Cấp Quản Lý
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-200 rounded-full transition-colors'>
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[70vh]'>
          {/* Candidate Info */}
          <div className='flex items-start gap-4 mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100'>
            <div className='w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0'>
              {/* FIX: Kiểm tra profilePicture */}
              {candidate.profilePicture ? (
                <img
                  src={candidate.profilePicture}
                  alt=''
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <span className='text-xl font-bold text-blue-700'>
                  {candidate.userName?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                {candidate.userName || "Người dùng không xác định"}
              </h2>
              <p className='text-gray-500'>{candidate.userEmail}</p>
              <span className='flex items-center gap-1 mt-2 text-sm text-gray-600'>
                <Calendar className='w-4 h-4' />
                Gửi yêu cầu: {new Date(appliedAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <h3 className='text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider border-b pb-2'>
            📊 Hiệu Suất Tình Nguyện Viên
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
            {/* Events Completed */}
            <div className='bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100'>
              <TrendingUp className='w-6 h-6 text-emerald-600 mx-auto mb-2' />
              <p className='text-2xl font-bold text-emerald-800'>
                {promotionData.eventsCompleted}
              </p>
              <p className='text-xs text-gray-500 font-medium mt-1'>
                Sự kiện Hoàn thành
              </p>
            </div>

            {/* Total Hours */}
            <div className='bg-yellow-50 p-4 rounded-xl text-center border border-yellow-100'>
              <Clock className='w-6 h-6 text-yellow-600 mx-auto mb-2' />
              <p className='text-2xl font-bold text-yellow-800'>
                {promotionData.totalAttendanceHours || 0}
              </p>
              <p className='text-xs text-gray-500 font-medium mt-1'>
                Tổng Giờ Tham gia
              </p>
            </div>

            {/* Average Rating */}
            <div className='bg-purple-50 p-4 rounded-xl text-center border border-purple-100'>
              <Star className='w-6 h-6 text-purple-600 mx-auto mb-2' />
              <p className='text-2xl font-bold text-purple-800'>
                {promotionData.averageRating?.toFixed(1) || 0}
              </p>
              <p className='text-xs text-gray-500 font-medium mt-1'>
                Rating TB Event
              </p>
            </div>
          </div>

          {/* Admin Note Section (Optional - Nếu muốn Admin nhập lý do duyệt/từ chối) */}
          <div className='mt-4'>
            <h4 className='text-sm font-semibold text-gray-900 mb-2'>
              Ghi chú của Admin (Tùy chọn)
            </h4>
            <textarea
              className='w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm'
              placeholder='Nhập ghi chú cho yêu cầu này...'
              // State quản lý adminNote cần được xử lý ở component cha hoặc local state
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
          <button
            onClick={() => onReject(request)}
            className='px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-medium hover:bg-red-100 transition-colors flex items-center gap-2'>
            <X className='w-4 h-4' />
            Từ chối
          </button>
          <button
            onClick={() => onApprove(request)}
            className='px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2'>
            <Check className='w-4 h-4' />
            Duyệt thăng cấp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovalModal;
