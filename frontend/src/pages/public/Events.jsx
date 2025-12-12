/** @format */

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { EVENT_CATEGORIES, EVENT_STATUS } from "../../utils/constants";
import { motion } from "framer-motion";
import { fetchEvents } from "../../features/event/eventSlice";
import {
  fetchMyRegistrations,
  registerForEvent,
  cancelRegistration,
  clearRegistrationMessages,
} from "../../features/registration/registrationSlice";

const TIME_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang diễn ra", value: "ongoing" },
  { label: "Sắp diễn ra", value: "upcoming" },
  { label: "Đã diễn ra", value: "past" },
];

export default function EventsPage({ user, openAuth }) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 2. Khai báo hook navigate

  // Redux state
  const { list: eventsData } = useSelector((state) => state.event);
  const {
    myRegistrations,
    successMessage,
    error: registrationError,
  } = useSelector((state) => state.registration);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);

  // Convert myRegistrations array to map
  const userRegistrations = useMemo(() => {
    const regMap = {};
    const registrations = Array.isArray(myRegistrations) ? myRegistrations : [];
    registrations.forEach((reg) => {
      regMap[reg.eventId?._id || reg.eventId] = reg;
    });
    return regMap;
  }, [myRegistrations]);

  useEffect(() => {
    dispatch(fetchEvents());
    if (user) {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (successMessage) {
      setToast({ type: "success", message: successMessage });
      dispatch(clearRegistrationMessages());
      dispatch(fetchEvents());
    }
    if (registrationError) {
      setToast({ type: "error", message: registrationError });
      dispatch(clearRegistrationMessages());
    }
  }, [successMessage, registrationError, dispatch]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" || event.category === selectedCategory;
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;

      const now = new Date();
      const eventStart = new Date(
        event.startDate || `${event.date}T${event.startTime}`
      );
      const eventEnd = new Date(
        event.endDate || `${event.date}T${event.endTime}`
      );

      const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && eventStart > now) ||
        (timeFilter === "ongoing" && eventStart <= now && eventEnd >= now) ||
        (timeFilter === "past" && eventEnd < now);

      const matchesDate =
        !selectedDate ||
        event.date === selectedDate ||
        event.startDate?.startsWith(selectedDate);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesTime &&
        matchesDate
      );
    });
  }, [
    searchQuery,
    selectedCategory,
    statusFilter,
    timeFilter,
    selectedDate,
    eventsData,
  ]);

  // --- HÀM XỬ LÝ CHUYỂN TRANG CHI TIẾT ---
  const handleViewDetail = (eventId) => {
    if (user?.role === "admin") {
      navigate(`/admin/events/${eventId}`);
    } else if (user?.role === "manager") {
      navigate(`/manager/events/${eventId}`);
    } else {
      navigate(`/events/${eventId}`);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      openAuth?.("login");
      return;
    }
    const event = eventsData.find(
      (item) => item._id === eventId || item.id === eventId
    );
    if (!event) {
      setToast({ type: "error", message: "Không tìm thấy sự kiện." });
      return;
    }
    if (userRegistrations[eventId]) {
      setToast({ type: "info", message: "Bạn đã đăng ký sự kiện này rồi." });
      return;
    }
    try {
      await dispatch(registerForEvent(eventId)).unwrap();
      dispatch(fetchMyRegistrations());
    } catch (error) {
      setToast({
        type: "error",
        message: error || "Có lỗi xảy ra khi đăng ký.",
      });
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!user) {
      openAuth?.("login");
      return;
    }
    const registration = userRegistrations[eventId];
    if (!registration) {
      setToast({ type: "info", message: "Bạn chưa đăng ký sự kiện này." });
      return;
    }
    if (registration.status === "rejected") {
      setToast({
        type: "error",
        message: "Không thể hủy đăng ký đã bị từ chối.",
      });
      return;
    }
    const event = eventsData.find(
      (item) => item._id === eventId || item.id === eventId
    );
    if (!event) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn hủy đăng ký sự kiện "${event.title}" không?`
      )
    ) {
      return;
    }
    try {
      await dispatch(cancelRegistration(registration._id)).unwrap();
      dispatch(fetchMyRegistrations());
    } catch (error) {
      setToast({ type: "error", message: error || "Lỗi khi hủy đăng ký" });
    }
  };

  const isVolunteer = user?.role === "volunteer";
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";

  return (
    <div className='w-full min-h-screen bg-surface-muted px-6 py-10'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <header className='space-y-3'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <h1 className='heading-1'>Sự kiện tình nguyện</h1>
              <p className='text-body mt-1'>
                Khám phá và tham gia các hoạt động ý nghĩa trong cộng đồng
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() =>
                  alert("Tạo sự kiện mới - Tính năng đang phát triển")
                }
                className='btn btn-primary'>
                <Plus className='h-4 w-4' />
                Tạo sự kiện mới
              </button>
            )}
          </div>
        </header>

        {toast && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-sm transition ${
              toast.type === "success"
                ? "badge-success"
                : toast.type === "warning"
                ? "badge-warning"
                : toast.type === "info"
                ? "badge-info"
                : "badge-error"
            }`}>
            {toast.message}
          </div>
        )}

        {/* Filters */}
        <section className='card p-5'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted' />
              <input
                type='text'
                placeholder='Tìm kiếm sự kiện...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='input-field pl-10'
              />
            </div>
            <div className='flex items-center gap-2 flex-wrap'>
              <Filter className='h-5 w-5 text-text-muted' />
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-primary-100 text-primary-700"
                      : "bg-surface-muted text-text-secondary hover:bg-gray-200"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className='mt-4 flex flex-wrap items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-text-muted' />
              {TIME_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeFilter(value)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    timeFilter === value
                      ? "bg-primary-100 text-primary-700"
                      : "bg-surface-muted text-text-secondary hover:bg-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <div className='flex items-center gap-2 pl-4 border-l border-gray-200'>
              <Calendar className='h-5 w-5 text-text-muted' />
              <input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='input-field py-1 text-text-secondary w-auto'
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate("")}
                  className='text-xs text-text-muted hover:text-text-secondary'>
                  Xóa
                </button>
              )}
            </div>
          </div>
          {(isAdmin || isManager) && (
            <div className='mt-4 flex items-center gap-2 pt-4 border-t border-gray-200'>
              <span className='text-sm font-medium text-text-secondary'>
                Trạng thái:
              </span>
              {["all", "approved", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-surface-dark text-white"
                      : "bg-surface-muted text-text-secondary hover:bg-gray-200"
                  }`}>
                  {status === "all" ? "Tất cả" : EVENT_STATUS[status]?.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Events Grid */}
        <section className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredEvents.length === 0 ? (
            <div className='col-span-full text-center py-12'>
              <p className='text-text-muted text-lg'>
                Không tìm thấy sự kiện nào phù hợp
              </p>
            </div>
          ) : (
            filteredEvents.map((event, idx) => {
              const eventId = event._id || event.id;
              const registration = userRegistrations[eventId];
              const isFull =
                (event.currentParticipants ?? event.registered ?? 0) >=
                (event.maxParticipants ?? event.slots ?? 0);
              const isApproved = event.status === "approved" || !event.status;

              let buttonState = "register";
              if (registration) {
                buttonState = registration.status;
              } else if (isFull) {
                buttonState = "full";
              }

              return (
                <motion.article
                  key={eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className='card flex flex-col overflow-hidden hover:shadow-lg transition-shadow'>
                  {/* Event Image */}
                  <div className='relative h-48 bg-surface-muted'>
                    <img
                      src={event.image}
                      alt={event.title}
                      className='h-full w-full object-cover'
                    />
                    <div
                      className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        event.status === "approved"
                          ? "badge-success"
                          : event.status === "pending"
                          ? "badge-warning"
                          : "badge-error"
                      }`}>
                      {EVENT_STATUS[event.status]?.label}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className='flex flex-col flex-1 p-5 space-y-3'>
                    <div>
                      <span className='inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700'>
                        {event.category}
                      </span>
                      <h3 className='mt-2 text-lg font-semibold text-text-main line-clamp-2'>
                        {event.title}
                      </h3>
                      <p className='mt-1 text-sm text-text-secondary line-clamp-2'>
                        {event.description}
                      </p>
                    </div>

                    <div className='space-y-2 text-sm text-text-secondary'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-text-muted' />
                        <span>
                          {new Date(
                            event.startDate ||
                              `${event.date}T${event.startTime}`
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-text-muted' />
                        <span className='line-clamp-1'>{event.location}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Users className='h-4 w-4 text-text-muted' />
                        <span>
                          {event.currentParticipants ?? event.registered}/
                          {event.maxParticipants ?? event.slots} người đã đăng
                          ký
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-1.5'>
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className='rounded-md bg-surface-muted px-2 py-0.5 text-xs text-text-secondary'>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className='flex flex-wrap gap-2 pt-3 border-t border-gray-200'>
                      {/* Volunteer actions */}
                      {(!user || isVolunteer) && isApproved && (
                        <>
                          {buttonState === "pending" ? (
                            <div className='flex-1 flex gap-2'>
                              <button
                                disabled
                                className='flex-1 rounded-lg bg-warning-100 px-3 py-2 text-sm font-semibold text-warning-700 cursor-default'>
                                Đang chờ duyệt
                              </button>
                              <button
                                onClick={() =>
                                  handleCancelRegistration(eventId)
                                }
                                className='rounded-lg border border-error-200 px-3 py-2 text-sm font-semibold text-error-600 hover:bg-error-50'>
                                <XCircle className='h-4 w-4' />
                              </button>
                            </div>
                          ) : buttonState === "accepted" ? (
                            <div className='flex-1 flex gap-2'>
                              <button
                                disabled
                                className='flex-1 rounded-lg bg-success-100 px-3 py-2 text-sm font-semibold text-success-700 cursor-default'>
                                Đã tham gia
                              </button>
                              <button
                                onClick={() =>
                                  handleCancelRegistration(eventId)
                                }
                                className='rounded-lg border border-error-200 px-3 py-2 text-sm font-semibold text-error-600 hover:bg-error-50'>
                                <XCircle className='h-4 w-4' />
                              </button>
                            </div>
                          ) : buttonState === "rejected" ? (
                            <button
                              disabled
                              className='flex-1 rounded-lg bg-error-100 px-3 py-2 text-sm font-semibold text-error-700 cursor-not-allowed'>
                              Bị từ chối
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(eventId)}
                              disabled={isFull}
                              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                isFull
                                  ? "bg-surface-muted text-text-muted cursor-not-allowed"
                                  : "btn-primary"
                              }`}>
                              {isFull ? "Đã hết chỗ" : "Đăng ký"}
                            </button>
                          )}

                          {/* Nút Xem Chi Tiết - ĐÃ SỬA */}
                          <button
                            onClick={() => handleViewDetail(eventId)}
                            className='rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted'>
                            <Eye className='h-4 w-4' />
                          </button>
                        </>
                      )}

                      {/* Admin actions */}
                      {isAdmin && (
                        <>
                          {event.status === "pending" && (
                            <div className='flex gap-2 w-full'>
                              <span className='text-sm text-warning-600 bg-warning-50 px-3 py-2 rounded-lg flex-1 text-center font-medium'>
                                Cần duyệt trong Dashboard
                              </span>
                            </div>
                          )}
                          {/* Nút Chi Tiết cho Admin - ĐÃ SỬA */}
                          <button
                            onClick={() => handleViewDetail(eventId)}
                            className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-muted mt-2'>
                            Xem chi tiết
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })
          )}
        </section>

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-6 text-center'>
            <h3 className='text-lg font-semibold text-text-main'>
              Đăng nhập để đăng ký sự kiện
            </h3>
            <p className='mt-2 text-sm text-text-secondary'>
              Tạo tài khoản miễn phí để tham gia các hoạt động tình nguyện
            </p>
            <div className='mt-4 flex justify-center gap-3'>
              <button
                onClick={() => openAuth?.("login")}
                className='btn btn-primary'>
                Đăng nhập
              </button>
              <button
                onClick={() => openAuth?.("register")}
                className='rounded-lg border border-primary-200 bg-white px-5 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50'>
                Đăng ký tài khoản
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
