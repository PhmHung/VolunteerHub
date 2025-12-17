/** @format */

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationBell from "../../components/common/NotificationBell";
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
} from "../../features/eventSlice";
import {
  fetchAllRegistrations,
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";
import {
  //fetchUserById,
  fetchAllUsers,
  updateUserStatus,
  deleteUser,
} from "../../features/userSlice";

// Components
import EventsForm from "../../components/events/EventsForm";
// Thêm vào phần imports của ManagerDashboard.jsx
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
  //const navigate = useNavigate();
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

  // --- 1. LỌC SỰ KIỆN CỦA MANAGER ---
  const myEvents = useMemo(() => {
    if (!allEvents.length || !activeUser?._id) return [];
    return allEvents.filter((event) => {
      const createdById = event.createdBy?._id || event.createdBy;
      return createdById === activeUser._id;
    });
  }, [allEvents, activeUser]);

  // --- THỐNG KÊ (STATS) ---
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

  // Hàm này sẽ được gọi khi bấm vào tên User trong danh sách
  // const handleReviewRegistration = (registration) => {
  //   setSelectedRegistration(registration);
  // };

  // Hàm duyệt thật sự (được gọi từ bên trong Modal)
  const handleApproveRegistration = async (regId) => {
    // Nhận regId hoặc object
    const id = regId._id || regId;
    try {
      await dispatch(acceptRegistration(id)).unwrap();
      addToast("Đã duyệt đăng ký", "success");
      setSelectedRegistration(null); // Đóng modal
      dispatch(fetchAllRegistrations());
      if (selectedEvent) dispatch(fetchEventRegistrations(selectedEvent._id));
    } catch {
      addToast("Lỗi khi chấp nhận", "error");
    }
  };

  // Hàm từ chối thật sự
  const handleRejectRegistration = async (regId) => {
    const id = regId._id || regId;
    // Có thể mở thêm PromptModal nhập lý do ở đây nếu muốn kỹ hơn
    try {
      await dispatch(
        rejectRegistration({ registrationId: id, reason: "Manager rejected" })
      ).unwrap();
      addToast("Đã từ chối đăng ký", "info");
      setSelectedRegistration(null); // Đóng modal
      dispatch(fetchAllRegistrations());
      if (selectedEvent) dispatch(fetchEventRegistrations(selectedEvent._id));
    } catch {
      addToast("Lỗi khi từ chối", "error");
    }
  };
  // --- HANDLERS ---
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    //avigate(`/events/${event._id}`);
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

  // --- USER HANDLERS ---
  const handleToggleUserStatus = (user) => {
    // Logic: Chỉ cho phép khóa Volunteer, không được khóa Admin/Manager khác
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
            Bạn chắc chắn muốn <strong>xóa vĩnh viễn</strong> tài khoản tham gia
            sự kiện của bạn?
          </p>
          <p className='font-medium mt-2'>"{user.userName}"</p>
          <p className='text-sm text-red-600 mt-2'>Không thể khôi phục.</p>
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

  const handleViewUser = (userOrId) => {
    const userId = userOrId?._id || userOrId;
    setViewingUserId(userId);
  };
  const handleEditEvent = (event) => {
    if (event.status === "cancelled") {
      addToast("Không thể chỉnh sửa sự kiện đã hủy", "error");
      return;
    }
    // Set dữ liệu sự kiện cần sửa vào state để form hiển thị lại
    setEditingEvent(event);
    // Mở Form
    setShowEventForm(true);
  };
  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
      {/* HEADER */}
      <div className='bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-30 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Manager Dashboard
          </h1>
          <p className='text-sm text-gray-500'>Xin chào, {displayName}</p>
        </div>
        <button
          onClick={handleCreateEvent}
          className='flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm font-medium'>
          <Plus className='w-5 h-5' /> Tạo sự kiện mới
        </button>
      </div>

      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* TABS NAVIGATION */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]'>
          <div className='border-b border-gray-200 px-6 pt-4'>
            <div className='flex gap-8 overflow-x-auto no-scrollbar'>
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-4 text-sm font-medium relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <BarChart3 className='w-4 h-4' />
                Tổng quan
                {activeTab === "overview" && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600' />
                )}
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`pb-4 text-sm font-medium relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "events"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <Briefcase className='w-4 h-4' />
                Quản lý sự kiện
                <span className='ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'>
                  {myEvents.length}
                </span>
                {activeTab === "events" && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600' />
                )}
              </button>

              {/* TAB QUẢN LÝ NGƯỜI DÙNG */}
              <button
                onClick={() => setActiveTab("users_management")}
                className={`pb-4 text-sm font-medium relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "users_management"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                <UserCog className='w-4 h-4' />
                Quản lý người dùng
                <span className='ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full'>
                  {allUsers.length}
                </span>
                {activeTab === "users_management" && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600' />
                )}
              </button>
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className='flex-1 p-6 bg-gray-50 overflow-hidden flex flex-col'>
            {/* OVERVIEW -cần sửa*/}
            {activeTab === "overview" && (
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300'>
                <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Sự kiện đang chạy
                      </p>
                      <h3 className='text-2xl font-bold text-emerald-600 mt-1'>
                        {stats.approved}
                      </h3>
                    </div>
                    <div className='p-3 bg-emerald-50 text-emerald-600 rounded-lg'>
                      <CheckCircle className='w-6 h-6' />
                    </div>
                  </div>
                  <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Chờ duyệt
                      </p>
                      <h3 className='text-2xl font-bold text-amber-500 mt-1'>
                        {stats.pending}
                      </h3>
                    </div>
                    <div className='p-3 bg-amber-50 text-amber-600 rounded-lg'>
                      <Clock className='w-6 h-6' />
                    </div>
                  </div>
                  <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Tổng tình nguyện viên
                      </p>
                      <h3 className='text-2xl font-bold text-blue-600 mt-1'>
                        {stats.totalParticipants}
                      </h3>
                    </div>
                    <div className='p-3 bg-blue-50 text-blue-600 rounded-lg'>
                      <Users className='w-6 h-6' />
                    </div>
                  </div>
                  <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-500 font-medium'>
                        Đã hủy / Chờ hủy
                      </p>
                      <div className='flex items-baseline gap-2 mt-1'>
                        {/* Tổng số bị hủy/từ chối */}
                        <h3 className='text-2xl font-bold text-red-500'>
                          {stats.rejected +
                            stats.cancelled +
                            stats.cancelPending}
                        </h3>
                        {/* Hiển thị rõ số lượng đang chờ */}
                        {stats.cancelPending > 0 && (
                          <span className='text-sm font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100'>
                            {stats.cancelPending} đang chờ hủy
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='p-3 bg-red-50 text-red-600 rounded-lg'>
                      <XCircle className='w-6 h-6' />
                    </div>
                  </div>
                </div>
                <div className='lg:col-span-1 h-full'>
                  {myEvents.length > 0 ? (
                    <PieStat
                      title='Trạng thái sự kiện'
                      data={pieData}
                      height={250}
                    />
                  ) : (
                    <div className='bg-white p-6 rounded-xl shadow-sm h-full flex items-center justify-center text-gray-400'>
                      Chưa có dữ liệu
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EVENTS LIST */}
            {activeTab === "events" && (
              <EventManagementTable
                events={myEvents}
                registrations={allRegistrations}
                cancelRequests={[]}
                onViewEvent={handleViewEvent}
                onDeleteEvent={handleDeleteEvent}
                onCancelEvent={handleRequestCancel}
              />
            )}

            {activeTab === "users_management" && (
              <UserManagementTable
                // SỬA DÒNG NÀY:
                // users={myVolunteers}
                users={allUsers}
                onViewUser={handleViewUser}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showEventForm && (
        <EventsForm
          eventToEdit={editingEvent}
          onSave={() => {
            dispatch(fetchManagementEvents());
            setShowEventForm(false);
            addToast(
              editingEvent ? "Đã cập nhật sự kiện" : "Đã tạo sự kiện mới",
              "success"
            );
          }}
          onClose={() => setShowEventForm(false)}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          registrations={currentRegistrations}
          users={[]}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setSelectedEvent(null); // Đóng modal xem chi tiết
            handleEditEvent(selectedEvent); // Mở form sửa
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
