/** @format */

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast, { ToastContainer } from "../../components/common/Toast";
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
import { extractAllTags } from "../../utils/tagHelpers";
import TagBubbleModal from "./TagBubbleModal";
import { getEventTimeStatus } from "../../utils/eventHelpers";
const TIME_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang diễn ra", value: "ongoing" },
  { label: "Sắp diễn ra", value: "upcoming" },
  { label: "Đã diễn ra", value: "past" },
];

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
  const [toastList, setToastList] = useState([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const allTags = useMemo(() => extractAllTags(eventsData), [eventsData]);

  const statusCounts = useMemo(() => {
    return {
      all: eventsData.length,
      approved: eventsData.filter((e) => e.status === "approved" || !e.status)
        .length,
      pending: eventsData.filter((e) => e.status === "pending").length,
    };
  }, [eventsData]);

  const userRegistrations = useMemo(() => {
    const regMap = {};
    const registrations = Array.isArray(myRegistrations) ? myRegistrations : [];
    registrations.forEach((reg) => {
      if (reg.status !== "cancelled") {
        regMap[reg.eventId?._id || reg.eventId] = reg;
      }
    });
    return regMap;
  }, [myRegistrations]);

  //Confirm modal state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    registrationId: null,
    eventTitle: "",
  });
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToastList((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) =>
    setToastList((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    dispatch(fetchEvents());
    if (user) {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (successMessage) {
      addToast(successMessage, "success");
      dispatch(clearRegistrationMessages());
      dispatch(fetchEvents());
    }
    if (registrationError) {
      addToast(registrationError, "error");
      dispatch(clearRegistrationMessages());
    }
  }, [successMessage, registrationError, dispatch]);

  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";

  const filteredEvents = useMemo(() => {
    // 1. Lọc danh sách (Giữ nguyên logic filter của bạn)

    const filtered = eventsData.filter((event) => {
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
      // Chuẩn hóa ngày để so sánh
      const start = event.startDate || `${event.date}T${event.startTime}`;
      const end = event.endDate || `${event.date}T${event.endTime}`;
      const eventStart = new Date(start);
      const eventEnd = new Date(end);

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

    // 2. Logic Sắp xếp Ưu tiên (Xếp ngang: 0 -> 1 -> 2...)
    return filtered.sort((a, b) => {
      const startA = a.startDate || `${a.date}T${a.startTime}`;
      const endA = a.endDate || `${a.date}T${a.endTime}`;
      const startB = b.startDate || `${b.date}T${b.startTime}`;
      const endB = b.endDate || `${b.date}T${b.endTime}`;

      const timeStatusA = getEventTimeStatus(startA, endA);
      const timeStatusB = getEventTimeStatus(startB, endB);
      const regA = userRegistrations[a._id || a.id];
      const regB = userRegistrations[b._id || b.id];

      const getPriority = (ts, reg) => {
        if (ts === "EXPIRED") return 4; // Hết hạn xuống cuối
        if (reg) return 1; // Đã đăng ký lên đầu
        if (ts === "ONGOING") return 2; // Đang diễn ra thứ 2
        return 3; // Sắp tới thứ 3
      };

      const pA = getPriority(timeStatusA, regA);
      const pB = getPriority(timeStatusB, regB);

      return pA !== pB ? pA - pB : new Date(startA) - new Date(startB);
    });
  }, [
    searchQuery,
    selectedTag,
    statusFilter,
    timeFilter,
    selectedDate,
    eventsData,
    userRegistrations, // Dependency quan trọng để sort lại khi nhấn đăng ký/hủy
    isAdmin,
    isManager,
  ]);

  const handleRegister = async (eventId) => {
    if (!user) {
      openAuth?.("login");
      return;
    }

    // THÔNG BÁO NẾU ĐÃ ĐĂNG KÝ
    if (userRegistrations[eventId]) {
      addToast("Bạn đã đăng ký tham gia sự kiện này rồi.", "info");
      return;
    }

    try {
      await dispatch(registerForEvent(eventId)).unwrap();
      dispatch(fetchMyRegistrations());
    } catch (error) {
      addToast(error || "Có lỗi xảy ra khi đăng ký.", "error");
    }
  };

  const handleCancelRegistration = (eventId) => {
    const registration = userRegistrations[eventId];
    const event = eventsData.find((item) => (item._id || item.id) === eventId);

    if (!registration || !registration._id) {
      addToast("Không tìm thấy thông tin đăng ký.", "error");
      return;
    }

    // Mở ConfirmModal thay vì window.confirm
    setCancelModal({
      isOpen: true,
      registrationId: registration._id,
      eventTitle: event?.title || "sự kiện này",
    });
  };

  const handleConfirmCancel = async () => {
    const { registrationId } = cancelModal;

    try {
      // Dùng .unwrap() để await có hiệu lực và bắt lỗi chính xác
      const result = await dispatch(
        cancelRegistration(registrationId)
      ).unwrap();
      addToast(result.message || "Hủy đăng ký thành công", "success");
    } catch (error) {
      // Đưa lỗi 400 hoặc lỗi server vào Toast chuyên nghiệp
      addToast(error || "Không thể hủy đơn đăng ký", "error");
    } finally {
      // Tải lại dữ liệu để cập nhật số lượng người tham gia và trạng thái nút
      await dispatch(fetchMyRegistrations()).unwrap();
      await dispatch(fetchEvents()).unwrap();

      setCancelModal({ ...cancelModal, isOpen: false });
    }
  };
  return (
    <div className='w-full min-h-screen bg-surface-muted px-6 py-10'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <header className='flex items-center justify-between flex-wrap gap-4'>
          <div>
            <h1 className='heading-1'>Sự kiện tình nguyện</h1>
            <p className='text-body mt-1'>
              Tham gia các hoạt động ý nghĩa trong cộng đồng
            </p>
          </div>
          {isAdmin && (
            <button className='btn btn-primary'>
              <Plus className='h-4 w-4' /> Tạo sự kiện mới
            </button>
          )}
        </header>

        {/* Filters - Đã khôi phục đầy đủ để dùng setStatusFilter */}
        <section className='card p-5'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='flex flex-col gap-3'>
              <div className='relative w-full'>
                <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted' />
                <input
                  type='text'
                  placeholder='Tìm kiếm...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700'
                />
              </div>
              <button
                onClick={() => setIsTagModalOpen(true)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border ${
                  selectedTag !== "all"
                    ? "bg-primary-50 border-primary-200 text-primary-700"
                    : "bg-white border-gray-200 text-text-secondary"
                }`}>
                <div className='flex items-center gap-2'>
                  <Filter className='w-4 h-4' />
                  <span>
                    {selectedTag === "all"
                      ? "Lọc theo chủ đề"
                      : `Chủ đề: ${selectedTag}`}
                  </span>
                </div>
              </button>
            </div>

            <div className='flex flex-col gap-3 justify-center'>
              <div className='flex flex-wrap items-center gap-2'>
                <Clock className='h-5 w-5 text-text-muted mr-1' />
                {TIME_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTimeFilter(value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      timeFilter === value
                        ? "bg-primary-100 text-primary-700"
                        : "bg-surface-muted"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-2 pt-2 border-t border-gray-100'>
                <Calendar className='h-5 w-5 text-text-muted mr-1' />
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className='input-field py-1.5 w-full'
                />
              </div>
            </div>
          </div>

          {/* SỬA LỖI LINT: Khôi phục logic sử dụng setStatusFilter */}
          {(isAdmin || isManager) && (
            <div className='mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 overflow-x-auto'>
              <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap'>
                Trạng thái duyệt:
              </span>
              {["all", "approved", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  // Thay đổi style để làm nổi bật nút đang chọn và thêm Badge
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                    statusFilter === status
                      ? "bg-blue-600 text-white shadow-sm" // Màu đậm hơn khi được chọn
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  <span>
                    {status === "all"
                      ? "Tất cả"
                      : EVENT_STATUS[status]?.label || status}
                  </span>

                  {/* Badge hiển thị số lượng thực tế */}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      statusFilter === status
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                    {statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Events Grid */}
        <section className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredEvents.map((event, idx) => {
            const eventId = event._id || event.id;
            const reg = userRegistrations[eventId];
            const timeStatus = getEventTimeStatus(
              event.startDate,
              event.endDate
            );
            const isExpired = timeStatus === "EXPIRED";
            const isFull =
              (event.currentParticipants ?? 0) >= (event.maxParticipants ?? 0);
            const isApproved = event.status === "approved" || !event.status;
            const isAutoCancelled =
              (reg?.status === "pending" || reg?.status === "waitlisted") &&
              (isFull || isExpired);

            return (
              <motion.article
                key={eventId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className='card flex flex-col overflow-hidden hover:shadow-lg transition-shadow'>
                <div className='relative h-48'>
                  <img
                    src={event.image}
                    alt={event.title}
                    className='h-full w-full object-cover'
                  />
                  <div
                    className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      isExpired
                        ? "bg-gray-100 text-gray-600 border border-gray-200"
                        : event.status === "approved"
                        ? "badge-success"
                        : "badge-warning"
                    }`}>
                    {isExpired
                      ? "Đã kết thúc"
                      : EVENT_STATUS[event.status]?.label || "Công khai"}
                  </div>
                </div>

                <div className='flex flex-col flex-1 p-5 space-y-3'>
                  <h3 className='text-lg font-semibold text-text-main line-clamp-2'>
                    {event.title}
                  </h3>
                  <div className='flex items-center gap-2 text-sm text-text-secondary'>
                    <Users className='h-4 w-4 text-text-muted' />
                    <span>
                      {event.currentParticipants}/{event.maxParticipants} người
                    </span>
                  </div>

                  <div className='flex flex-wrap gap-2 pt-3 border-t'>
                    {!isAdmin && !isManager && isApproved && (
                      <div className='flex-1'>
                        {isExpired ? (
                          <button
                            disabled
                            className='w-full py-2 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed'>
                            Sự kiện đã kết thúc
                          </button>
                        ) : isAutoCancelled ? (
                          /* THÊM TRẠNG THÁI NÀY: Hiển thị cho người dùng biết họ không được duyệt kịp */
                          <button
                            disabled
                            className='w-full py-2 rounded-lg font-semibold bg-red-50 text-red-400'>
                            Đăng ký đã đóng
                          </button>
                        ) : reg ? (
                          <div className='flex gap-2 w-full'>
                            <button
                              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                                ["accepted", "approved", "registered"].includes(
                                  reg.status
                                )
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                              {["accepted", "approved", "registered"].includes(
                                reg.status
                              )
                                ? "Đã đăng ký"
                                : "Đang chờ duyệt"}
                            </button>
                            <button
                              onClick={() => handleCancelRegistration(eventId)}
                              className='p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50'>
                              <XCircle className='h-5 w-5' />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(eventId)}
                            disabled={isFull}
                            className={`w-full py-2 rounded-lg font-semibold ${
                              isFull
                                ? "bg-gray-100 text-gray-400"
                                : "btn-primary"
                            }`}>
                            {isFull ? "Hết chỗ" : "Đăng ký ngay"}
                          </button>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/events/${eventId}`)}
                      className='rounded-lg border px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50 flex items-center gap-1 shrink-0'>
                      <Eye className='h-4 w-4' /> Chi tiết
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
        <ConfirmModal
          isOpen={cancelModal.isOpen}
          type='danger' // Hiện icon cảnh báo đỏ
          title='Xác nhận hủy đăng ký'
          message={
            <p>
              Bạn có chắc muốn hủy đăng ký tham gia sự kiện
              <span className='font-bold'> "{cancelModal.eventTitle}"</span>?
            </p>
          }
          confirmText='Xác nhận hủy'
          cancelText='Quay lại'
          onClose={() => setCancelModal({ ...cancelModal, isOpen: false })}
          onConfirm={handleConfirmCancel}
        />
        <TagBubbleModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={(tag) => setSelectedTag(tag)}
        />
        <ToastContainer toasts={toastList} removeToast={removeToast} />
      </div>
    </div>
  );
}
