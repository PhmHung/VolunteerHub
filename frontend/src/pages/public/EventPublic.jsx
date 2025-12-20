/** @format */

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  XCircle,
  Eye,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { EVENT_STATUS } from "../../utils/constants";
import { motion } from "framer-motion";
import { fetchEvents } from "../../features/eventSlice";
import {
  fetchMyRegistrations,
  registerForEvent,
  cancelRegistration,
  clearRegistrationMessages,
} from "../../features/registrationSlice";

const TIME_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang diễn ra", value: "ongoing" },
  { label: "Sắp diễn ra", value: "upcoming" },
  { label: "Đã diễn ra", value: "past" },
];

import { extractAllTags } from "../../utils/tagHelpers";
import TagBubbleModal from "./TagBubbleModal";

export default function EventsPage({ user, openAuth }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: eventsData } = useSelector((state) => state.event);
  const {
    myRegistrations,
    successMessage,
    error: registrationError,
  } = useSelector((state) => state.registration);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const allTags = useMemo(() => extractAllTags(eventsData), [eventsData]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const userRegistrations = useMemo(() => {
    const regMap = {};
    const registrations = Array.isArray(myRegistrations)
      ? myRegistrations
      : [];
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

  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";

  const filteredEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const eventCat = event.category?.toLowerCase().trim() || "";
      const eventTags = (event.tags || []).map((t) => t.toLowerCase().trim());

      const matchesTag =
        selectedTag === "all" ||
        eventCat === selectedTag ||
        eventTags.includes(selectedTag);

      const matchesStatusFilter =
        statusFilter === "all" || event.status === statusFilter;

      const isPubliclyVisible =
        isAdmin || isManager || event.status === "approved";

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
        matchesTag &&
        matchesStatusFilter &&
        matchesTime &&
        matchesDate &&
        isPubliclyVisible
      );
    });
  }, [
    searchQuery,
    selectedTag,
    statusFilter,
    timeFilter,
    selectedDate,
    eventsData,
    isAdmin,
    isManager,
  ]);

  const handleViewDetail = (eventId) => {
    navigate(`/events/${eventId}`);
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

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Sự kiện tình nguyện
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl">
              Kết nối cộng đồng, lan tỏa yêu thương qua các hoạt động ý nghĩa.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() =>
                alert("Tạo sự kiện mới - Tính năng đang phát triển")
              }
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo sự kiện</span>
            </button>
          )}
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border ${
                toast.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : toast.type === "warning"
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : toast.type === "info"
                  ? "bg-blue-50 border-blue-100 text-blue-800"
                  : "bg-red-50 border-red-100 text-red-800"
              }`}
            >
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Search & Tag Filter */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsTagModalOpen(true)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    selectedTag !== "all"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Filter className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {selectedTag === "all"
                        ? "Lọc theo chủ đề"
                        : `Chủ đề: ${
                            allTags.find((t) => t.id === selectedTag)?.text ||
                            selectedTag
                          }`}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
                </button>
                <TagBubbleModal
                  isOpen={isTagModalOpen}
                  onClose={() => setIsTagModalOpen(false)}
                  tags={allTags}
                  selectedTag={selectedTag}
                  onSelectTag={(tag) => setSelectedTag(tag)}
                />
              </div>
            </div>

            {/* Time & Date Filter */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {TIME_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTimeFilter(value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      timeFilter === value
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 lg:pt-0">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    Xóa ngày
                  </button>
                )}
              </div>
            </div>
          </div>

          {(isAdmin || isManager) && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 overflow-x-auto">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Trạng thái duyệt:
              </span>
              {["all", "approved", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "all"
                    ? "Tất cả"
                    : EVENT_STATUS[status]?.label || status}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Events Grid - PHẦN QUAN TRỌNG: CỐ ĐỊNH NÚT BẤM */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-500 max-w-sm mt-1">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem các sự kiện
                khác.
              </p>
            </div>
          ) : (
            filteredEvents.map((event, idx) => {
              const eventId = event._id || event.id;
              const registration = userRegistrations[eventId];
              const isFull =
                (event.currentParticipants ?? event.registered ?? 0) >=
                (event.maxParticipants ?? event.slots ?? 0);
              // Logic hiển thị: Nếu là admin/manager thì luôn thấy, còn user thường thì phải duyệt rồi mới thấy nút đăng ký
              const isApproved = event.status === "approved";

              let buttonState = "register";
              if (registration) buttonState = registration.status;
              else if (isFull) buttonState = "full";

              return (
                <motion.article
                  key={eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  // Fixed height to ensure alignment
                  className="group flex flex-col h-[450px] bg-white rounded-[24px] border border-gray-200 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                          event.status === "approved"
                            ? "bg-emerald-500/90 text-white"
                            : event.status === "pending"
                            ? "bg-amber-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}
                      >
                        {EVENT_STATUS[event.status]?.label || "Công khai"}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-col flex-1 p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                      {event.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="truncate font-medium">
                          {new Date(
                            event.startDate ||
                              `${event.date}T${event.startTime}`
                          ).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          <span className="font-semibold text-gray-900">
                            {event.currentParticipants ?? event.registered}
                          </span>
                          <span className="text-gray-400 mx-1">/</span>
                          {event.maxParticipants ?? event.slots} chỗ
                        </span>
                      </div>
                    </div>

                    {/* --- BUTTONS FOOTER: NƠI CHỨA CÁC NÚT --- */}
                    <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-[1fr,auto] gap-3">
                      
                      {/* 1. NÚT ĐĂNG KÝ (BÊN TRÁI, TO) */}
                      {/* Nếu là Admin/Manager hoặc sự kiện chưa duyệt -> Hiển thị trạng thái */}
                      {(isAdmin || isManager || !isApproved) ? (
                         <div className="w-full rounded-xl bg-gray-100 border border-gray-200 text-gray-500 text-sm font-semibold flex items-center justify-center py-2.5 cursor-default">
                            {event.status === 'pending' ? "Đang chờ duyệt" : "Chế độ xem quản lý"}
                         </div>
                      ) : (
                        // Logic cho Volunteer / Guest
                        <>
                          {buttonState === "pending" ? (
                            <div className="flex gap-2 w-full">
                              <button
                                disabled
                                className="flex-1 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold cursor-default border border-amber-100 flex items-center justify-center gap-2"
                              >
                                <Clock className="w-4 h-4"/> Đang chờ
                              </button>
                              <button
                                onClick={() => handleCancelRegistration(eventId)}
                                className="w-12 rounded-xl bg-white border border-gray-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                                title="Hủy đăng ký"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : buttonState === "accepted" ? (
                            <div className="flex gap-2 w-full">
                              <button
                                disabled
                                className="flex-1 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold cursor-default border border-emerald-100 flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4"/> Đã tham gia
                              </button>
                              <button
                                onClick={() => handleCancelRegistration(eventId)}
                                className="w-12 rounded-xl bg-white border border-gray-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                                title="Hủy đăng ký"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : buttonState === "rejected" ? (
                            <button
                              disabled
                              className="w-full rounded-xl bg-red-50 text-red-700 text-sm font-bold cursor-not-allowed border border-red-100 py-2.5"
                            >
                              Từ chối
                            </button>
                          ) : (
                            // Nút đăng ký mặc định
                            <button
                              onClick={() => handleRegister(eventId)}
                              disabled={isFull}
                              className={`w-full rounded-xl text-sm font-bold py-2.5 transition-all shadow-sm flex items-center justify-center gap-2 group/btn ${
                                isFull
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-200 hover:-translate-y-0.5"
                              }`}
                            >
                              {isFull ? "Hết chỗ" : "Đăng ký ngay"}
                              {!isFull && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                            </button>
                          )}
                        </>
                      )}

                      {/* 2. NÚT XEM CHI TIẾT (BÊN PHẢI, ICON CON MẮT) */}
                      <button
                        onClick={() => handleViewDetail(eventId)}
                        className="w-12 h-full rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })
          )}
        </section>

        {/* Guest CTA */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Tham gia cộng đồng tình nguyện ngay hôm nay
              </h3>
              <p className="text-gray-300 text-lg">
                Đăng nhập hoặc tạo tài khoản để đăng ký tham gia các sự kiện,
                theo dõi hoạt động và kết nối với hàng ngàn tình nguyện viên
                khác.
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => openAuth?.("login")}
                  className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuth?.("register")}
                  className="px-8 py-3 bg-transparent border border-white/30 text-white rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}