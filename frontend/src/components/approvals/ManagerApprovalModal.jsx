/** @format */

import React, { useState } from "react";
import {
  X,
  Check,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Users,
  AlertTriangle,
} from "lucide-react";
const StatBox = ({ icon, value, label, color }) => {
  const IconComponent = icon;

  return (
    <div
      className={`bg-${color}-50 p-4 rounded-xl text-center border border-${color}-100`}>
      <IconComponent className={`w-6 h-6 text-${color}-600 mx-auto mb-2`} />
      <p className='text-2xl font-bold text-gray-900'>{value}</p>
      <p className='text-xs text-gray-500 font-medium mt-1'>{label}</p>
    </div>
  );
};

const ManagerApprovalModal = ({ request, onClose, onApprove, onReject }) => {
  // FIX LỖI 2: Đảm bảo useState được gọi ở đầu hàm component
  const [adminNote, setAdminNote] = useState("");

  if (!request) return null;

  // Lấy dữ liệu chung
  const type = request.type;
  const isEvent = type === "event_approval";
  const isManagerPromotion = type === "manager_promotion";
  const isCancellation = type === "event_cancellation";
  const requester = request.requestedBy || {};
  const event = request.event || {};
  const promotionData = request.promotionData || {};
  const cancellationReason =
    request.reason || request.data?.reason || "Không có lý do cụ thể";
  // Handlers để gọi action từ cha kèm theo note
  const handleAction = (actionType) => {
    if (actionType === "approve") {
      // onApprove(request, actionType, adminNote);
      onApprove(request, "approve", adminNote);
    } else {
      // onReject(request, actionType, adminNote);
      onReject(request, "reject", adminNote);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
          <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            {isEvent && <Calendar className='w-5 h-5 text-amber-600' />}
            {isCancellation && (
              <AlertTriangle className='w-5 h-5 text-red-600' />
            )}
            Duyệt Yêu Cầu:{" "}
            {isEvent
              ? "Sự kiện mới"
              : isManagerPromotion
              ? "Thăng cấp Manager"
              : "Hủy sự kiện"}
          </h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-200 rounded-full transition-colors'>
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[70vh]'>
          {/* REQUESTER INFO SECTION */}
          <div className='flex items-start gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100'>
            <div className='w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-bold'>
              {requester.userName?.[0] || "U"}
            </div>
            <div>
              <p className='text-sm text-gray-500'>Người gửi yêu cầu:</p>
              <h2 className='text-xl font-bold text-gray-900'>
                {requester.userName || "Người dùng không xác định"}
              </h2>
              <p className='text-gray-500'>
                {requester.userEmail} ({requester.role})
              </p>
            </div>
          </div>

          {/* Dynamic Content */}
          {isEvent && (
            // EVENT APPROVAL VIEW
            <div className='space-y-4'>
              <h3 className='text-2xl font-bold mb-4 text-amber-700'>
                {event.title || "Sự kiện không xác định"}
              </h3>
              <p className='text-gray-600 leading-relaxed'>
                {event.description || "Không có mô tả."}
              </p>
              <div className='grid grid-cols-2 gap-4 text-sm mt-4 p-4 border rounded-xl bg-amber-50'>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-amber-600' />{" "}
                  <p className='font-semibold text-gray-700'>Địa điểm:</p>{" "}
                  {event.location}
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-amber-600' />{" "}
                  <p className='font-semibold text-gray-700'>Thời gian:</p>{" "}
                  {new Date(event.startDate).toLocaleString("vi-VN")}
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 text-amber-600' />{" "}
                  <p className='font-semibold text-gray-700'>SL Tối đa:</p>{" "}
                  {event.maxParticipants}
                </div>
                <div className='col-span-2'>
                  <p className='font-semibold text-gray-700'>Tags:</p>
                  {event.tags?.join(", ") || "Không có tags"}
                </div>
              </div>
            </div>
          )}
          {/* Dynamic Content */}
          {/* 👇 CẬP NHẬT: Gom nhóm hiển thị thông tin sự kiện cho cả Tạo mới và Hủy */}
          {(isEvent || isCancellation) && (
            <div className='space-y-4'>
              {isCancellation && (
                <div className='bg-red-50 border border-red-200 p-4 rounded-xl mb-4'>
                  <h4 className='text-red-800 font-bold flex items-center gap-2 mb-1'>
                    <AlertTriangle className='w-4 h-4' /> Lý do yêu cầu hủy:
                  </h4>
                  <p className='text-red-700'>{cancellationReason}</p>
                </div>
              )}

              <h3 className='text-2xl font-bold mb-4 text-gray-800'>
                {event.title || "Sự kiện không xác định"}
              </h3>

              {/* Chỉ hiện mô tả nếu là tạo sự kiện mới, hủy thì có thể ẩn bớt cho gọn */}
              {isEvent && (
                <p className='text-gray-600 leading-relaxed'>
                  {event.description || "Không có mô tả."}
                </p>
              )}

              <div
                className={`grid grid-cols-2 gap-4 text-sm mt-4 p-4 border rounded-xl ${
                  isCancellation ? "bg-gray-50" : "bg-amber-50"
                }`}>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4 text-gray-600' />{" "}
                  <p className='font-semibold text-gray-700'>Địa điểm:</p>{" "}
                  {event.location}
                </div>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-gray-600' />{" "}
                  <p className='font-semibold text-gray-700'>Thời gian:</p>{" "}
                  {event.startDate
                    ? new Date(event.startDate).toLocaleString("vi-VN")
                    : "Chưa xác định"}
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 text-gray-600' />{" "}
                  <p className='font-semibold text-gray-700'>SL hiện tại:</p>{" "}
                  {event.registeredCount || 0} / {event.maxParticipants}
                </div>
                <div className='col-span-2'>
                  <p className='font-semibold text-gray-700'>
                    Trạng thái hiện tại:
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      event.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isManagerPromotion && (
            // MANAGER PROMOTION VIEW
            <div className='space-y-6'>
              <h3 className='text-lg font-bold text-purple-600 mb-4'>
                Chỉ số Hiệu suất Tình nguyện viên:
              </h3>
              <div className='grid grid-cols-3 gap-4'>
                <StatBox
                  icon={TrendingUp}
                  value={promotionData.eventsCompleted || 0}
                  label='Sự kiện Hoàn thành'
                  color='emerald'
                />
                <StatBox
                  icon={Clock}
                  value={promotionData.totalAttendanceHours?.toFixed(1) || 0}
                  label='Tổng Giờ Tham gia'
                  color='yellow'
                />
                <StatBox
                  icon={Star}
                  value={promotionData.averageRating?.toFixed(1) || 0}
                  label='Rating TB Event'
                  color='purple'
                />
              </div>

              <div className='mt-6'>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                  Giới thiệu bản thân
                </h4>
                <div className='p-3 bg-purple-50 rounded-xl text-sm text-gray-700 border border-purple-100'>
                  {requester.biography ||
                    "Người dùng chưa cập nhật giới thiệu."}
                </div>
              </div>
            </div>
          )}

          {/* Admin Note Section */}
          <div className='mt-6 pt-4 border-t'>
            <h4 className='text-sm font-semibold text-gray-900 mb-2'>
              Ghi chú của Admin
            </h4>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm h-24'
              placeholder='Nhập ghi chú (Tùy chọn, sẽ được lưu lại lịch sử duyệt)...'
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
          <button
            onClick={() => handleAction("reject")}
            className='px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-medium hover:bg-red-100 transition-colors flex items-center gap-2'>
            <X className='w-4 h-4' />
            Từ chối
          </button>
          <button
            onClick={() => handleAction("approve")}
            className='px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2'>
            <Check className='w-4 h-4' />
            Duyệt yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovalModal;
