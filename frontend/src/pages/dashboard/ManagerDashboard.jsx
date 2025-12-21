/** @format */

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDeepLink } from "../../hooks/useDeepLink";
import RegistrationManagementTable from "../../components/registrations/RegistrationManagementTable";
import {
  Calendar,
  Users,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Briefcase,
  UserCog,
} from "lucide-react";

// Redux Actions
import {
  fetchManagementEvents,
  fetchEventRegistrations,
  requestCancelEvent,
  deleteEvent,
  createEvent,
  updateEvent,
} from "../../features/eventSlice";
import {
  fetchAllRegistrations,
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";
import {
  fetchAllUsers,
  updateUserStatus,
  deleteUser,
} from "../../features/userSlice";

// Components
import EventsForm from "../../components/events/EventsForm";
import VolunteerApprovalModal from "../../components/approvals/VolunteerApprovalModal";
import EventDetailModal from "../../components/events/EventDetailModal";
import UserDetailModal from "../../components/users/UserDetailModal";
import EventManagementTable from "../../components/events/EventManagementTable";
import UserManagementTable from "../../components/users/UserManagementTable";
import PieStat from "../../components/users/PieStat";

// Common
import { ToastContainer } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import PromptModal from "../../components/common/PromptModal";

export default function ManagerDashboard({ user }) {
  const dispatch = useDispatch();

  // Redux state
  const { list: allEvents = [], registrations: currentRegistrations = [] } =
    useSelector((state) => state.event);
  const { user: authUser, users: allUsers = [] } = useSelector(
    (state) => state.user
  );
  const { pendingRegistrations: allRegistrations = [] } = useSelector(
    (state) => state.registration || {}
  );

  const activeUser = user || authUser;
  const displayName =
    activeUser?.personalInformation?.name ||
    activeUser?.userName ||
    "Người quản lý";

  // Local state
  const [activeTab, setActiveTab] = useState("overview");
  const [toasts, setToasts] = useState([]);

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [promptModal, setPromptModal] = useState({ isOpen: false });

  // Helpers
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Fetch Data
  useEffect(() => {
    dispatch(fetchManagementEvents());
    dispatch(fetchAllRegistrations());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Logic lọc dữ liệu (Giữ nguyên)
  const myEvents = useMemo(() => {
    if (!allEvents.length || !activeUser?._id) return [];
    return allEvents.filter((event) => {
      const createdById = event.createdBy?._id || event.createdBy;
      return createdById === activeUser._id;
    });
  }, [allEvents, activeUser]);

  const myManagerRegistrations = useMemo(() => {
    if (!myEvents.length || !allRegistrations.length) return [];
    const myEventIds = myEvents.map((e) => e._id);
    return allRegistrations.filter((reg) => {
      const eventId = reg.eventId?._id || reg.eventId || reg.event;
      return myEventIds.includes(eventId);
    });
  }, [myEvents, allRegistrations]);

  const pendingRegCount = myManagerRegistrations.filter((r) =>
    ["pending", "waitlisted"].includes(r.status)
  ).length;

  const stats = useMemo(() => {
    const approved = myEvents.filter((e) => e.status === "approved").length;
    const pending = myEvents.filter((e) => e.status === "pending").length;
    const rejected = myEvents.filter((e) => e.status === "rejected").length;
    const cancelled = myEvents.filter((e) => e.status === "cancelled").length;
    const cancelPending = myEvents.filter(
      (e) => e.status === "cancel_pending"
    ).length;
    const totalParticipants = myEvents.reduce(
      (sum, e) => sum + (e.registeredCount || 0),
      0
    );
    return {
      approved,
      pending,
      rejected,
      cancelled,
      cancelPending,
      totalParticipants,
    };
  }, [myEvents]);

  const pieData = [
    { name: "Đang chạy", value: stats.approved, color: "#10b981" },
    { name: "Chờ duyệt", value: stats.pending, color: "#f59e0b" },
    { name: "Từ chối", value: stats.rejected, color: "#ef4444" },
    { name: "Đã hủy", value: stats.cancelled, color: "#6b7280" },
    { name: "Chờ hủy", value: stats.cancelPending, color: "#f97316" },
  ].filter((d) => d.value > 0);

  const { highlightId, clearParams } = useDeepLink({
    setActiveTab,
    setSelectedEvent,
    dataList: myEvents,
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    clearParams(tabId);
  };

  const handleApproveRegistration = async (regId) => {
    const id = regId._id || regId;
    try {
      await dispatch(acceptRegistration(id)).unwrap();
      addToast("Đã duyệt đăng ký", "success");
      setSelectedRegistration(null);
      dispatch(fetchAllRegistrations());
      if (selectedEvent) dispatch(fetchEventRegistrations(selectedEvent._id));
    } catch {
      addToast("Lỗi khi chấp nhận", "error");
    }
  };

  const handleRejectRegistration = async (regId) => {
    const id = regId._id || regId;
    try {
      await dispatch(
        rejectRegistration({ registrationId: id, reason: "Manager rejected" })
      ).unwrap();
      addToast("Đã từ chối đăng ký", "info");
      setSelectedRegistration(null);
      dispatch(fetchAllRegistrations());
      if (selectedEvent) dispatch(fetchEventRegistrations(selectedEvent._id));
    } catch {
      addToast("Lỗi khi từ chối", "error");
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    if (event.status === "cancelled") {
      addToast("Không thể chỉnh sửa sự kiện đã hủy", "error");
      return;
    }
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    dispatch(fetchEventRegistrations(event._id));
  };

  const handleDeleteEvent = (event) => {
    if (event.status === "approved") {
      addToast("Không thể xóa sự kiện đang chạy. Hãy yêu cầu hủy.", "error");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Xóa sự kiện",
      message: `Bạn có chắc muốn xóa sự kiện "${event.title}"?`,
      type: "danger",
      confirmText: "Xóa ngay",
      onConfirm: async () => {
        try {
          await dispatch(deleteEvent(event._id)).unwrap();
          addToast("Đã xóa sự kiện", "success");
          dispatch(fetchManagementEvents());
        } catch (error) {
          addToast("Lỗi xóa: " + error, "error");
        }
      },
    });
  };

  const handleRequestCancel = (event) => {
    setPromptModal({
      isOpen: true,
      title: "Yêu cầu hủy sự kiện",
      message: (
        <div>
          <p>
            Bạn đang gửi yêu cầu hủy sự kiện <strong>{event.title}</strong> lên
            Admin.
          </p>
          <p className='text-sm text-gray-500 mt-2'>Vui lòng nhập lý do hủy:</p>
        </div>
      ),
      confirmText: "Gửi yêu cầu",
      onConfirm: async (reason) => {
        try {
          await dispatch(
            requestCancelEvent({ eventId: event._id, reason })
          ).unwrap();
          addToast("Đã gửi yêu cầu hủy thành công.", "success");
          dispatch(fetchManagementEvents());
        } catch (error) {
          addToast("Gửi yêu cầu thất bại: " + error, "error");
        }
      },
    });
  };

  const handleToggleUserStatus = (user) => {
    if (user.role === "admin" || user.role === "manager") {
      addToast("Bạn không có quyền khóa tài khoản quản trị khác.", "error");
      return;
    }
    const newStatus = user.status === "active" ? "inactive" : "active";
    setConfirmModal({
      isOpen: true,
      title: newStatus === "inactive" ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: `Xác nhận ${
        newStatus === "inactive" ? "khóa" : "mở khóa"
      } tài khoản "${user.userName}"?`,
      type: newStatus === "inactive" ? "warning" : "success",
      confirmText: newStatus === "inactive" ? "Khóa" : "Mở khóa",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserStatus({ userId: user._id, status: newStatus })
          ).unwrap();
          addToast("Cập nhật trạng thái thành công", "success");
          dispatch(fetchAllUsers());
        } catch (err) {
          addToast("Lỗi: " + err, "error");
        }
      },
    });
  };

  const handleDeleteUser = (user) => {
    if (user.role === "admin" || user.role === "manager") {
      addToast("Bạn không có quyền xóa tài khoản quản trị khác.", "error");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Xóa tài khoản",
      message: (
        <div>
          <p>
            Bạn chắc chắn muốn <strong>xóa vĩnh viễn</strong> tài khoản này?
          </p>
          <p className='font-medium mt-2'>"{user.userName}"</p>
        </div>
      ),
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        try {
          await dispatch(deleteUser(user._id)).unwrap();
          addToast("Đã xóa người dùng", "success");
          dispatch(fetchAllUsers());
        } catch (err) {
          addToast("Lỗi xóa: " + err, "error");
        }
      },
    });
  };

  const handleViewUser = (userOrId) =>
    setViewingUserId(userOrId?._id || userOrId);

  return (
    <div className='min-h-screen bg-gray-50/50 p-6 font-sans'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* WELCOME SECTION (Thay cho Header cũ) */}
        <div className='flex flex-col gap-1 mb-2'>
          <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
            Manager Dashboard
          </h1>
          <p className='text-gray-500'>
            Xin chào,{" "}
            <span className='font-semibold text-primary-600'>
              {displayName}
            </span>
          </p>
        </div>

        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]'>
          {/* TABS NAVIGATION */}
          <div className='border-b border-gray-200 px-6 pt-4'>
            <div className='flex gap-8 overflow-x-auto no-scrollbar'>
              <button
                onClick={() => handleTabChange("overview")}
                className={`pb-4 text-sm font-bold relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <BarChart3 className='w-4 h-4' /> Tổng quan
                {activeTab === "overview" && (
                  <div className='absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full' />
                )}
              </button>

              <button
                onClick={() => handleTabChange("events")}
                className={`pb-4 text-sm font-bold relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "events"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <Briefcase className='w-4 h-4' /> Sự kiện của bạn
                <span className='ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'>
                  {myEvents.length}
                </span>
                {activeTab === "events" && (
                  <div className='absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full' />
                )}
              </button>

              <button
                onClick={() => handleTabChange("registrations")}
                className={`pb-4 text-sm font-bold relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "registrations"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <Users className='w-4 h-4' /> Duyệt đăng ký
                {pendingRegCount > 0 && (
                  <span className='ml-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold'>
                    {pendingRegCount}
                  </span>
                )}
                {activeTab === "registrations" && (
                  <div className='absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full' />
                )}
              </button>
            </div>
          </div>

          <div className='flex-1 p-6 flex flex-col'>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300'>
                <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                        Đang chạy
                      </p>
                      <h3 className='text-2xl font-black text-emerald-600 mt-1'>
                        {stats.approved}
                      </h3>
                    </div>
                    <div className='p-3 bg-emerald-50 text-emerald-600 rounded-xl'>
                      <CheckCircle className='w-6 h-6' />
                    </div>
                  </div>
                  <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                        Chờ duyệt
                      </p>
                      <h3 className='text-2xl font-black text-amber-500 mt-1'>
                        {stats.pending}
                      </h3>
                    </div>
                    <div className='p-3 bg-amber-50 text-amber-600 rounded-xl'>
                      <Clock className='w-6 h-6' />
                    </div>
                  </div>
                  <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                        Tổng TNV
                      </p>
                      <h3 className='text-2xl font-black text-blue-600 mt-1'>
                        {stats.totalParticipants}
                      </h3>
                    </div>
                    <div className='p-3 bg-blue-50 text-blue-600 rounded-xl'>
                      <Users className='w-6 h-6' />
                    </div>
                  </div>
                  <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
                        Đã hủy / Chờ hủy
                      </p>
                      <h3 className='text-2xl font-black text-red-500 mt-1'>
                        {stats.rejected + stats.cancelled + stats.cancelPending}
                      </h3>
                    </div>
                    <div className='p-3 bg-red-50 text-red-600 rounded-xl'>
                      <XCircle className='w-6 h-6' />
                    </div>
                  </div>
                </div>
                <div className='lg:col-span-1'>
                  {myEvents.length > 0 ? (
                    <PieStat
                      title='Trạng thái sự kiện'
                      data={pieData}
                      height={280}
                    />
                  ) : (
                    <div className='bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl h-full flex items-center justify-center text-gray-400'>
                      Chưa có dữ liệu
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EVENTS LIST */}
            {activeTab === "events" && (
              <div className='space-y-4 animate-in fade-in duration-300'>
                <div className='flex justify-between items-center px-1'>
                  <h3 className='font-bold text-gray-800 text-lg'>
                    Sự kiện của bạn
                  </h3>
                  <button
                    onClick={handleCreateEvent}
                    className='flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-md font-bold text-sm'>
                    <Plus className='w-4 h-4' /> Tạo sự kiện mới
                  </button>
                </div>
                <EventManagementTable
                  events={myEvents}
                  registrations={allRegistrations}
                  cancelRequests={[]}
                  onViewEvent={handleViewEvent}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onCancelEvent={handleRequestCancel}
                  highlightedId={highlightId}
                />
              </div>
            )}

            {activeTab === "registrations" && (
              <RegistrationManagementTable
                registrations={myManagerRegistrations}
                users={allUsers}
                events={myEvents}
                onApprove={handleApproveRegistration}
                onReject={handleRejectRegistration}
                highlightedId={highlightId}
              />
            )}
            {activeTab === "users_management" && (
              <UserManagementTable
                users={allUsers}
                onViewUser={handleViewUser}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showEventForm && (
        <EventsForm
          eventToEdit={editingEvent}
          onSave={async (finalData) => {
            // ✅ Nhận dữ liệu finalData từ form gửi về
            try {
              if (editingEvent) {
                // TRƯỜNG HỢP: Cập nhật sự kiện đã có
                await dispatch(
                  updateEvent({
                    eventId: editingEvent._id,
                    eventData: finalData,
                  })
                ).unwrap();
                addToast("Đã cập nhật sự kiện thành công", "success");
              } else {
                // TRƯỜNG HỢP: Tạo sự kiện mới
                await dispatch(createEvent(finalData)).unwrap();
                addToast(
                  "Tạo sự kiện mới thành công! Đang chờ Admin duyệt.",
                  "success"
                );
              }

              // ✅ SAU KHI LƯU THÀNH CÔNG:
              dispatch(fetchManagementEvents()); // Tải lại danh sách để hiển thị sự kiện mới
              setShowEventForm(false); // Đóng form
              setEditingEvent(null); // Reset trạng thái sửa
            } catch (error) {
              // Nếu có lỗi từ server (ví dụ: trùng tên, lỗi mạng)
              addToast(error || "Lỗi khi lưu sự kiện", "error");
            }
          }}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          registrations={currentRegistrations}
          onClose={() => {
            setSelectedEvent(null);
            clearParams(activeTab);
          }}
          onEdit={() => {
            const e = selectedEvent;
            setSelectedEvent(null);
            handleEditEvent(e);
          }}
          onUserClick={handleViewUser}
          onApproveRegistration={handleApproveRegistration}
          onRejectRegistration={handleRejectRegistration}
          showApprovalActions={false}
          showRegistrationsList={true}
        />
      )}

      {viewingUserId && (
        <UserDetailModal
          viewingUser={{ _id: viewingUserId }}
          onClose={() => setViewingUserId(null)}
          addToast={addToast}
          setConfirmModal={setConfirmModal}
        />
      )}
      {selectedRegistration && (
        <VolunteerApprovalModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onApprove={() => handleApproveRegistration(selectedRegistration._id)}
          onReject={() => handleRejectRegistration(selectedRegistration._id)}
        />
      )}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
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
