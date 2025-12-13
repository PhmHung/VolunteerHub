/** @format */

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, MapPin, Users } from "lucide-react";
//import EventForm from "../components/events/EventForm.jsx";
import { EventDetail } from "../../components/events/EventComponents.jsx";
import { FaEye } from "react-icons/fa";
import { fetchUserById } from "../../features/userSlice.js";
import UserDetailModal from "../../components/events/EventDetailModal.jsx";
import { REGISTRATION_STATUS, ATTENDANCE_STATUS } from "../../types";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  fetchEventRegistrations,
} from "../../features/eventSlice";
import {
  fetchPendingRegistrations,
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";
import { ToastContainer } from "../../components/common/Toast";

// Helper map status
const mapStatusToRequestStatus = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "registered") return REGISTRATION_STATUS.REGISTERED;
  if (s === "cancelled") return REGISTRATION_STATUS.CANCELLED;
  return REGISTRATION_STATUS.WAITLISTED;
};

export default function ManagerDashboard({ user }) {
  // 1. HOOKS & STATE (Khai báo đầu tiên)
  const dispatch = useDispatch();

  // Selectors
  const {
    list: reduxEvents = [],
    registrations: currentEventRegistrations = [],
  } = useSelector((state) => state.event);
  const { user: authUser } = useSelector((state) => state.auth);
  const registrationState = useSelector((state) => state.registration || {});

  // User Info
  const activeUser = user || authUser;
  const displayName =
    activeUser?.personalInformation?.name ||
    activeUser?.userName ||
    "Người quản lý";

  // Global Pending Data
  const pendingRegistrations = Array.isArray(
    registrationState.pendingRegistrations
  )
    ? registrationState.pendingRegistrations
    : [];

  // Local State
  const [toasts, setToasts] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 2. USE EFFECTS (Fetch Data)
  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchPendingRegistrations());
  }, [dispatch]);
  const handleViewDetail = (userId) => {
    if (userId && userId !== "unknown") {
      dispatch(fetchUserById(userId)); // Gọi API lấy chi tiết
      setIsModalOpen(true); // Mở Modal
    }
  };
  // Helper Toast
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // 3. LOGIC SIDEBAR (myManagedEvents)
  const myManagedEvents = useMemo(() => {
    if (!reduxEvents.length || !activeUser?._id) return [];

    return reduxEvents
      .filter((event) => {
        const createdById = event.createdBy?._id || event.createdBy;
        const managerIds = Array.isArray(event.managers)
          ? event.managers.map((m) => m?._id || m)
          : [];
        const isManager =
          createdById === activeUser._id || managerIds.includes(activeUser._id);
        const isApproved = event.status === "approved";
        return isManager && isApproved;
      })
      .map((event) => {
        // Đếm số chờ duyệt global
        const pendingCount = pendingRegistrations.filter(
          (r) =>
            (r.eventId?._id || r.eventId) === event._id &&
            (r.status === "waitlisted" || r.status === "pending")
        ).length;

        return {
          ...event,
          id: event._id,
          totalRequests: pendingCount,
          // Lấy số liệu gốc từ backend để hiển thị trên sidebar
          attendeesCount: event.currentParticipants || 0,
          maxParticipants: event.maxParticipants || 0,
        };
      });
  }, [reduxEvents, activeUser, pendingRegistrations]);

  // 4. AUTO-SELECT EVENT (Fix lỗi: Tự động gọi API khi vào trang)
  useEffect(() => {
    // Nếu có danh sách sự kiện mà chưa chọn cái nào -> Chọn cái đầu tiên
    if (myManagedEvents.length > 0 && !selectedEventId) {
      const firstId = myManagedEvents[0].id;
      setSelectedEventId(firstId);

      // --- DÒNG QUAN TRỌNG MỚI THÊM ---
      // Gọi ngay API lấy danh sách người tham gia cho sự kiện đầu tiên
      dispatch(fetchEventRegistrations(firstId));
      // -------------------------------
    }
  }, [myManagedEvents, selectedEventId, dispatch]);
  // 5. LOGIC CHI TIẾT (Sửa lại phần map user)
  const selectedEventData = useMemo(() => {
    const eventRaw = myManagedEvents.find((e) => e.id === selectedEventId);
    if (!eventRaw) return null;

    // Map danh sách chi tiết
    const attendees = currentEventRegistrations.map((reg) => {
      // 1. Lấy object userId (được populate từ controller)
      const user = reg.userId || {};

      return {
        id: user._id || "unknown",
        regId: reg._id,

        // 2. QUAN TRỌNG: Ánh xạ đúng trường từ Backend
        // Backend trả về: userName, userEmail, profilePicture
        name: user.userName || user.name || "Người dùng ẩn danh",
        email: user.userEmail || user.email || "Chưa có email",
        avatarUrl: user.profilePicture || "",
        phoneNumber: user.phoneNumber || "",

        // 3. Map status
        requestStatus: mapStatusToRequestStatus(reg.status),
        completionStatus: reg.completionStatus || ATTENDANCE_STATUS.IN_PROGRESS,
        registeredAt: reg.createdAt,
      };
    });

    const realApprovedCount = attendees.filter(
      (a) => a.requestStatus === REGISTRATION_STATUS.REGISTERED
    ).length;

    return {
      ...eventRaw,
      attendees: attendees,
      attendeesCount:
        attendees.length > 0 ? realApprovedCount : eventRaw.attendeesCount || 0,
    };
  }, [selectedEventId, myManagedEvents, currentEventRegistrations]);

  // 6. LOGIC SUMMARY
  const summary = useMemo(() => {
    const totalEvents = myManagedEvents.length;
    const pendingRequests = myManagedEvents.reduce(
      (sum, e) => sum + (e.totalRequests || 0),
      0
    );
    const totalVolunteers = myManagedEvents.reduce(
      (sum, e) => sum + (e.attendeesCount || 0),
      0
    );

    return [
      { label: "Sự kiện phụ trách", value: totalEvents },
      { label: "Đăng ký chờ duyệt", value: pendingRequests, icon: Users },
      { label: "TN viên chính thức", value: totalVolunteers, icon: Users },
    ];
  }, [myManagedEvents]);

  // 7. HANDLERS
  const handleSelectEvent = (id) => {
    setSelectedEventId(id);
    dispatch(fetchEventRegistrations(id)); // Gọi API khi click
  };

  const handleAttendeeRequestChange = async (
    eventId,
    attendeeId,
    newStatus
  ) => {
    const attendee = selectedEventData?.attendees?.find(
      (a) => a.id === attendeeId
    );
    if (attendee?.regId) {
      try {
        if (newStatus === REGISTRATION_STATUS.REGISTERED) {
          await dispatch(acceptRegistration(attendee.regId)).unwrap();
          addToast("Đã chấp nhận", "success");
        } else if (newStatus === REGISTRATION_STATUS.CANCELLED) {
          await dispatch(
            rejectRegistration({
              registrationId: attendee.regId,
              reason: "Từ chối",
            })
          ).unwrap();
          addToast("Đã từ chối", "success");
        }
        // Refresh data toàn bộ để đồng bộ số liệu
        dispatch(fetchEvents());
        dispatch(fetchPendingRegistrations());
        dispatch(fetchEventRegistrations(eventId));
      } catch (error) {
        addToast(`Lỗi: ${error}`, "error");
      }
    }
  };

  // ... (Giữ nguyên handleEdit, handleSave, handleOpenCreate)
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };
  const handleEdit = (evt) => {
    const normalized = { ...evt };
    if (!normalized.startDate && normalized.date)
      normalized.startDate = normalized.date;
    if (!normalized.endDate && normalized.date)
      normalized.endDate = normalized.date;
    setEditingEvent(normalized);
    setShowForm(true);
  };
  const handleSave = async (data) => {
    if (editingEvent && editingEvent.status === "approved") {
      addToast("Không thể chỉnh sửa sự kiện đã được duyệt!", "warning");
      return;
    }
    try {
      if (editingEvent) {
        //const eventId = editingEvent.id || editingEvent._id;
        await dispatch(
          updateEvent({ eventId: editingEvent._id, eventData: data })
        ).unwrap();
        addToast("Cập nhật thành công");
      } else {
        await dispatch(createEvent(data)).unwrap();
        addToast("Tạo mới thành công");
      }
      dispatch(fetchEvents()); // Reload list sau khi save
      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Lỗi API Save:", error);
      addToast(`Lỗi: ${error}`, "error");
    }
  };

  return (
    <div className='min-h-screen bg-surface-muted'>
      <div className='w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'>
        <header className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='heading-1'>Xin chào, {displayName}</h1>
            <p className='text-body mt-1'>
              Quản lý lịch trình sự kiện, phân công đội và xử lý đăng ký.
            </p>
          </div>
        </header>

        <section className='grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6'>
          {summary.map(({ label, value, icon: Icon }) => (
            <div key={label} className='card p-5'>
              <div className='flex justify-between items-center'>
                <p className='text-sm font-medium text-text-muted'>{label}</p>
                {Icon && <Icon className='h-4 w-4 text-gray-400' />}
              </div>
              <p className='mt-3 text-2xl font-semibold text-text-main'>
                {value}
              </p>
            </div>
          ))}
        </section>

        <main className='flex flex-col md:flex-row gap-6'>
          <aside className='w-full md:w-1/3'>
            <div className='card p-6 sticky top-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-text-main'>
                  Sự kiện được giao
                </h2>
                <button
                  onClick={handleOpenCreate}
                  className='rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-100'>
                  + Tạo
                </button>
              </div>
              <div className='space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2'>
                {myManagedEvents.map((e) => {
                  const isSelected = selectedEventId === e.id;
                  return (
                    <article
                      key={e.id}
                      onClick={() => handleSelectEvent(e.id)}
                      className={`cursor-pointer transition-all rounded-lg border p-3 ${
                        isSelected
                          ? "ring-2 ring-primary-500 bg-primary-50/30 border-primary-300 shadow-md"
                          : "bg-white border-gray-200 hover:shadow-sm"
                      }`}>
                      <div className='flex gap-3 mb-2'>
                        <div className='h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden border border-gray-200'>
                          {e.image ? (
                            <img
                              src={e.image}
                              alt=''
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <Calendar className='h-8 w-8 opacity-50' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-sm font-semibold text-text-main line-clamp-2'>
                            {e.title}
                          </h3>
                          <p className='text-xs text-text-secondary mt-1'>
                            {new Date(e.startDate).toLocaleDateString("vi-VN")}
                          </p>
                          <p className='text-xs text-text-secondary truncate'>
                            {e.location}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between mt-2 pt-2 border-t border-gray-100'>
                        <div className='flex items-center gap-1.5 text-xs text-text-secondary'>
                          <Users className='h-3 w-3' />
                          {e.totalRequests > 0 ? (
                            <span className='text-yellow-600 font-bold'>
                              {e.totalRequests} chờ duyệt
                            </span>
                          ) : (
                            <span>{e.attendeesCount} tham gia</span>
                          )}
                        </div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleEdit(e);
                          }}
                          className='text-xs text-blue-600 hover:underline'>
                          Sửa
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className='w-full md:w-2/3 card'>
            {selectedEventData ? (
              <EventDetails
                event={selectedEventData}
                user={user}
                onAttendeeRequestChange={handleAttendeeRequestChange}
                onViewDetail={handleViewDetail}
              />
            ) : (
              <div className='flex flex-col items-center justify-center h-96 text-text-muted'>
                <p>Chọn một sự kiện để xem chi tiết</p>
              </div>
            )}
          </section>
        </main>
      </div>
      {showForm && (
        <EventFormModal
          eventToEdit={editingEvent}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
