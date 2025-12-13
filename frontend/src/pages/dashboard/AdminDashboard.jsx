/** @format */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Icons
import {
  Calendar,
  CheckSquare,
  Users,
  Briefcase,
  Bell,
  Download,
  FileJson,
  FileSpreadsheet,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Redux Actions
import {
  fetchManagementEvents,
  approveEvent,
  clearEventMessages,
  deleteEvent,
} from "../../features/eventSlice";
import {
  fetchAllUsers,
  updateUserRole,
  clearMessages,
  deleteUser,
  updateUserStatus,
} from "../../features/userSlice";
import {
  clearRegistrationMessages,
  fetchPendingRegistrations,
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";

// Utils & Components
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import EventApprovalModal from "../../components/events/EventApprovalModal";
import VolunteerApprovalModal from "../../components/approvals/VolunteerApprovalModal";
import ManagerApprovalModal from "../../components/approvals/ManagerApprovalModal";
import UserDetailModal from "../../components/users/UserDetailModal";
import EventDetailModal from "../../components/events/EventDetailModal";
import { ToastContainer } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import PromptModal from "../../components/common/PromptModal";

// Sub-components (Tabs)
import UserManagementTable from "../../components/users/UserManagementTable";
import AdminEventsTab from "../../components/events/EventManagementTable";

const StatCard = ({ title, value, change, icon, color }) => {
  const Icon = icon;
  return (
    <div className='card p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-start mb-4'>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className='w-6 h-6 text-white' />
        </div>
        <span
          className={`flex items-center text-sm font-medium ${
            change >= 0 ? "text-emerald-600" : "text-red-600"
          }`}>
          {change > 0 && "+"}
          {change}%
          <ArrowUpRight className='w-4 h-4 ml-1' />
        </span>
      </div>
      <h3 className='text-gray-500 text-sm font-medium mb-1'>{title}</h3>
      <p className='text-3xl font-bold text-gray-900'>{value}</p>
    </div>
  );
};

const AdminDashboard = ({ user }) => {
  const dispatch = useDispatch();

  // --- Redux State ---
  const {
    list: allEvents,
    successMessage: eventSuccessMessage,
    error: eventError,
  } = useSelector((state) => state.event);

  const {
    users: allUsers,
    message: userMessage,
    error: userError,
  } = useSelector((state) => state.user);

  const {
    pendingRegistrations,
    successMessage: regSuccessMessage,
    error: regError,
  } = useSelector((state) => state.registration);

  // --- Local State ---
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingManagerRequests, setPendingManagerRequests] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modal Selections
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedManagerRequest, setSelectedManagerRequest] = useState(null);

  // Detail Views
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingEventDetail, setViewingEventDetail] = useState(null);

  const [toasts, setToasts] = useState([]);

  // Confirmation/Prompt Modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "question",
  });
  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // --- Helpers ---
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // --- Effects ---
  useEffect(() => {
    dispatch(fetchManagementEvents({ status: "", limit: 1000 }));
    dispatch(fetchAllUsers());
    dispatch(fetchPendingRegistrations());
  }, [dispatch]);

  useEffect(() => {
    setPendingEvents(allEvents.filter((e) => e.status === "pending"));
    setPendingManagerRequests(
      allUsers.filter((u) => u.pendingManagerRequest === true)
    );
  }, [allEvents, allUsers]);

  // Handle messages
  useEffect(() => {
    if (eventSuccessMessage) {
      addToast(eventSuccessMessage, "success");
      dispatch(clearEventMessages());
    }
    if (eventError) {
      addToast(eventError, "error");
      dispatch(clearEventMessages());
    }
    if (userMessage) {
      addToast(userMessage, "success");
      dispatch(clearMessages());
    }
    if (userError) {
      addToast(userError, "error");
      dispatch(clearMessages());
    }
    if (regSuccessMessage) {
      addToast(regSuccessMessage, "success");
      dispatch(clearRegistrationMessages());
    }
    if (regError) {
      addToast(regError, "error");
      dispatch(clearRegistrationMessages());
    }
  }, [
    eventSuccessMessage,
    eventError,
    userMessage,
    userError,
    regSuccessMessage,
    regError,
    dispatch,
  ]);

  // --- Handlers ---
  const handleExport = (type, format) => {
    const timestamp = new Date().toISOString().split("T")[0];
    let data = [];
    let filename = "";
    if (type === "events") {
      data = allEvents;
      filename = `events_export_${timestamp}`;
    } else if (type === "volunteers") {
      data = allUsers.filter((u) => u.role === "volunteer");
      filename = `volunteers_export_${timestamp}`;
    }
    if (format === "csv") {
      exportToCSV(data, filename);
    } else {
      exportToJSON(data, filename);
    }
    setShowExportMenu(false);
  };

  // View Details
  const handleViewUser = (user) => {
    setViewingUser(user);
    setViewingEventDetail(null);
  };

  const handleViewEvent = (event) => {
    console.log("Handling view event in Dashboard:", event);
    setViewingEventDetail(event);
  };

  // --- Logic: Event Actions ---
  const handleApproveEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: "Duyệt sự kiện",
      message: `Bạn có chắc chắn muốn duyệt sự kiện "${event.title}" không?`,
      type: "success",
      confirmText: "Duyệt ngay",
      onConfirm: async () => {
        await dispatch(
          approveEvent({ eventId: event._id, status: "approved" })
        ).unwrap();
        setSelectedEvent(null);
        dispatch(fetchManagementEvents({ status: "" }));
      },
    });
  };

  const handleRejectEvent = (event) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối sự kiện",
      message: `Vui lòng nhập lý do từ chối sự kiện "${event.title}":`,
      confirmText: "Từ chối",
      cancelText: "Hủy bỏ",
      onConfirm: async (reason) => {
        await dispatch(
          approveEvent({
            eventId: event._id,
            status: "rejected",
            adminNote: reason,
          })
        ).unwrap();
        setSelectedEvent(null);
        dispatch(fetchManagementEvents({ status: "" }));
      },
    });
  };

  const handleDeleteEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa sự kiện",
      message: (
        <div>
          <p>
            Bạn có chắc chắn muốn <strong>xóa sự kiện</strong> này không?
          </p>
          <p className='mt-2 text-gray-900 font-medium'>"{event.title}"</p>
          <p className='mt-2 text-sm text-red-600'>
            Hành động này <strong>không thể hoàn tác</strong>.
          </p>
        </div>
      ),
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        try {
          await dispatch(deleteEvent(event._id)).unwrap();
          addToast(`Đã xóa sự kiện "${event.title}" thành công!`, "success");
          dispatch(fetchManagementEvents({ status: "" }));
        } catch (error) {
          addToast(error || "Không thể xóa sự kiện.", "error");
        }
      },
    });
  };

  // --- Logic: Registration Actions ---
  const handleApproveRegistration = (reg) => {
    setConfirmModal({
      isOpen: true,
      title: "Duyệt đăng ký",
      message: `Chấp nhận tình nguyện viên ${reg.volunteer?.userName} tham gia sự kiện?`,
      type: "success",
      confirmText: "Chấp nhận",
      onConfirm: async () => {
        try {
          await dispatch(acceptRegistration(reg._id)).unwrap();
          setSelectedRegistration(null);
          dispatch(fetchPendingRegistrations());
        } catch (error) {
          addToast(error || "Lỗi khi chấp nhận đăng ký", "error");
        }
      },
    });
  };

  const handleRejectRegistration = (reg) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối đăng ký",
      message: `Nhập lý do từ chối tình nguyện viên ${reg.volunteer?.userName}:`,
      confirmText: "Từ chối",
      onConfirm: async (reason) => {
        try {
          await dispatch(
            rejectRegistration({ registrationId: reg._id, reason })
          ).unwrap();
          setSelectedRegistration(null);
          dispatch(fetchPendingRegistrations());
        } catch (error) {
          addToast(error || "Lỗi khi từ chối đăng ký", "error");
        }
      },
    });
  };

  // --- Logic: Manager Requests ---
  const handleApproveManager = (req) => {
    setConfirmModal({
      isOpen: true,
      title: "Duyệt yêu cầu Manager",
      message: `Xác nhận thăng cấp cho ${req.userName} lên Manager?`,
      type: "success",
      confirmText: "Thăng cấp",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserRole({ userId: req._id, role: "manager" })
          ).unwrap();
          setSelectedManagerRequest(null);
          dispatch(fetchAllUsers());
        } catch (error) {
          addToast(error || "Lỗi khi thăng cấp", "error");
        }
      },
    });
  };

  const handleRejectManager = (req) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối yêu cầu",
      message: `Nhập lý do từ chối yêu cầu của ${req.userName}:`,
      confirmText: "Từ chối",
      onConfirm: async () => {
        addToast("Đã từ chối yêu cầu.", "info");
        setSelectedManagerRequest(null);
        dispatch(fetchAllUsers());
      },
    });
  };

  // --- Logic: User Management ---
  const handleToggleUserStatus = (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setConfirmModal({
      isOpen: true,
      title: newStatus === "inactive" ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: (
        <div className='text-center'>
          <p>
            Xác nhận{" "}
            <strong>{newStatus === "inactive" ? "khóa" : "mở khóa"}</strong> tài
            khoản:
          </p>
          <p className='font-bold text-xl mt-2'>"{user.userName}"</p>
        </div>
      ),
      type: newStatus === "inactive" ? "warning" : "success",
      confirmText: newStatus === "inactive" ? "Khóa" : "Mở khóa",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserStatus({ userId: user._id, status: newStatus })
          ).unwrap();
          addToast(
            newStatus === "inactive"
              ? "Đã khóa tài khoản!"
              : "Đã mở khóa tài khoản!",
            "success"
          );
          dispatch(fetchAllUsers());
        } catch {
          addToast("Không thể thay đổi trạng thái", "error");
        }
      },
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa tài khoản người dùng",
      message: (
        <div>
          <p>
            Bạn có chắc muốn <strong>xóa vĩnh viễn</strong> tài khoản này?
          </p>
          <p className='mt-2 font-medium text-gray-900'>"{user.userName}"</p>
          <p className='mt-2 text-sm text-red-600'>
            Dữ liệu sẽ bị xóa và <strong>không thể khôi phục</strong>.
          </p>
        </div>
      ),
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        try {
          await dispatch(deleteUser(user._id)).unwrap();
          addToast(`Đã xóa người dùng "${user.userName}"`, "success");
          dispatch(fetchAllUsers());
        } catch {
          addToast("Không thể xóa người dùng này", "error");
        }
      },
    });
  };

  // Render variables to keep JSX clean
  const isFullWidthTab =
    activeTab === "users_management" || activeTab === "events_management";

  return (
    // FIX: Sử dụng min-h-screen để trang tự giãn theo nội dung => Dùng thanh cuộn trình duyệt (toàn trang)
    <div className='min-h-screen bg-gray-50 flex flex-col font-sans'>
      {/* Top Bar - Sticky: Luôn dính ở trên cùng */}
      <div className='sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm'>
        <h1 className='text-2xl font-bold text-gray-800'>Admin Dashboard</h1>
        <div className='flex items-center gap-4'>
          {/* Export Button */}
          <div className='relative hidden md:block'>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm'>
              <Download className='w-4 h-4' />
              Xuất dữ liệu
            </button>

            {showExportMenu && (
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200'>
                <div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                  Sự kiện
                </div>
                <button
                  onClick={() => handleExport("events", "csv")}
                  className='w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2'>
                  <FileSpreadsheet className='w-4 h-4 text-emerald-600' /> Xuất
                  CSV
                </button>
                <button
                  onClick={() => handleExport("events", "json")}
                  className='w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2'>
                  <FileJson className='w-4 h-4 text-amber-600' /> Xuất JSON
                </button>
                <div className='border-t border-gray-100 my-1'></div>
                <div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                  Tình nguyện viên
                </div>
                <button
                  onClick={() => handleExport("volunteers", "csv")}
                  className='w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2'>
                  <FileSpreadsheet className='w-4 h-4 text-emerald-600' /> Xuất
                  CSV
                </button>
                <button
                  onClick={() => handleExport("volunteers", "json")}
                  className='w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2'>
                  <FileJson className='w-4 h-4 text-amber-600' /> Xuất JSON
                </button>
              </div>
            )}
          </div>

          <div className='relative'>
            <Bell className='w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition' />
            <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white'>
              {pendingEvents.length +
                pendingRegistrations.length +
                pendingManagerRequests.length}
            </span>
          </div>
          <div className='flex items-center gap-3 pl-4 border-l border-gray-200'>
            <div className='text-right hidden sm:block'>
              <p className='text-sm font-bold text-gray-800'>
                {user?.userName || "Admin User"}
              </p>
              <p className='text-xs text-gray-500'>Administrator</p>
            </div>
            <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold'>
              A
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area - Không còn overflow-hidden, nội dung sẽ dài ra và dùng scroll của body */}
      <div className='p-4 md:p-8 flex-1'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Stats Overview - Chỉ hiện ở tab Overview */}
          {activeTab === "overview" && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500'>
              <StatCard
                title='Tổng người dùng'
                value='1,234'
                change={12}
                icon={Users}
                color='bg-blue-500'
              />
              <StatCard
                title='Sự kiện hoạt động'
                value='56'
                change={8}
                icon={Calendar}
                color='bg-emerald-500'
              />
              <StatCard
                title='Chờ duyệt sự kiện'
                value={pendingEvents.length}
                change={-5}
                icon={CheckSquare}
                color='bg-amber-500'
              />
              <StatCard
                title='Yêu cầu Manager'
                value={pendingManagerRequests.length}
                change={2}
                icon={Briefcase}
                color='bg-purple-500'
              />
            </div>
          )}

          {/* Main Tabs Container */}
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${
              isFullWidthTab ? "min-h-[80vh]" : "min-h-[500px]"
            }`}>
            {/* Tab Navigation */}
            <div className='border-b border-gray-200 px-6 pt-4 bg-white sticky top-[73px] z-20'>
              {" "}
              {/* Sticky dưới header */}
              <div className='flex gap-8 overflow-x-auto no-scrollbar'>
                {[
                  { id: "overview", label: "Tổng quan", count: 0 },
                  {
                    id: "events",
                    label: "Duyệt Sự Kiện",
                    count: pendingEvents.length,
                    color: "amber",
                  },
                  {
                    id: "volunteers",
                    label: "Duyệt Đăng Ký",
                    count: pendingRegistrations.length,
                    color: "blue",
                  },
                  {
                    id: "managers",
                    label: "Duyệt Manager",
                    count: pendingManagerRequests.length,
                    color: "purple",
                  },
                  {
                    id: "users_management",
                    label: "Quản lý người dùng",
                    count: 0,
                  },
                  {
                    id: "events_management",
                    label: "Quản lý sự kiện",
                    count: 0,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-emerald-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={`ml-2 px-2 py-0.5 bg-${tab.color}-100 text-${tab.color}-700 text-xs rounded-full`}>
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full' />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Area */}
            <div className={`flex-1 ${isFullWidthTab ? "p-0" : "p-6"}`}>
              {/* --- TAB: OVERVIEW --- */}
              {activeTab === "overview" && (
                <div className='space-y-8 animate-in fade-in duration-300'>
                  <div className='grid gap-6 lg:grid-cols-3'>
                    <div className='lg:col-span-2 rounded-xl bg-white p-4 border border-gray-100'>
                      <h2 className='text-lg font-semibold text-gray-800 mb-4'>
                        Hoạt động người tham gia
                      </h2>
                      <div className='h-64 w-full min-w-0'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <LineChart
                            data={[
                              { name: "Jan", attendees: 22 },
                              { name: "Feb", attendees: 15 },
                              { name: "Mar", attendees: 35 },
                              { name: "Apr", attendees: 28 },
                              { name: "May", attendees: 45 },
                              { name: "Jun", attendees: 60 },
                            ]}>
                            <CartesianGrid
                              strokeDasharray='3 3'
                              vertical={false}
                              stroke='#e2e8f0'
                            />
                            <XAxis
                              dataKey='name'
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line
                              type='monotone'
                              dataKey='attendees'
                              stroke='#10b981'
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className='rounded-xl bg-white p-4 border border-gray-100'>
                      <h2 className='text-lg font-semibold text-gray-800 mb-4'>
                        Loại sự kiện
                      </h2>
                      <div className='h-48 w-full min-w-0'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Môi trường",
                                  value: 35,
                                  color: "#10b981",
                                },
                                {
                                  name: "Giáo dục",
                                  value: 25,
                                  color: "#3b82f6",
                                },
                                {
                                  name: "Cộng đồng",
                                  value: 20,
                                  color: "#f59e0b",
                                },
                                { name: "Y tế", value: 20, color: "#ef4444" },
                              ]}
                              dataKey='value'
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={4}>
                              <Cell key={0} fill='#10b981' />
                              <Cell key={1} fill='#3b82f6' />
                              <Cell key={2} fill='#f59e0b' />
                              <Cell key={3} fill='#ef4444' />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className='mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500'>
                        <div className='flex items-center gap-2'>
                          <span className='w-2 h-2 rounded-full bg-emerald-500'></span>
                          Môi trường
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='w-2 h-2 rounded-full bg-blue-500'></span>
                          Giáo dục
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='w-2 h-2 rounded-full bg-amber-500'></span>
                          Cộng đồng
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='w-2 h-2 rounded-full bg-red-500'></span>
                          Y tế
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: EVENTS APPROVAL --- */}
              {activeTab === "events" && (
                <div className='overflow-x-auto animate-in fade-in duration-300'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className='border-b border-gray-100'>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Sự kiện
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Manager
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Thời gian
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50'>
                      {pendingEvents.length === 0 ? (
                        <tr>
                          <td
                            colSpan='4'
                            className='py-12 text-center text-gray-500'>
                            Không có sự kiện nào đang chờ duyệt.
                          </td>
                        </tr>
                      ) : (
                        pendingEvents.map((event) => (
                          <tr
                            key={event.id || event._id}
                            className='hover:bg-gray-50 transition group'>
                            <td className='py-4 px-4'>
                              <div className='flex items-center gap-3'>
                                <img
                                  src={
                                    event.image ||
                                    "https://via.placeholder.com/40"
                                  }
                                  alt=''
                                  className='w-12 h-12 rounded-lg object-cover shadow-sm bg-gray-100'
                                />
                                <div>
                                  <p className='font-medium text-gray-900'>
                                    {event.title}
                                  </p>
                                  <span className='text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
                                    {event.tags?.[0] || "Khác"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-sm text-gray-500'>
                              {event.createdBy?.userName || "N/A"}
                            </td>
                            <td className='py-4 px-4 text-sm text-gray-500'>
                              {new Date(event.startDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td className='py-4 px-4 text-right'>
                              <button
                                onClick={() => setSelectedEvent(event)}
                                className='inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition'>
                                <Eye className='w-4 h-4' /> Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- TAB: VOLUNTEER REGISTRATIONS APPROVAL --- */}
              {activeTab === "volunteers" && (
                <div className='overflow-x-auto animate-in fade-in duration-300'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className='border-b border-gray-100'>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Tình nguyện viên
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Đăng ký sự kiện
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Ngày đăng ký
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50'>
                      {pendingRegistrations.length === 0 ? (
                        <tr>
                          <td
                            colSpan='4'
                            className='py-12 text-center text-gray-500'>
                            Không có đăng ký nào đang chờ duyệt.
                          </td>
                        </tr>
                      ) : (
                        pendingRegistrations.map((reg) => {
                          // FIX: Tạo biến an toàn để tránh lỗi crash khi user bị null
                          const volunteer = reg.volunteer || {};
                          const event = reg.event || {};

                          return (
                            <tr
                              key={reg._id}
                              className='hover:bg-gray-50 transition'>
                              <td className='py-4 px-4'>
                                <div className='flex items-center gap-3'>
                                  <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden'>
                                    {/* Kiểm tra profilePicture an toàn */}
                                    {volunteer?.profilePicture ? (
                                      <img
                                        src={volunteer.profilePicture}
                                        alt=''
                                        className='w-full h-full object-cover'
                                      />
                                    ) : (
                                      <span className='text-gray-400 font-bold'>
                                        {/* Fallback ký tự đầu tiên hoặc "U" nếu không có tên */}
                                        {volunteer?.userName?.charAt(0) || "U"}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className='font-medium text-gray-900'>
                                      {/* Fallback tên hiển thị */}
                                      {volunteer?.userName ||
                                        "Người dùng đã xóa"}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      {volunteer?.userEmail || "---"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className='py-4 px-4'>
                                <p className='text-sm font-medium text-gray-900 truncate max-w-[200px]'>
                                  {event?.title || "Sự kiện không xác định"}
                                </p>
                              </td>
                              <td className='py-4 px-4 text-sm text-gray-500'>
                                {new Date(reg.registeredAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </td>
                              <td className='py-4 px-4 text-right'>
                                <button
                                  onClick={() => setSelectedRegistration(reg)}
                                  className='inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition'>
                                  <Eye className='w-4 h-4' /> Xem hồ sơ
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- TAB: MANAGER REQUESTS APPROVAL --- */}
              {activeTab === "managers" && (
                <div className='overflow-x-auto animate-in fade-in duration-300'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className='border-b border-gray-100'>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Ứng viên
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Công việc hiện tại
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                          Kinh nghiệm
                        </th>
                        <th className='py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50'>
                      {pendingManagerRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan='4'
                            className='py-12 text-center text-gray-500'>
                            Không có yêu cầu nào đang chờ duyệt.
                          </td>
                        </tr>
                      ) : (
                        pendingManagerRequests.map((req) => (
                          <tr
                            key={req.id}
                            className='hover:bg-gray-50 transition'>
                            <td className='py-4 px-4'>
                              <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden'>
                                  {req.candidate.profilePicture ? (
                                    <img
                                      src={req.candidate.profilePicture}
                                      alt=''
                                      className='w-full h-full object-cover'
                                    />
                                  ) : (
                                    <span className='text-purple-600 font-bold'>
                                      {req.candidate.userName?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className='font-medium text-gray-900'>
                                    {req.candidate.userName}
                                  </p>
                                  <p className='text-xs text-gray-500'>
                                    {req.candidate.userEmail}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4'>
                              <p className='text-sm text-gray-900'>
                                {req.currentRole}
                              </p>
                              <p className='text-xs text-gray-500'>
                                {req.organization}
                              </p>
                            </td>
                            <td className='py-4 px-4 text-sm text-gray-500'>
                              {req.experience} năm
                            </td>
                            <td className='py-4 px-4 text-right'>
                              <button
                                onClick={() => setSelectedManagerRequest(req)}
                                className='inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium transition'>
                                <Eye className='w-4 h-4' /> Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- TAB: USERS MANAGEMENT --- */}
              {activeTab === "users_management" && (
                <div className='h-full animate-in fade-in duration-300'>
                  <UserManagementTable
                    users={allUsers}
                    onViewUser={handleViewUser}
                    onToggleUserStatus={handleToggleUserStatus}
                    onDeleteUser={handleDeleteUser}
                  />
                </div>
              )}

              {/* --- TAB: EVENTS MANAGEMENT --- */}
              {activeTab === "events_management" && (
                <div className='h-full animate-in fade-in duration-300'>
                  <AdminEventsTab
                    events={allEvents}
                    registrations={pendingRegistrations}
                    onApprove={handleApproveEvent}
                    onReject={handleRejectEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onViewEvent={handleViewEvent}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedEvent && (
        <EventApprovalModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onApprove={handleApproveEvent}
          onReject={handleRejectEvent}
        />
      )}
      {selectedRegistration && (
        <VolunteerApprovalModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onApprove={handleApproveRegistration}
          onReject={handleRejectRegistration}
        />
      )}
      {selectedManagerRequest && (
        <ManagerApprovalModal
          request={selectedManagerRequest}
          onClose={() => setSelectedManagerRequest(null)}
          onApprove={handleApproveManager}
          onReject={handleRejectManager}
        />
      )}
      {/* Detail View Modals */}
      <UserDetailModal
        viewingUser={viewingUser}
        registrations={pendingRegistrations}
        events={allEvents}
        addToast={addToast}
        setConfirmModal={setConfirmModal}
        onClose={() => setViewingUser(null)}
        onEventClick={handleViewEvent}
      />
      <EventDetailModal
        event={viewingEventDetail}
        registrations={pendingRegistrations}
        users={allUsers}
        onClose={() => setViewingEventDetail(null)}
        onUserClick={handleViewUser}
      />
      {/* Common Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={() => setPromptModal({ ...promptModal, isOpen: false })}
        onConfirm={promptModal.onConfirm}
        title={promptModal.title}
        message={promptModal.message}
        confirmText={promptModal.confirmText}
        cancelText={promptModal.cancelText}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AdminDashboard;
