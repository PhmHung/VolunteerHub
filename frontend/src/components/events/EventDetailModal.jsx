/** @format */

import React from "react";
import { X, Calendar, MapPin, Users, Mail, Phone, Map } from "lucide-react";

// Helper lấy thông tin người tạo an toàn
const getCreator = (event, users) => {
  if (
    event.createdBy &&
    typeof event.createdBy === "object" &&
    event.createdBy.userName
  ) {
    return event.createdBy;
  }
  if (users && users.length > 0) {
    // Tìm trong danh sách users nếu event chỉ chứa ID
    return (
      users.find((u) => u._id === (event.createdBy?._id || event.createdBy)) ||
      {}
    );
  }
  return {};
};

const EventDetailModal = ({
  event,
  registrations = [],
  users = [],
  onClose,
}) => {
  // Nếu chưa có event (chưa bấm nút), không hiện gì cả
  if (!event) return null;

  const creator = getCreator(event, users);

  // Lọc danh sách đăng ký chỉ cho sự kiện này
  const eventRegistrations = registrations.filter(
    (reg) =>
      (reg.event?._id || reg.event || reg.eventId) === (event._id || event.id)
  );

  const openGoogleMaps = () => {
    if (event.location) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          event.location
        )}`,
        "_blank"
      );
    }
  };

  return (
    // LỚP PHỦ (Overlay) - Giúp popup nổi lên trên nền tối
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      {/* HỘP THOẠI (Modal Content) */}
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header có ảnh */}
        <div className='relative h-48 bg-gray-200 shrink-0'>
          <img
            src={event.image || "https://via.placeholder.com/800x400"}
            alt={event.title}
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition backdrop-blur-md z-10'>
            <X className='w-5 h-5' />
          </button>

          <div className='absolute bottom-4 left-6 text-white pr-4'>
            <div className='flex items-center gap-2 mb-2'>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  event.status === "approved"
                    ? "bg-emerald-500"
                    : event.status === "pending"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}>
                {event.status === "approved"
                  ? "Đã duyệt"
                  : event.status === "pending"
                  ? "Chờ duyệt"
                  : event.status}
              </span>
              <span className='bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm'>
                {event.category}
              </span>
            </div>
            <h2 className='text-2xl font-bold leading-tight'>{event.title}</h2>
          </div>
        </div>

        {/* Nội dung cuộn được */}
        <div className='flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* CỘT TRÁI: Mô tả & Danh sách đăng ký */}
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-900 mb-3'>Mô tả</h3>
                <p className='text-gray-600 whitespace-pre-line leading-relaxed text-sm'>
                  {event.description}
                </p>
              </div>

              {/* Danh sách người tham gia (View Only) */}
              <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-bold text-gray-900'>
                    Danh sách đăng ký ({eventRegistrations.length})
                  </h3>
                </div>
                <div className='space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar'>
                  {eventRegistrations.length > 0 ? (
                    eventRegistrations.map((reg) => {
                      const vol = reg.volunteer || reg.userId || {};
                      return (
                        <div
                          key={reg._id}
                          className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-500 overflow-hidden'>
                              {vol.profilePicture ? (
                                <img
                                  src={vol.profilePicture}
                                  alt=''
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                vol.userName?.[0] || "U"
                              )}
                            </div>
                            <div>
                              <p className='text-sm font-medium text-gray-900'>
                                {vol.userName || "Unknown"}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {vol.userEmail}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                              reg.status === "registered" ||
                              reg.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : reg.status === "waitlisted" ||
                                  reg.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {reg.status}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className='text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-100 rounded-lg'>
                      Chưa có lượt đăng ký nào.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: Thông tin bên lề */}
            <div className='space-y-5'>
              {/* Người tổ chức */}
              <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold overflow-hidden border border-purple-200'>
                  {creator.profilePicture ? (
                    <img
                      src={creator.profilePicture}
                      alt=''
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    creator.userName?.[0] || "A"
                  )}
                </div>
                <div className='overflow-hidden'>
                  <p className='text-xs text-gray-500 uppercase font-semibold'>
                    Tổ chức bởi
                  </p>
                  <p className='font-bold text-gray-900 truncate'>
                    {creator.userName || "Admin"}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {creator.userEmail}
                  </p>
                </div>
              </div>

              {/* Thời gian & Địa điểm */}
              <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4'>
                <div className='flex gap-3'>
                  <Calendar className='w-5 h-5 text-emerald-600 shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>
                      Thời gian
                    </p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {event.startTime} -{" "}
                      {event.endDate
                        ? new Date(event.endDate).toLocaleDateString("vi-VN")
                        : ""}
                    </p>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <MapPin className='w-5 h-5 text-emerald-600 shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>
                      Địa điểm
                    </p>
                    <p className='text-sm font-semibold text-gray-900 line-clamp-2'>
                      {event.location}
                    </p>
                    <button
                      onClick={openGoogleMaps}
                      className='text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1'>
                      <Map className='w-3 h-3' /> Xem bản đồ
                    </button>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <Users className='w-5 h-5 text-emerald-600 shrink-0' />
                  <div>
                    <p className='text-sm text-gray-500 font-medium'>Quy mô</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {event.maxParticipants} người
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-100 bg-gray-50 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition shadow-sm'>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
