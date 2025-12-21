/** @format */

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEventTimeStatus } from "../../utils/eventHelpers";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Users,
  Navigation,
} from "lucide-react";
import api from "../../api";
import { registerForEvent } from "../../features/registrationSlice";
import {
  getCoordinatesFromLocation,
  openGoogleMaps,
} from "../../utils/mapHelpers";
import { useGeolocation } from "../../hooks/useGeolocation";

// Import components
import ConfirmModal from "../../components/common/ConfirmModal";
import VolunteersList from "../../components/registrations/VolunteersList";
import EventSingleMap from "../public/EventMap";
import Toast, { ToastContainer } from "../../components/common/Toast";
import UserDetailModal from "../../components/users/UserDetailModal";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.user);
  const isManagerOrAdmin =
    profile?.role === "admin" || profile?.role === "manager";

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewingUser, setViewingUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const timeStatus = useMemo(() => {
    if (!event) return null;
    // Chuẩn hóa dữ liệu đầu vào để đảm bảo hàm chạy đúng
    const start = event.startDate || `${event.date}T${event.startTime}`;
    const end = event.endDate || `${event.date}T${event.endTime}`;
    return getEventTimeStatus(start, end);
  }, [event]);

  const isExpired = timeStatus === "EXPIRED";
  const isFull =
    (event.currentParticipants ?? 0) >= (event.maxParticipants ?? 0);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleViewUser = (userId) => {
    setViewingUser({ _id: userId });
  };
  // 1. Lấy vị trí người dùng
  const { location: userLocation } = useGeolocation();

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventRes = await api.get(`/api/events/${id}`);
        const eventData = eventRes.data?.data || eventRes.data;
        setEvent(eventData);

        try {
          const regRes = await api.get(`/api/events/${id}/registrations`);
          // Đảm bảo lấy đúng mảng registrations (thêm fallback mảng rỗng)
          const regData = regRes.data?.data || regRes.data || [];
          setRegistrations(Array.isArray(regData) ? regData : []);
        } catch {
          setRegistrations([]);
        }
      } catch {
        setError("Không thể tải thông tin sự kiện.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // 2. Tính toán tọa độ sự kiện (Memoized)
  const eventCoords = useMemo(() => {
    if (!event) return null;
    return (
      event.coordinate ||
      getCoordinatesFromLocation(event.location) ||
      getCoordinatesFromLocation(event.city)
    );
  }, [event]);

  // Lọc danh sách đã được duyệt
  const approvedVolunteers = registrations;

  // --- RENDER HELPERS ---
  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <p className='text-red-500 font-medium'>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className='px-4 py-2 bg-gray-200 rounded-lg'>
          Quay lại
        </button>
      </div>
    );
  if (!event) return null;

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Header Banner */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-gray-500 hover:text-gray-900 mb-4 transition'>
            <ArrowLeft className='w-4 h-4 mr-1' /> Quay lại
          </button>

          <div className='flex flex-col md:flex-row justify-between items-start gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase'>
                  {event.category || "Sự kiện"}
                </span>
                {isExpired ? (
                  <span className='px-3 py-1 text-xs font-bold rounded-full uppercase border bg-gray-100 text-gray-600 border-gray-200'>
                    Đã kết thúc
                  </span>
                ) : (
                  (isManagerOrAdmin || event.status === "cancelled") && (
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full uppercase border ${
                        event.status === "approved"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : event.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : event.status === "cancelled"
                          ? "bg-gray-100 text-gray-600 border-gray-200"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                      {event.status === "approved"
                        ? "Đã duyệt"
                        : event.status === "pending"
                        ? "Chờ duyệt"
                        : event.status === "cancelled"
                        ? "Đã hủy"
                        : "Từ chối"}
                    </span>
                  )
                )}
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {event.title}
              </h1>
              <p className='text-gray-500 flex items-center gap-2'>
                <User className='w-4 h-4' />
                Người tạo:{" "}
                <span className='font-medium text-gray-700'>
                  {event.createdBy?.userName || "Ban tổ chức"}
                </span>
              </p>
            </div>

            {/* Quick Stats */}
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-6 text-sm'>
              <div className='text-center'>
                <p className='text-gray-500 mb-1'>Quy mô</p>
                <p className='font-bold text-gray-900 text-lg'>
                  {event.maxParticipants}
                </p>
              </div>
              <div className='w-px bg-gray-200'></div>
              <div className='text-center'>
                <p className='text-gray-500 mb-1'>Đã tham gia</p>
                <p className='font-bold text-emerald-600 text-lg'>
                  {approvedVolunteers.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* LEFT COLUMN */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Image */}
            <div className='rounded-2xl overflow-hidden shadow-sm h-64 sm:h-80 bg-gray-200'>
              <img
                src={event.image || "https://via.placeholder.com/800x400"}
                alt={event.title}
                className='w-full h-full object-cover'
              />
            </div>

            {/* Description */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Mô tả chi tiết
              </h3>
              <p className='text-gray-600 whitespace-pre-line leading-relaxed'>
                {event.description}
              </p>
            </div>

            {/* Volunteers List */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <Users className='w-5 h-5 text-emerald-600' />
                Danh sách tham gia ({approvedVolunteers.length})
              </h3>
              <VolunteersList
                registrations={approvedVolunteers}
                users={[]}
                compact={false}
                canView={true}
                onUserClick={handleViewUser} // Truyền hàm xử lý
                userRole={profile?.role} // Truyền quyền của người đang xem
                addToast={addToast}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className='space-y-6'>
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
              <h4 className='font-bold text-gray-900 mb-2'>
                Thông tin thời gian & Địa điểm
              </h4>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0'>
                  <Calendar className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Ngày bắt đầu
                  </p>
                  <p className='text-gray-900 font-semibold'>
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                  <p className='text-xs text-gray-400'>
                    {event.startDate
                      ? new Date(event.startDate).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0'>
                  <MapPin className='w-5 h-5' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-500'>Địa điểm</p>
                  <p className='text-gray-900 font-semibold'>
                    {event.location}
                  </p>
                  <p className='text-xs text-gray-400 mb-2'>
                    {event.city || "Việt Nam"}
                  </p>
                  {/* Nút chỉ đường text */}
                  <button
                    onClick={() => openGoogleMaps(event)}
                    className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors'>
                    <Navigation className='w-4 h-4' />
                    Chỉ đường trên Google Maps
                  </button>
                </div>
              </div>

              {/* --- BẢN ĐỒ TÍCH HỢP --- */}
              <div className='mt-4 border border-gray-200 rounded-xl overflow-hidden relative h-64'>
                <EventSingleMap
                  event={event}
                  userLocation={userLocation}
                  eventCoords={eventCoords}
                />
              </div>
            </div>

            {/* Volunteer Action */}
            {!isManagerOrAdmin && (
              <div
                className={`${
                  event.status === "cancelled" || isExpired || isFull
                    ? "bg-gray-500 shadow-gray-200" // Chuyển màu xám nếu hủy HOẶC hết hạn
                    : "bg-emerald-600 shadow-emerald-200"
                } rounded-2xl p-6 text-white text-center shadow-lg transition-all duration-300`}>
                {isExpired ? (
                  /* TRƯỜNG HỢP 1: SỰ KIỆN ĐÃ KẾT THÚC */
                  <>
                    <h4 className='text-xl font-bold mb-2'>
                      Sự kiện đã kết thúc
                    </h4>
                    <p className='text-gray-100 text-sm mb-6'>
                      Hoạt động này đã hoàn thành thời gian tổ chức. Cảm ơn bạn
                      đã quan tâm đến chương trình.
                    </p>
                    <button
                      disabled
                      className='w-full py-3 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed shadow-sm'>
                      Sự kiện đã kết thúc
                    </button>
                  </>
                ) : isFull ? (
                  /* Trường hợp sự kiện đầy chỗ */
                  <>
                    <h4 className='text-xl font-bold mb-2'>
                      Sự kiện đã đầy chỗ
                    </h4>
                    <p className='text-gray-100 text-sm mb-6'>
                      Cảm ơn bạn, nhưng sự kiện đã đạt số lượng tối đa.
                    </p>
                    <button
                      disabled
                      className='w-full py-3 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed'>
                      Hết chỗ
                    </button>
                  </>
                ) : event.status === "cancelled" ? (
                  /* SỰ KIỆN BỊ HỦY */
                  <>
                    <h4 className='text-xl font-bold mb-2'>
                      Sự kiện đã ngừng tiếp nhận
                    </h4>
                    <p className='text-gray-100 text-sm mb-6'>
                      Rất tiếc, hoạt động này đã bị hủy bởi Ban tổ chức. Bạn
                      không thể đăng ký tham gia vào lúc này.
                    </p>
                    <button
                      disabled
                      className='w-full py-3 bg-gray-300 text-gray-500 font-bold rounded-xl cursor-not-allowed shadow-sm'>
                      Đã đóng đăng ký
                    </button>
                  </>
                ) : (
                  /* TRƯỜNG HỢP 3: CÒN HẠN VÀ ĐANG MỞ */
                  <>
                    <h4 className='text-xl font-bold mb-2'>Tham gia ngay!</h4>
                    <p className='text-emerald-100 text-sm mb-6'>
                      Hãy chung tay đóng góp cho cộng đồng bằng cách tham gia sự
                      kiện này.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          await dispatch(
                            registerForEvent(event._id || event.id)
                          ).unwrap();
                          addToast(
                            "Đã gửi yêu cầu đăng ký thành công!",
                            "success"
                          );

                          const regRes = await api.get(
                            `/api/events/${id}/registrations`
                          );
                          setRegistrations(
                            regRes.data?.data || regRes.data || []
                          );
                        } catch (err) {
                          addToast(
                            err || "Lỗi khi gửi yêu cầu đăng ký",
                            "error"
                          );
                        }
                      }}
                      className='w-full py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition shadow-sm'>
                      Đăng ký tham gia
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {viewingUser && (
        <UserDetailModal
          viewingUser={viewingUser}
          onClose={() => setViewingUser(null)}
          addToast={addToast}
          setConfirmModal={setConfirmModal}
        />
      )}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default EventDetail;
