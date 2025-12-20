/** @format */

import React from "react";
import {
  X,
  Calendar,
  MapPin,
  Users,
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Edit,
} from "lucide-react";
import VolunteersList from "../registrations/VolunteersList";
const LocationPicker = ({ lat, lng }) => (
  <div className='h-40 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500'>
    Map Preview ({lat}, {lng})
  </div>
);
const EventDetailModal = ({
  event,
  registrations = [],
  users = [],
  onClose,
  onEdit,
  onApprove,
  onReject,
  onUserClick,
  userRole,
  addToast,
  showApprovalActions = false,
  showRegistrationsList = true,
}) => {
  if (!event) return null;

  // Lấy thông tin organizer an toàn
  const getOrganizer = () => {
    if (
      event.createdBy &&
      typeof event.createdBy === "object" &&
      event.createdBy.userName
    ) {
      return event.createdBy;
    }
    return (
      users.find((u) => u._id === (event.createdBy?._id || event.createdBy)) ||
      {}
    );
  };
  const organizer = getOrganizer();

  const eventRegistrations = registrations.filter((reg) => {
    const regEventId =
      reg.eventId?._id || reg.eventId || reg.event?._id || reg.event;

    const currentEventId = event._id || event.id;

    return regEventId?.toString() === currentEventId?.toString();
  });

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-red-100 text-red-700 border-red-200";
    }
  };
  const showEditButton =
    onEdit &&
    !showApprovalActions &&
    event.status !== "cancelled" &&
    event.status !== "cancel_pending";

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header với ảnh bìa */}
        <div className='relative h-56 sm:h-72 shrink-0'>
          <img
            src={
              event.image ||
              "https://via.placeholder.com/1200x600?text=Sự+Kiện+Tình+Nguyện"
            }
            alt={event.title}
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
          {showEditButton && (
            <button
              onClick={() => onEdit(event)}
              className='h-10 px-4 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition flex items-center gap-2 text-sm font-medium border border-white/10'
              title='Chỉnh sửa sự kiện'>
              <Edit className='w-4 h-4' />
              <span className='hidden sm:inline'>Chỉnh sửa</span>
            </button>
          )}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition'>
            <X className='w-5 h-5' />
          </button>

          <div className='absolute bottom-6 left-6 right-6 text-white'>
            <div className='flex flex-wrap items-center gap-3 mb-3'>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(
                  event.status
                )} border`}>
                {event.status === "approved"
                  ? "Đã duyệt"
                  : event.status === "pending"
                  ? "Chờ duyệt"
                  : "Từ chối"}
              </span>
              {event.tags?.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className='px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs'>
                  #{tag}
                </span>
              ))}
            </div>
            <h2 className='text-3xl font-bold leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'>
              {event.title}
            </h2>
          </div>
        </div>

        {/* Nội dung cuộn */}
        <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Cột trái: Mô tả + Danh sách đăng ký */}
            <div className='lg:col-span-2 space-y-8'>
              {/* Mô tả */}
              <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>
                  Mô tả sự kiện
                </h3>
                <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                  {event.description || "Chưa có mô tả."}
                </p>
              </div>

              {/* Danh sách đăng ký (nếu bật) */}
              {showRegistrationsList && (
                <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                  <VolunteersList
                    registrations={eventRegistrations}
                    users={users}
                    onUserClick={onUserClick}
                    userRole={userRole}
                    addToast={addToast}
                  />
                </div>
              )}
            </div>

            {/* Cột phải: Thông tin chi tiết */}
            <div className='space-y-6'>
              {/* Organizer */}
              <div className='bg-white rounded-xl p-5 shadow-sm border border-gray-200'>
                <p className='text-sm font-semibold text-gray-600 mb-2'>
                  Tổ chức bởi
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-purple-100 overflow-hidden border-2 border-purple-200'>
                    {organizer.profilePicture ? (
                      <img
                        src={organizer.profilePicture}
                        alt=''
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-purple-700 font-bold'>
                        {organizer.userName?.[0] || "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className='font-bold text-gray-900'>
                      {organizer.userName || "Admin"}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {organizer.userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin nhanh */}
              <div className='bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-5'>
                <div className='flex items-start gap-3'>
                  <Calendar className='w-5 h-5 text-emerald-600 mt-0.5' />
                  <div>
                    <p className='font-semibold text-gray-700'>Thời gian</p>
                    <p className='text-gray-900'>
                      {new Date(event.startDate).toLocaleDateString("vi-VN")}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {new Date(event.startDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {event.endDate &&
                        ` ${new Date(event.endDate).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )}`}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <MapPin className='w-5 h-5 text-emerald-600 mt-0.5' />
                  <div>
                    <p className='font-semibold text-gray-700'>Địa điểm</p>
                    <p className='text-gray-900'>
                      {event.location || "Chưa xác định"}
                    </p>
                    {event.coordinate?.lat && event.coordinate?.lng ? (
                      <div className='mt-3'>
                        <LocationPicker
                          lat={event.coordinate.lat}
                          lng={event.coordinate.lng}
                          onLocationSelect={() => {}} // Không cần chọn lại → để trống hoặc ẩn click
                          // Có thể thêm prop readOnly nếu bạn muốn tắt click
                        />
                      </div>
                    ) : (
                      <p className='text-sm text-gray-500 mt-2'>
                        Chưa có tọa độ chính xác
                      </p>
                    )}
                    <button
                      onClick={openGoogleMaps}
                      className='text-sm text-primary-600 hover:underline mt-1 flex items-center gap-1'>
                      <MapPin className='w-3.5 h-3.5' /> Xem trên bản đồ
                    </button>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <Users className='w-5 h-5 text-emerald-600 mt-0.5' />
                  <div>
                    <p className='font-semibold text-gray-700'>Quy mô</p>
                    <p className='text-gray-900'>
                      {event.maxParticipants} tình nguyện viên
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <Star className='w-5 h-5 text-yellow-500 mt-0.5 fill-yellow-500' />{" "}
                  {/* fill-yellow-500 để tô màu vàng */}
                  <div>
                    <p className='font-semibold text-gray-700'>Đánh giá</p>
                    <div className='flex items-baseline gap-2'>
                      <p className='text-xl font-bold text-gray-900'>
                        {event.averageRating || 0}
                        <span className='text-sm font-normal text-gray-500 ml-1'>
                          / 5
                        </span>
                      </p>
                      <span className='text-sm text-gray-500'>
                        ({event.ratingCount || 0} lượt)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer với hành động duyệt (nếu bật) */}
        {showApprovalActions && (
          <div className='p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4'>
            <button
              onClick={() => onReject(event)}
              className='px-6 py-3 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 font-medium transition flex items-center gap-2'>
              <XCircle className='w-5 h-5' />
              Từ chối
            </button>
            <button
              onClick={() => onApprove(event)}
              className='px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium shadow-lg transition flex items-center gap-2'>
              <CheckCircle className='w-5 h-5' />
              Duyệt sự kiện
            </button>
          </div>
        )}

        {/* Footer đóng nếu không có duyệt */}
        {!showApprovalActions && (
          <div className='p-6 border-t border-gray-200 bg-gray-50 text-right'>
            <button
              onClick={onClose}
              className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition'>
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailModal;
