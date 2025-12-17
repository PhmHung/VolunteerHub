/** @format */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Icons
import {
  Calendar,
  Users,
  Briefcase,
  Bell,
  Download,
  FileJson,
  FileSpreadsheet,
  ArrowUpRight,
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
  requestCancelEvent,
} from "../../features/eventSlice";
import {
  fetchAllUsers,
  updateUserRole,
  clearMessages,
  deleteUser,
  updateUserStatus,
  fetchSuggestedManagers,
} from "../../features/userSlice";
import {
  clearRegistrationMessages,
  fetchAllRegistrations,
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";
import {
  fetchPendingApprovals,
  processApprovalRequest,
  clearApprovalMessages,
} from "../../features/approvalSlice";
// Utils & Components
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import VolunteerApprovalModal from "../../components/approvals/VolunteerApprovalModal";
import ManagerApprovalModal from "../../components/approvals/ManagerApprovalModal";
import UserDetailModal from "../../components/users/UserDetailModal";
import EventDetailModal from "../../components/events/EventDetailModal";
import { ToastContainer } from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import PromptModal from "../../components/common/PromptModal";
import PotentialManagerList from "../../components/approvals/PotentialManagerList";
// NEW COMPONENTS
import RegistrationManagementTable from "../../components/registrations/RegistrationManagementTable";
import EventManagementTable from "../../components/events/EventManagementTable"; // Component mới cập nhật
import UserManagementTable from "../../components/users/UserManagementTable";
//import { useNavigate } from "react-router-dom";
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
  //const navigate = useNavigate();
  // Redux State
  const {
    list: allEvents = [],
    successMessage: eventSuccessMessage,
    error: eventError,
  } = useSelector((state) => state.event);

  const {
    users: allUsers = [],
    message: userMessage,
    error: userError,
    suggestedManagers = [],
  } = useSelector((state) => state.user);

  const {
    pendingRegistrations = [],
    successMessage: regSuccessMessage,
    error: regError,
  } = useSelector((state) => state.registration);

  const {
    pendingList: pendingRequests = [],
    successMessage: approvalSuccessMessage,
    error: approvalError,
  } = useSelector((state) => state.approval);

  // Filter Requests
  const pendingManagerRequests = pendingRequests.filter(
    (req) => req.type === "manager_promotion"
  );
  const pendingCancelRequests = pendingRequests.filter(
    (req) => req.type === "event_cancellation"
  );
  const pendingNewEvents = allEvents.filter((e) => e.status === "pending");

  // Local State
  const [activeTab, setActiveTab] = useState("overview");
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedManagerRequest, setSelectedManagerRequest] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingEventDetail, setViewingEventDetail] = useState(null);

  const [toasts, setToasts] = useState([]);

  // Confirm / Prompt modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "question",
    confirmText: "",
  });
  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "",
    cancelText: "Hủy",
  });

  // Helpers
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Effects
  useEffect(() => {
    dispatch(fetchManagementEvents({ status: "", limit: 1000 }));
    dispatch(fetchAllUsers());
    dispatch(fetchAllRegistrations());
    dispatch(fetchSuggestedManagers());
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  // Toast handling
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
    if (approvalSuccessMessage) {
      addToast(approvalSuccessMessage, "success");
      dispatch(clearApprovalMessages());
    }
    if (approvalError) {
      addToast(approvalError, "error");
      dispatch(clearApprovalMessages());
    }
  }, [
    eventSuccessMessage,
    eventError,
    userMessage,
    userError,
    regSuccessMessage,
    regError,
    approvalSuccessMessage,
    approvalError,
    dispatch,
  ]);

  // Export handler
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
    format === "csv"
      ? exportToCSV(data, filename)
      : exportToJSON(data, filename);
    setShowExportMenu(false);
  };

  // View handlers
  const handleViewUser = (user) => setViewingUser(user);
  const handleViewEvent = (event) => {
    setViewingEventDetail(event);
    //navigate(`/events/${event._id}`);
  };

  // --- EVENT ACTIONS (Duyệt/Từ chối Event Mới & Xóa/Hủy Event Cũ) ---

  const handleApproveEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: "Duyệt sự kiện",
      message: `Bạn có chắc muốn duyệt sự kiện "${event.title}"?`,
      type: "success",
      confirmText: "Duyệt",
      onConfirm: async () => {
        await dispatch(
          approveEvent({ eventId: event._id, status: "approved" })
        ).unwrap();
        dispatch(fetchManagementEvents({ status: "" }));
      },
    });
  };

  const handleRejectEvent = (event) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối sự kiện",
      message: `Lý do từ chối sự kiện "${event.title}":`,
      confirmText: "Từ chối",
      onConfirm: async (reason) => {
        await dispatch(
          approveEvent({
            eventId: event._id,
            status: "rejected",
            adminNote: reason,
          })
        ).unwrap();
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
            Bạn chắc chắn muốn <strong>xóa vĩnh viễn</strong> sự kiện?
          </p>
          <p className='font-medium mt-2'>"{event.title}"</p>
          <p className='text-sm text-red-600 mt-2'>
            Hành động này không thể hoàn tác.
          </p>
        </div>
      ),
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        await dispatch(deleteEvent(event._id)).unwrap();
        addToast(`Đã xóa sự kiện "${event.title}"`, "success");
        dispatch(fetchManagementEvents({ status: "" }));
      },
    });
  };

  // Admin Force Cancel (Hủy trực tiếp sự kiện đang chạy)
  const handleAdminForceCancel = (event) => {
    setConfirmModal({
      isOpen: true,
      title: "Hủy sự kiện đang hoạt động",
      message: (
        <div>
          <p>
            Bạn có chắc chắn muốn hủy sự kiện <strong>{event.title}</strong>?
          </p>
          <div className='mt-3 bg-orange-50 p-3 rounded-lg border border-orange-200 text-sm text-orange-800'>
            <p className='font-bold flex items-center gap-1'>Cảnh báo:</p>
            <ul className='list-disc list-inside mt-1 ml-1 space-y-1'>
              <li>Trạng thái sự kiện sẽ chuyển thành "Cancelled".</li>
              <li>
                Tất cả {event.registeredCount || 0} tình nguyện viên đã đăng ký
                sẽ bị hủy vé.
              </li>
            </ul>
          </div>
        </div>
      ),
      type: "danger",
      confirmText: "Xác nhận Hủy",
      onConfirm: async () => {
        try {
          // Gọi API requestCancel nhưng với role Admin nó sẽ hủy luôn
          await dispatch(
            requestCancelEvent({
              eventId: event._id,
              reason: "Admin hủy trực tiếp từ Dashboard quản lý.",
            })
          ).unwrap();

          dispatch(fetchManagementEvents({ status: "" }));
          addToast("Đã hủy sự kiện thành công", "success");
        } catch (err) {
          addToast("Lỗi hủy sự kiện: " + err, "error");
        }
      },
    });
  };

  // --- CANCEL REQUEST ACTIONS (Xử lý yêu cầu hủy từ Manager) ---

  const handleApproveCancellation = (req) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận HỦY sự kiện",
      message: (
        <div>
          <p>Bạn đang chấp thuận yêu cầu hủy sự kiện:</p>
          <p className='font-bold text-red-600 my-2'>{req.event?.title}</p>
          <p>Hành động này sẽ:</p>
          <ul className='list-disc list-inside text-sm text-gray-600'>
            <li>Chuyển trạng thái sự kiện sang "Cancelled".</li>
            <li>Hủy toàn bộ vé đã đăng ký của tình nguyện viên.</li>
          </ul>
        </div>
      ),
      type: "danger",
      confirmText: "Đồng ý Hủy",
      onConfirm: async () => {
        await dispatch(
          processApprovalRequest({
            requestId: req._id,
            actionType: "approve",
          })
        ).unwrap();
        dispatch(fetchPendingApprovals());
        dispatch(fetchManagementEvents({ status: "" }));
      },
    });
  };

  const handleRejectCancellation = (req) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối yêu cầu hủy",
      message: "Nhập lý do từ chối (Sự kiện sẽ tiếp tục hoạt động):",
      confirmText: "Gửi lý do",
      onConfirm: async (reason) => {
        await dispatch(
          processApprovalRequest({
            requestId: req._id,
            actionType: "reject",
            adminNote: reason,
          })
        ).unwrap();
        dispatch(fetchPendingApprovals());
        dispatch(fetchManagementEvents({ status: "" }));
      },
    });
  };
  const handleViewCancelRequest = (req) => {
    setSelectedManagerRequest(req); // Tái sử dụng ManagerApprovalModal
  };

  // --- OTHER ACTIONS (User/Manager/Reg) ---

  const handleRecommendManager = (user) => {
    /* ... giữ nguyên ... */
    setConfirmModal({
      isOpen: true,
      title: "Đề cử thăng cấp Manager",
      message: `Bạn có chắc muốn thăng cấp "${user.userName}"?`,
      type: "success",
      confirmText: "Thăng cấp ngay",
      onConfirm: async () => {
        try {
          await dispatch(
            updateUserRole({ userId: user._id, role: "manager" })
          ).unwrap();
          addToast(`Đã thăng cấp thành công cho ${user.userName}`, "success");
          dispatch(fetchAllUsers());
        } catch (error) {
          addToast("Lỗi: " + error, "error");
        }
      },
    });
  };

  const handleApproveRegistration = (reg) => {
    setConfirmModal({
      isOpen: true,
      title: "Chấp nhận đăng ký",
      message: `Chấp nhận ${reg.volunteer?.userName}?`,
      type: "success",
      confirmText: "Chấp nhận",
      onConfirm: async () => {
        await dispatch(acceptRegistration(reg._id)).unwrap();
        setSelectedRegistration(null);
        dispatch(fetchAllRegistrations());
      },
    });
  };

  const handleRejectRegistration = (reg) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối đăng ký",
      message: `Lý do từ chối ${reg.volunteer?.userName}:`,
      confirmText: "Từ chối",
      onConfirm: async (reason) => {
        await dispatch(
          rejectRegistration({ registrationId: reg._id, reason })
        ).unwrap();
        setSelectedRegistration(null);
        dispatch(fetchAllRegistrations());
      },
    });
  };

  const handleApproveManager = (req) => {
    setConfirmModal({
      isOpen: true,
      title: "Thăng cấp Manager",
      message: `Xác nhận thăng cấp ${req.requestedBy?.userName}?`,
      type: "success",
      confirmText: "Thăng cấp",
      onConfirm: async () => {
        await dispatch(
          processApprovalRequest({ requestId: req._id, actionType: "approve" })
        ).unwrap();
        setSelectedManagerRequest(null);
        dispatch(fetchPendingApprovals());
        dispatch(fetchAllUsers());
      },
    });
  };

  const handleRejectManager = (req) => {
    setPromptModal({
      isOpen: true,
      title: "Từ chối yêu cầu Manager",
      message: `Lý do từ chối yêu cầu của ${req.requestedBy?.userName}:`,
      confirmText: "Từ chối",
      onConfirm: async (reason) => {
        await dispatch(
          processApprovalRequest({
            requestId: req._id,
            actionType: "reject",
            adminNote: reason,
          })
        ).unwrap();
        setSelectedManagerRequest(null);
        dispatch(fetchPendingApprovals());
      },
    });
  };

  const handleToggleUserStatus = (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setConfirmModal({
      isOpen: true,
      title: newStatus === "inactive" ? "Khóa tài khoản" : "Mở khóa tài khoản",
      message: `Xác nhận ${newStatus === "inactive" ? "khóa" : "mở khóa"} "${
        user.userName
      }"?`,
      type: newStatus === "inactive" ? "warning" : "success",
      confirmText: newStatus === "inactive" ? "Khóa" : "Mở khóa",
      onConfirm: async () => {
        await dispatch(
          updateUserStatus({ userId: user._id, status: newStatus })
        ).unwrap();
        addToast("Cập nhật trạng thái thành công", "success");
        dispatch(fetchAllUsers());
      },
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa tài khoản",
      message: `Xóa vĩnh viễn tài khoản "${user.userName}"?`,
      type: "danger",
      confirmText: "Xóa vĩnh viễn",
      onConfirm: async () => {
        await dispatch(deleteUser(user._id)).unwrap();
        addToast("Đã xóa người dùng", "success");
        dispatch(fetchAllUsers());
      },
    });
  };

  const totalPending =
    pendingNewEvents.length +
    pendingRegistrations.length +
    pendingManagerRequests.length +
    pendingCancelRequests.length;

  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
      {/* Header */}
      <div className='sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm'>
        <h1 className='text-2xl font-bold text-gray-800'>Admin Dashboard</h1>
        <div className='flex items-center gap-4'>
          {/* Export */}
          <div className='relative'>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition'>
              <Download className='w-4 h-4' />
              Xuất dữ liệu
            </button>
            {showExportMenu && (
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50'>
                <div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase'>
                  Sự kiện
                </div>
                <button
                  onClick={() => handleExport("events", "csv")}
                  className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'>
                  <FileSpreadsheet className='w-4 h-4 text-emerald-600' /> CSV
                </button>
                <button
                  onClick={() => handleExport("events", "json")}
                  className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'>
                  <FileJson className='w-4 h-4 text-amber-600' /> JSON
                </button>
                <div className='border-t my-1'></div>
                <div className='px-4 py-2 text-xs font-semibold text-gray-400 uppercase'>
                  Tình nguyện viên
                </div>
                <button
                  onClick={() => handleExport("volunteers", "csv")}
                  className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'>
                  <FileSpreadsheet className='w-4 h-4 text-emerald-600' /> CSV
                </button>
                <button
                  onClick={() => handleExport("volunteers", "json")}
                  className='w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2'>
                  <FileJson className='w-4 h-4 text-amber-600' /> JSON
                </button>
              </div>
            )}
          </div>

          <div className='relative'>
            <Bell className='w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700' />
            {totalPending > 0 && (
              <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                {totalPending > 99 ? "99+" : totalPending}
              </span>
            )}
          </div>

          <div className='flex items-center gap-3 pl-4 border-l'>
            <div className='text-right hidden sm:block'>
              <p className='font-bold'>{user?.userName || "Admin"}</p>
              <p className='text-xs text-gray-500'>Administrator</p>
            </div>
            <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold'>
              A
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-4 md:p-8'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Stats - only on overview */}
          {activeTab === "overview" && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <StatCard
                title='Tổng người dùng'
                value={allUsers.length}
                change={12}
                icon={Users}
                color='bg-blue-500'
              />
              <StatCard
                title='Sự kiện hoạt động'
                value={allEvents.filter((e) => e.status === "approved").length}
                change={8}
                icon={Calendar}
                color='bg-emerald-500'
              />
              <StatCard
                title='Chờ duyệt sự kiện'
                value={pendingNewEvents.length}
                change={-5}
                icon={Calendar}
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

          {/* Tabs Container */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-140px)]'>
            {/* Tab Navigation */}
            <div className='border-b border-gray-200 px-6 pt-4 bg-white shrink-0 z-20'>
              <div className='flex gap-8 overflow-x-auto no-scrollbar pb-4'>
                {[
                  { id: "overview", label: "Tổng quan" },
                  {
                    id: "events_management", // Tab này giờ là chính cho cả Duyệt và Quản lý
                    label: "Quản lý sự kiện",
                    // Count bao gồm: Sự kiện chờ duyệt + Yêu cầu hủy
                    count:
                      pendingNewEvents.length + pendingCancelRequests.length,
                    color: "amber",
                  },
                  {
                    id: "volunteers",
                    label: "Duyệt đăng ký",
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
                    id: "suggestions",
                    label: "Gợi ý Manager",
                    count: suggestedManagers.length,
                    color: "green",
                  },
                  { id: "users_management", label: "Quản lý người dùng" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-medium relative whitespace-nowrap ${
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
                      <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600' />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className='flex-1 p-6 overflow-y-auto'>
              {/* Overview */}
              {activeTab === "overview" && (
                <div className='grid lg:grid-cols-3 gap-6'>
                  <div className='lg:col-span-2 bg-white rounded-xl border p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Thống kê tham gia
                    </h3>
                    <ResponsiveContainer width='100%' height={300}>
                      <LineChart
                        data={[
                          { name: "Jan", v: 30 },
                          { name: "Feb", v: 45 },
                          { name: "Mar", v: 38 },
                          { name: "Apr", v: 62 },
                          { name: "May", v: 55 },
                          { name: "Jun", v: 80 },
                        ]}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type='monotone'
                          dataKey='v'
                          stroke='#10b981'
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='bg-white rounded-xl border p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Phân loại sự kiện
                    </h3>
                    <ResponsiveContainer width='100%' height={240}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Môi trường", value: 40, color: "#10b981" },
                            { name: "Giáo dục", value: 25, color: "#3b82f6" },
                            { name: "Cộng đồng", value: 20, color: "#f59e0b" },
                            { name: "Y tế", value: 15, color: "#ef4444" },
                          ]}
                          dataKey='value'
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}>
                          <Cell fill='#10b981' />
                          <Cell fill='#3b82f6' />
                          <Cell fill='#f59e0b' />
                          <Cell fill='#ef4444' />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* === TAB QUẢN LÝ SỰ KIỆN (ALL-IN-ONE) === */}
              {activeTab === "events_management" && (
                <EventManagementTable
                  events={allEvents} // Truyền toàn bộ sự kiện
                  registrations={pendingRegistrations}
                  // Props cho phần Cancel Request (Khối màu đỏ)
                  cancelRequests={pendingCancelRequests}
                  onViewCancelRequest={handleViewCancelRequest}
                  onApproveCancellation={handleApproveCancellation}
                  onRejectCancellation={handleRejectCancellation}
                  // Props cho phần Event List (Các nút hành động)
                  onApprove={handleApproveEvent} // Duyệt sự kiện mới
                  onReject={handleRejectEvent} // Từ chối sự kiện mới
                  onCancelEvent={handleAdminForceCancel} // Hủy sự kiện đang chạy
                  onDeleteEvent={handleDeleteEvent} // Xóa sự kiện
                  onViewEvent={handleViewEvent} // Xem chi tiết
                />
              )}

              {/* Các Tabs khác (Giữ nguyên) */}
              {activeTab === "volunteers" && (
                <RegistrationManagementTable
                  registrations={pendingRegistrations}
                  users={allUsers}
                  events={allEvents}
                  onApprove={handleApproveRegistration}
                  onReject={handleRejectRegistration}
                  loading={false}
                />
              )}

              {activeTab === "managers" && (
                <div className='space-y-4'>
                  {pendingManagerRequests.length === 0 ? (
                    <div className='text-center py-12 text-gray-500'>
                      Không có yêu cầu Manager nào đang chờ duyệt.
                    </div>
                  ) : (
                    pendingManagerRequests.map((req) => (
                      <div
                        key={req._id}
                        className='bg-white rounded-xl border p-5 flex items-center justify-between hover:shadow-md transition'>
                        <div className='flex items-center gap-4'>
                          <div className='w-12 h-12 rounded-full bg-purple-100 overflow-hidden'>
                            {req.requestedBy?.profilePicture ? (
                              <img
                                src={req.requestedBy.profilePicture}
                                alt=''
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center text-purple-700 font-bold'>
                                {req.requestedBy?.userName?.[0] || "U"}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className='font-semibold'>
                              {req.requestedBy?.userName ||
                                "Người dùng không xác định"}
                            </p>
                            <p className='text-sm text-gray-500'>
                              Hoàn thành:{" "}
                              {req.promotionData?.eventsCompleted || 0} sự kiện
                              • {req.promotionData?.totalAttendanceHours || 0}{" "}
                              giờ
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedManagerRequest(req)}
                          className='px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium'>
                          Xem chi tiết
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "users_management" && (
                <UserManagementTable
                  users={allUsers}
                  onViewUser={handleViewUser}
                  onToggleUserStatus={handleToggleUserStatus}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === "suggestions" && (
                <PotentialManagerList
                  suggestedUsers={suggestedManagers}
                  onRecommend={handleRecommendManager}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* ... (Các modal giữ nguyên như cũ) ... */}
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
          // onApprove={handleApproveManager}
          // onReject={handleRejectManager}
          onApprove={(req) => {
            if (req.type === "event_cancellation") {
              // Nếu là yêu cầu hủy sự kiện -> Gọi hàm duyệt hủy
              handleApproveCancellation(req);
              setSelectedManagerRequest(null); // Đóng modal sau khi gọi confirm
            } else {
              // Nếu là yêu cầu thăng cấp Manager -> Gọi logic cũ
              handleApproveManager(req);
            }
          }}
          onReject={(req, action, note) => {
            if (req.type === "event_cancellation") {
              // Nếu từ chối hủy -> Gọi API reject kèm lý do (note)
              // Lưu ý: handleRejectCancellation dùng PromptModal,
              // nhưng ở đây ta đã có note từ ManagerApprovalModal nên gọi thẳng API luôn
              dispatch(
                processApprovalRequest({
                  requestId: req._id,
                  actionType: "reject",
                  adminNote: note, // Note nhập từ modal
                })
              ).unwrap();
              dispatch(fetchPendingApprovals());
              dispatch(fetchManagementEvents({ status: "" }));
              setSelectedManagerRequest(null);
              addToast("Đã từ chối yêu cầu hủy", "success");
            } else {
              handleRejectManager(req);
            }
          }}
        />
      )}

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
        onUserClick={handleViewEvent}
      />

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
      <PromptModal
        {...promptModal}
        onClose={() => setPromptModal({ ...promptModal, isOpen: false })}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default AdminDashboard;
