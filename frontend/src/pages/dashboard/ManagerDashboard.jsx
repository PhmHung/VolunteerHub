/** @format */

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Users, Plus, Edit2 } from "lucide-react";

import {
  fetchEvents,
  fetchEventRegistrations,
} from "../../features/eventSlice";
import {
  fetchAllRegistrations,
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";
import { fetchUserById } from "../../features/userSlice";

import EventsForm from "../../components/events/EventsForm";
import EventDetailModal from "../../components/events/EventDetailModal";
import UserDetailModal from "../../components/users/UserDetailModal"; // Sửa import đúng
import EventTabs from "../../components/events/EventTabs";
import EventChannel from "../../components/events/EventChannel";

import { ToastContainer } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import PromptModal from "../../components/common/PromptModal";

export default function ManagerDashboard({ user }) {
  const dispatch = useDispatch();

  // Redux state
  const { list: reduxEvents = [], registrations: currentRegistrations = [] } =
    useSelector((state) => state.event);
  const { user: authUser } = useSelector((state) => state.auth);
  const { pendingRegistrations = [] } = useSelector(
    (state) => state.registration || {}
  );

  // Current user
  const activeUser = user || authUser;
  const displayName =
    activeUser?.personalInformation?.name ||
    activeUser?.userName ||
    "Người quản lý";

  // Local state
  const [toasts, setToasts] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("about");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);

  // Confirm & Prompt modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [promptModal, setPromptModal] = useState({ isOpen: false });

  // Toast helpers
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Fetch data
  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchAllRegistrations());
  }, [dispatch]);

  // Lấy danh sách sự kiện mà manager phụ trách (approved)
  const myManagedEvents = useMemo(() => {
    if (!reduxEvents.length || !activeUser?._id) return [];

    return reduxEvents
      .filter((event) => {
        const createdById = event.createdBy?._id || event.createdBy;
        const managerIds = Array.isArray(event.managers)
          ? event.managers.map((m) => m?._id || m)
          : [];
        return (
          (createdById === activeUser._id ||
            managerIds.includes(activeUser._id)) &&
          event.status === "approved"
        );
      })
      .map((event) => {
        const pendingCount = pendingRegistrations.filter(
          (r) =>
            (r.eventId?._id || r.eventId) === event._id &&
            ["pending", "waitlisted"].includes(r.status)
        ).length;

        return {
          ...event,
          pendingCount,
          participantsCount: event.currentParticipants || 0,
        };
      });
  }, [reduxEvents, activeUser, pendingRegistrations]);

  // Summary stats
  const summary = useMemo(() => {
    const totalEvents = myManagedEvents.length;
    const totalPending = myManagedEvents.reduce(
      (sum, e) => sum + e.pendingCount,
      0
    );
    const totalParticipants = myManagedEvents.reduce(
      (sum, e) => sum + e.participantsCount,
      0
    );

    return [
      { label: "Sự kiện đang quản lý", value: totalEvents, icon: Calendar },
      { label: "Đăng ký chờ duyệt", value: totalPending, icon: Users },
      {
        label: "Tình nguyện viên tham gia",
        value: totalParticipants,
        icon: Users,
      },
    ];
  }, [myManagedEvents]);

  // Handlers
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setActiveDetailTab("about");
    dispatch(fetchEventRegistrations(event._id));
  };

  const handleEditEvent = (event) => {
    if (event.status === "approved") {
      addToast("Không thể chỉnh sửa sự kiện đã được duyệt!", "warning");
      return;
    }
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleViewUser = (userId) => {
    if (userId && userId !== "unknown") {
      dispatch(fetchUserById(userId));
      setViewingUserId(userId);
    }
  };

  const handleApproveRegistration = (regId) => {
    setConfirmModal({
      isOpen: true,
      title: "Chấp nhận đăng ký",
      message: "Bạn có chắc muốn chấp nhận tình nguyện viên này?",
      type: "success",
      confirmText: "Chấp nhận",
      onConfirm: async () => {
        try {
          await dispatch(acceptRegistration(regId)).unwrap();
          addToast("Đã chấp nhận đăng ký", "success");
          dispatch(fetchAllRegistrations());
          if (selectedEvent)
            dispatch(fetchEventRegistrations(selectedEvent._id));
        } catch {
          addToast("Lỗi khi chấp nhận", "error");
        }
      },
    });
  };

  const handleRejectRegistration = (regId) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối đăng ký",
      message: "Nhập lý do từ chối:",
      confirmText: "Từ chối",
      onConfirm: async (reason) => {
        try {
          await dispatch(
            rejectRegistration({ registrationId: regId, reason })
          ).unwrap();
          addToast("Đã từ chối đăng ký", "info");
          dispatch(fetchAllRegistrations());
          if (selectedEvent)
            dispatch(fetchEventRegistrations(selectedEvent._id));
        } catch {
          addToast("Lỗi khi từ chối", "error");
        }
      },
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'>
        {/* Header */}
        <header className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Xin chào, {displayName}
          </h1>
          <p className='text-gray-600 mt-1'>
            Quản lý sự kiện tình nguyện, xử lý đăng ký và tương tác với tình
            nguyện viên.
          </p>
        </header>

        {/* Stats */}
        <section className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8'>
          {summary.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>{label}</p>
                  <p className='text-3xl font-bold text-gray-900 mt-2'>
                    {value}
                  </p>
                </div>
                {Icon && <Icon className='w-8 h-8 text-primary-600' />}
              </div>
            </div>
          ))}
        </section>

        {/* Main Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Sidebar - Danh sách sự kiện */}
          <aside className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold'>Sự kiện được giao</h2>
                <button
                  onClick={handleCreateEvent}
                  className='flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition'>
                  <Plus className='w-4 h-4' /> Tạo mới
                </button>
              </div>

              <div className='space-y-4 max-h-[70vh] overflow-y-auto'>
                {myManagedEvents.length === 0 ? (
                  <p className='text-center text-gray-500 py-8'>
                    Bạn chưa được giao sự kiện nào.
                  </p>
                ) : (
                  myManagedEvents.map((event) => (
                    <div
                      key={event._id}
                      onClick={() => handleViewEvent(event)}
                      className='cursor-pointer rounded-xl border border-gray-200 p-4 hover:shadow-md transition bg-white'>
                      <div className='flex gap-4'>
                        <div className='w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0'>
                          {event.image ? (
                            <img
                              src={event.image}
                              alt={event.title}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <Calendar className='w-8 h-8 text-gray-400' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-gray-900 truncate'>
                            {event.title}
                          </h3>
                          <p className='text-sm text-gray-500 mt-1'>
                            {new Date(event.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                          <p className='text-sm text-gray-500 truncate'>
                            {event.location}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center justify-between mt-4 pt-3 border-t'>
                        <div className='flex items-center gap-2 text-sm'>
                          <Users className='w-4 h-4 text-gray-500' />
                          <span>
                            {event.pendingCount > 0 ? (
                              <span className='text-amber-600 font-bold'>
                                {event.pendingCount} chờ duyệt
                              </span>
                            ) : (
                              `${event.participantsCount} tham gia`
                            )}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                          className='text-primary-600 hover:text-primary-700'>
                          <Edit2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Main Content - Chi tiết sự kiện */}
          <section className='lg:col-span-2'>
            {selectedEvent ? (
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                <EventTabs
                  activeTab={activeDetailTab}
                  setActiveTab={setActiveDetailTab}
                />

                <div className='p-6'>
                  {activeDetailTab === "about" && (
                    <EventDetailModal
                      event={selectedEvent}
                      registrations={currentRegistrations}
                      users={[]} // Không cần nếu backend đã populate
                      onClose={() => setSelectedEvent(null)}
                      onUserClick={handleViewUser}
                      onApproveRegistration={handleApproveRegistration}
                      onRejectRegistration={handleRejectRegistration}
                      showApprovalActions={true}
                      showRegistrationsList={true}
                    />
                  )}

                  {activeDetailTab === "members" && (
                    <EventDetailModal
                      event={selectedEvent}
                      registrations={currentRegistrations}
                      onClose={() => setSelectedEvent(null)}
                      onUserClick={handleViewUser}
                      activeTab='members'
                      onApproveRegistration={handleApproveRegistration}
                      onRejectRegistration={handleRejectRegistration}
                    />
                  )}

                  {activeDetailTab === "discussion" && (
                    <EventChannel
                      eventId={selectedEvent._id}
                      user={activeUser}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center'>
                <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500 text-lg'>
                  Chọn một sự kiện để xem chi tiết
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      {showEventForm && (
        <EventsForm
          eventToEdit={editingEvent}
          onSave={() => {
            dispatch(fetchEvents());
            setShowEventForm(false);
            addToast(
              editingEvent ? "Cập nhật thành công!" : "Tạo sự kiện thành công!",
              "success"
            );
          }}
          onClose={() => setShowEventForm(false)}
        />
      )}

      {viewingUserId && (
        <UserDetailModal
          viewingUser={{ _id: viewingUserId }} // Component sẽ tự fetch nếu cần
          onClose={() => setViewingUserId(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={() => setPromptModal({ isOpen: false })}
        onConfirm={promptModal.onConfirm}
        title={promptModal.title}
        message={promptModal.message}
        confirmText={promptModal.confirmText}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
