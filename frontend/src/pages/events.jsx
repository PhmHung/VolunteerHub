import { useState, useMemo, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, Search, Filter, Plus, CheckCircle, XCircle, Eye, History } from "lucide-react";
import { MOCK_EVENTS, EVENT_CATEGORIES, EVENT_STATUS } from "../data/mockEvents";
import { motion } from "framer-motion";

const TIME_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang diễn ra", value: "ongoing" },
  { label: "Sắp diễn ra", value: "upcoming" },
  { label: "Đã diễn ra", value: "past" },
];

export default function EventsPage({ user, openAuth }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [timeFilter, setTimeFilter] = useState("all"); // all | upcoming | past
  const [statusFilter, setStatusFilter] = useState("all"); // all | approved | pending
  const [eventsData, setEventsData] = useState(() =>
    MOCK_EVENTS.map((event) => ({
      ...event,
      registered: Number.isFinite(event.registered) ? event.registered : 0,
    }))
  );
  const [registeredEventIds, setRegisteredEventIds] = useState(() => {
    const saved = localStorage.getItem("registeredEvents");
    return saved ? JSON.parse(saved) : [];
  });
  const [participationHistory, setParticipationHistory] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem("registeredEvents", JSON.stringify(registeredEventIds));
  }, [registeredEventIds]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Filter events based on search, category, and status
  const filteredEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tất cả" || event.category === selectedCategory;
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;

  const now = new Date();
  const eventStart = new Date(event.startDate || `${event.date}T${event.startTime}`);
  const eventEnd = new Date(event.endDate || `${event.date}T${event.endTime}`);
      const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && eventStart > now) ||
        (timeFilter === "ongoing" && eventStart <= now && eventEnd >= now) ||
        (timeFilter === "past" && eventEnd < now);

      return matchesSearch && matchesCategory && matchesStatus && matchesTime;
    });
  }, [searchQuery, selectedCategory, statusFilter, timeFilter, eventsData]);
  const handleRegister = (eventId) => {
    if (!user) {
      openAuth?.("login");
      return;
    }
    const event = eventsData.find((item) => item.id === eventId);
    if (!event) {
      setToast({ type: "error", message: "Không tìm thấy sự kiện." });
      return;
    }

    if (registeredEventIds.includes(eventId)) {
      setToast({ type: "info", message: "Bạn đã đăng ký sự kiện này rồi." });
      return;
    }

    if (event.registered >= event.slots) {
      setToast({ type: "warning", message: "Sự kiện đã đủ số lượng người tham gia." });
      return;
    }

    setEventsData((prev) =>
      prev.map((item) =>
        item.id === eventId ? { ...item, registered: item.registered + 1 } : item
      )
    );
    setRegisteredEventIds((prev) => [...prev, eventId]);
    const registerTimestamp = Date.now();
    setParticipationHistory((prev) => [
      {
        id: `${eventId}-${registerTimestamp}`,
        eventId,
        title: event.title,
        date: event.date,
        action: "registered",
        timestamp: registerTimestamp,
      },
      ...prev,
    ]);
    setToast({ type: "success", message: `Đăng ký thành công cho sự kiện "${event.title}"!` });
  };

  const handleCancelRegistration = (eventId) => {
    if (!user) {
      openAuth?.("login");
      return;
    }
    if (!registeredEventIds.includes(eventId)) {
      setToast({ type: "info", message: "Bạn chưa đăng ký sự kiện này." });
      return;
    }
    const event = eventsData.find((item) => item.id === eventId);
    if (!event) {
      setToast({ type: "error", message: "Không tìm thấy sự kiện." });
      return;
    }

    setEventsData((prev) =>
      prev.map((item) =>
        item.id === eventId
          ? { ...item, registered: Math.max(0, item.registered - 1) }
          : item
      )
    );
    setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
    const cancelTimestamp = Date.now();
    setParticipationHistory((prev) => [
      {
        id: `${eventId}-${cancelTimestamp}`,
        eventId,
        title: event.title,
        date: event.date,
        action: "cancelled",
        timestamp: cancelTimestamp,
      },
      ...prev,
    ]);
    setToast({ type: "success", message: `Đã hủy đăng ký sự kiện "${event.title}"!` });
  };

  const handleApprove = (eventId) => {
    alert(`Duyệt sự kiện ${eventId} - Tính năng đang phát triển`);
  };

  const handleReject = (eventId) => {
    alert(`Từ chối sự kiện ${eventId} - Tính năng đang phát triển`);
  };

  const isVolunteer = user?.role === "volunteer";
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";

  return (
    <div className="w-full min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Sự kiện tình nguyện</h1>
              <p className="text-base text-slate-600 mt-1">
                Khám phá và tham gia các hoạt động ý nghĩa trong cộng đồng
              </p>
            </div>
            
            {/* Manager/Admin can create events */}
            {(isAdmin) && (
              <button
                onClick={() => alert("Tạo sự kiện mới - Tính năng đang phát triển")}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Tạo sự kiện mới
              </button>
            )}
          </div>
        </header>

        {toast && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium shadow-sm transition ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : toast.type === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : toast.type === "info"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Filters */}
        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-5 w-5 text-slate-500" />
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            {TIME_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeFilter(value)}
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  timeFilter === value ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Status filter (Admin/Manager only) */}
          {(isAdmin || isManager) && (
            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-100">
              <span className="text-sm font-medium text-slate-600">Trạng thái:</span>
              {["all", "approved", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status === "all" ? "Tất cả" : EVENT_STATUS[status]?.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Events Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 text-lg">Không tìm thấy sự kiện nào phù hợp</p>
            </div>
          ) : (
            filteredEvents.map((event, idx) => {
              const alreadyJoined = registeredEventIds.includes(event.id);
              const isFull = event.registered >= event.slots;

              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-slate-200">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  {/* Status badge */}
                  <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${
                    event.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    event.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {EVENT_STATUS[event.status]?.label}
                  </div>
                </div>

                {/* Event Content */}
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div>
                    <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {event.category}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        {new Date(event.startDate || `${event.date}T${event.startTime}`).toLocaleDateString("vi-VN")}
                      </span>
                      <Clock className="h-4 w-4 text-slate-400 ml-2" />
                      <span>
                        {event.startDate && event.endDate
                          ? `${new Date(event.startDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(event.endDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                          : `${event.startTime} - ${event.endTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>
                        {(event.currentParticipants ?? event.registered)}/{(event.maxParticipants ?? event.slots)} người đã đăng ký
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    {/* Volunteer actions */}
                    {(!user || isVolunteer) && event.status === "approved" && (
                      <>
                        {alreadyJoined ? (
                          <button
                            onClick={() => handleCancelRegistration(event.id)}
                            className="flex-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            Hủy đăng ký
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(event.id)}
                            disabled={isFull}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                              isFull
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-indigo-500 text-white hover:bg-indigo-600"
                            }`}
                          >
                            {isFull ? "Đã hết chỗ" : "Đăng ký"}
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Xem chi tiết ${event.id}`)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </>
                    )}

                  

                    {/* Admin actions */}
                    {isAdmin && (
                      <>
                        {event.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(event.id)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(event.id)}
                              className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                              Từ chối
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => alert(`Xem chi tiết quản trị ${event.id}`)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Chi tiết
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

        {user && participationHistory.length > 0 && (
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-slate-900">
              <History className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold">Lịch sử tham gia của bạn</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {participationHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{entry.title}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
                    <span>{new Date(entry.date).toLocaleDateString("vi-VN")}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        entry.action === "registered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {entry.action === "registered" ? "Đã đăng ký" : "Đã hủy đăng ký"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Info banner for non-logged users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Đăng nhập để đăng ký sự kiện
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tạo tài khoản miễn phí để tham gia các hoạt động tình nguyện và kết nối với cộng đồng
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => openAuth?.("login")}
                className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => openAuth?.("register")}
                className="rounded-lg border border-indigo-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Đăng ký tài khoản
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
