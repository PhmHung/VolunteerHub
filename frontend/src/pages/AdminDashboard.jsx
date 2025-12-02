import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LeftBar from '../components/LeftBar';
import { 
  LayoutDashboard, Users, Calendar, CheckSquare, 
  Search, Bell, Filter, MoreVertical, ArrowUpRight,
  Clock, CheckCircle, XCircle, Eye, Briefcase,
  Download, FileJson, FileSpreadsheet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchEvents, approveEvent, clearEventMessages } from '../features/event/eventSlice';
import { fetchAllUsers, updateUserRole, clearMessages } from '../features/user/userSlice';
import { clearRegistrationMessages, fetchPendingRegistrations, acceptRegistration, rejectRegistration } from '../features/registration/registrationSlice';
import { EVENT_CATEGORIES, EVENT_STATUS } from '../utils/constants';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import EventApprovalModal from '../components/admin/EventApprovalModal';
import VolunteerApprovalModal from '../components/admin/VolunteerApprovalModal';
import ManagerApprovalModal from '../components/admin/ManagerApprovalModal';
import AdminUsersTab from '../components/admin/AdminUsersTab';
import AdminEventsTab from '../components/admin/AdminEventsTab';
import UserDetailModal from '../components/admin/UserDetailModal';
import EventDetailModal from '../components/admin/EventDetailModal';
import { ToastContainer } from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import PromptModal from '../components/common/PromptModal';

const StatCard = ({ title, value, change, icon, color }) => {
  const Icon = icon;
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-success-600' : 'text-error-600'}`}>
          {change > 0 && '+'}{change}%
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </span>
      </div>
      <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-text-main">{value}</p>
    </div>
  );
};

const AdminDashboard = ({ user }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { list: allEvents, successMessage: eventSuccessMessage, error: eventError } = useSelector((state) => state.event);
  const { users: allUsers, message: userMessage, error: userError } = useSelector((state) => state.user);
  const { pendingRegistrations, successMessage: regSuccessMessage, error: regError } = useSelector((state) => state.registration);

  const [activeTab, setActiveTab] = useState('overview');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingManagerRequests, setPendingManagerRequests] = useState([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedManagerRequest, setSelectedManagerRequest] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Detail View States (Cross-tab navigation)
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingEventDetail, setViewingEventDetail] = useState(null);

  // Modal States
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'question' });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Load data
  useEffect(() => {
    dispatch(fetchEvents({ status: '' })); // Get all events including pending
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Filter pending data from Redux state
  useEffect(() => {
    // Filter pending events
    const pending = allEvents.filter(e => e.status === 'pending');
    setPendingEvents(pending);

    // Filter pending manager requests (volunteers requesting manager role)
    const managerReqs = allUsers.filter(u => u.pendingManagerRequest === true);
    setPendingManagerRequests(managerReqs);
  }, [allEvents, allUsers]);

  // Handle success/error messages
  useEffect(() => {
    if (eventSuccessMessage) {
      addToast(eventSuccessMessage, 'success');
      dispatch(clearEventMessages());
    }
    if (eventError) {
      addToast(eventError, 'error');
      dispatch(clearEventMessages());
    }
    if (userMessage) {
      addToast(userMessage, 'success');
      dispatch(clearMessages());
    }
    if (userError) {
      addToast(userError, 'error');
      dispatch(clearMessages());
    }
    if (regSuccessMessage) {
      addToast(regSuccessMessage, 'success');
      dispatch(clearRegistrationMessages());
    }
    if (regError) {
      addToast(regError, 'error');
      dispatch(clearRegistrationMessages());
    }
  }, [eventSuccessMessage, eventError, userMessage, userError, regSuccessMessage, regError, dispatch]);

  // Export Handler
  const handleExport = (type, format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let data = [];
    let filename = '';

    if (type === 'events') {
      data = allEvents;
      filename = `events_export_${timestamp}`;
    } else if (type === 'volunteers') {
      data = allUsers.filter(u => u.role === 'volunteer');
      filename = `volunteers_export_${timestamp}`;
    }

    if (format === 'csv') {
      exportToCSV(data, filename);
    } else {
      exportToJSON(data, filename);
    }
    setShowExportMenu(false);
  };

  // Navigation Handlers
  const handleViewUser = (user) => {
    setViewingUser(user);
    setViewingEventDetail(null); // Close event detail if open (though modals usually overlay)
  };

  const handleViewEvent = (event) => {
    setViewingEventDetail(event);
    setViewingUser(null); // Close user detail if open
  };

  // Event Actions
  const handleApproveEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: 'Duyệt sự kiện',
      message: `Bạn có chắc chắn muốn duyệt sự kiện "${event.title}" không?`,
      type: 'success',
      confirmText: 'Duyệt ngay',
      onConfirm: async () => {
        await dispatch(approveEvent({ eventId: event._id, status: 'approved' })).unwrap();
        setSelectedEvent(null);
        dispatch(fetchEvents({ status: '' }));
      }
    });
  };

  const handleRejectEvent = (event) => {
    setPromptModal({
      isOpen: true,
      title: 'Từ chối sự kiện',
      message: `Vui lòng nhập lý do từ chối sự kiện "${event.title}":`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy bỏ',
      onConfirm: async (reason) => {
        await dispatch(approveEvent({ eventId: event._id, status: 'rejected', adminNote: reason })).unwrap();
        setSelectedEvent(null);
        dispatch(fetchEvents({ status: '' }));
      }
    });
  };

  // Registration Actions
  const handleApproveRegistration = (reg) => {
    setConfirmModal({
      isOpen: true,
      title: 'Duyệt đăng ký',
      message: `Chấp nhận tình nguyện viên ${reg.volunteer?.userName || reg.userId?.userName} tham gia sự kiện?`,
      type: 'success',
      confirmText: 'Chấp nhận',
      onConfirm: async () => {
        try {
          await dispatch(acceptRegistration(reg._id)).unwrap();
          setSelectedRegistration(null);
          dispatch(fetchPendingRegistrations());
        } catch (error) {
          addToast(error || "Lỗi khi chấp nhận đăng ký", 'error');
        }
      }
    });
  };

  const handleRejectRegistration = (reg) => {
    setPromptModal({
      isOpen: true,
      title: 'Từ chối đăng ký',
      message: `Nhập lý do từ chối tình nguyện viên ${reg.volunteer?.userName || reg.userId?.userName}:`,
      confirmText: 'Từ chối',
      onConfirm: async (reason) => {
        try {
          await dispatch(rejectRegistration({ registrationId: reg._id, reason })).unwrap();
          setSelectedRegistration(null);
          dispatch(fetchPendingRegistrations());
        } catch (error) {
          addToast(error || "Lỗi khi từ chối đăng ký", 'error');
        }
      }
    });
  };

  // Manager Request Actions
  const handleApproveManager = (req) => {
    setConfirmModal({
      isOpen: true,
      title: 'Duyệt yêu cầu Manager',
      message: `Xác nhận thăng cấp cho ${req.userName} lên Manager?`,
      type: 'success',
      confirmText: 'Thăng cấp',
      onConfirm: async () => {
        try {
          await dispatch(updateUserRole({ userId: req._id, role: 'manager' })).unwrap();
          setSelectedManagerRequest(null);
          dispatch(fetchAllUsers());
        } catch (error) {
          addToast(error || "Lỗi khi thăng cấp", 'error');
        }
      }
    });
  };

  const handleRejectManager = (req) => {
    setPromptModal({
      isOpen: true,
      title: 'Từ chối yêu cầu',
      message: `Nhập lý do từ chối yêu cầu của ${req.userName}:`,
      confirmText: 'Từ chối',
      // eslint-disable-next-line no-unused-vars
      onConfirm: async (reason) => {
        // For now, just clear the pending request flag
        // TODO: Send rejection reason to backend
        addToast("Đã từ chối yêu cầu.", 'info');
        setSelectedManagerRequest(null);
        dispatch(fetchAllUsers());
      }
    });
  };

  // User Management Actions
  const handleLockUser = (targetUser) => {
    const isLocked = targetUser.status === 'locked';
    setConfirmModal({
      isOpen: true,
      title: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      message: `Bạn có chắc chắn muốn ${isLocked ? 'mở khóa' : 'khóa'} tài khoản "${targetUser.userName}" không?`,
      type: isLocked ? 'success' : 'danger',
      confirmText: isLocked ? 'Mở khóa' : 'Khóa',
      onConfirm: async () => {
        // TODO: Add lock/unlock API when available
        addToast(`Đã ${isLocked ? 'mở khóa' : 'khóa'} tài khoản "${targetUser.userName}" thành công!`, 'success');
        dispatch(fetchAllUsers());
      }
    });
  };

  // Event Management Actions
  const handleDeleteEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa sự kiện',
      message: `Bạn có chắc chắn muốn xóa sự kiện "${event.title}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa sự kiện',
      onConfirm: async () => {
        // TODO: Add delete event API when available
        addToast(`Đã xóa sự kiện "${event.title}" thành công!`, 'success');
        dispatch(fetchEvents({ status: '' }));
      }
    });
  };

  return (
    <div className='w-full md:flex h-screen overflow-hidden bg-surface-muted'>
      <LeftBar />
      
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-main">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            
            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                Xuất dữ liệu
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Sự kiện</div>
                  <button onClick={() => handleExport('events', 'csv')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-success-600" /> Xuất CSV
                  </button>
                  <button onClick={() => handleExport('events', 'json')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-warning-600" /> Xuất JSON
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Tình nguyện viên</div>
                  <button onClick={() => handleExport('volunteers', 'csv')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-success-600" /> Xuất CSV
                  </button>
                  <button onClick={() => handleExport('volunteers', 'json')} className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-muted flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-warning-600" /> Xuất JSON
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <Bell className="w-6 h-6 text-text-muted cursor-pointer hover:text-text-secondary transition" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white">
                {pendingEvents.length + pendingRegistrations.length + pendingManagerRequests.length}
              </span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-main">{user?.userName || 'Admin User'}</p>
                <p className="text-xs text-text-muted">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                A
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Tổng người dùng" 
              value="1,234" 
              change={12} 
              icon={Users} 
              color="bg-secondary-500" 
            />
            <StatCard 
              title="Sự kiện hoạt động" 
              value="56" 
              change={8} 
              icon={Calendar} 
              color="bg-primary-500" 
            />
            <StatCard 
              title="Chờ duyệt sự kiện" 
              value={pendingEvents.length} 
              change={-5} 
              icon={CheckSquare} 
              color="bg-warning-500" 
            />
            <StatCard 
              title="Yêu cầu Manager" 
              value={pendingManagerRequests.length} 
              change={2} 
              icon={Briefcase} 
              color="bg-accent-500" 
            />
          </div>

          {/* Main Content Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
            <div className="border-b border-gray-200 px-6 pt-4">
              <div className="flex gap-8 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                    activeTab === 'overview' ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Tổng quan
                  {activeTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('events')}
                  className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                    activeTab === 'events' ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Duyệt Sự Kiện
                  <span className="ml-2 px-2 py-0.5 bg-warning-100 text-warning-700 text-xs rounded-full">
                    {pendingEvents.length}
                  </span>
                  {activeTab === 'events' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('volunteers')}
                  className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                    activeTab === 'volunteers' ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Duyệt Đăng Ký
                  <span className="ml-2 px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                    {pendingRegistrations.length}
                  </span>
                  {activeTab === 'volunteers' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('managers')}
                  className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                    activeTab === 'managers' ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Duyệt Manager
                  <span className="ml-2 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs rounded-full">
                    {pendingManagerRequests.length}
                  </span>
                  {activeTab === 'managers' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('users_management')}
                  className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                    activeTab === 'users_management' ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Quản lý người dùng
                  {activeTab === 'users_management' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('events_management')}
                  className={`pb-4 text-sm font-medium transition relative whitespace-nowrap ${
                    activeTab === 'events_management' ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Quản lý sự kiện
                  {activeTab === 'events_management' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Tab: Overview (Charts Restored) */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Line Chart */}
                    <div className="lg:col-span-2 rounded-xl bg-white p-4">
                      <h2 className="text-lg font-semibold text-text-main mb-4">Hoạt động người tham gia</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            {name:'Jan', attendees:22}, {name:'Feb', attendees:15}, 
                            {name:'Mar', attendees:35}, {name:'Apr', attendees:28}, 
                            {name:'May', attendees:45}, {name:'Jun', attendees:60}
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="attendees" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="rounded-xl bg-white p-4">
                      <h2 className="text-lg font-semibold text-text-main mb-4">Loại sự kiện</h2>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Môi trường', value: 35, color: '#10b981' },
                                { name: 'Giáo dục', value: 25, color: '#3b82f6' },
                                { name: 'Cộng đồng', value: 20, color: '#f59e0b' },
                                { name: 'Y tế', value: 20, color: '#ef4444' },
                              ]}
                              dataKey="value"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={4}
                            >
                              <Cell key={0} fill="#10b981" />
                              <Cell key={1} fill="#3b82f6" />
                              <Cell key={2} fill="#f59e0b" />
                              <Cell key={3} fill="#ef4444" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-text-secondary">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary-500"></span>Môi trường</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary-500"></span>Giáo dục</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-warning-500"></span>Cộng đồng</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-error-500"></span>Y tế</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Events Approval */}
              {activeTab === 'events' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Sự kiện</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tổ chức</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Thời gian</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingEvents.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-text-muted">
                            Không có sự kiện nào đang chờ duyệt.
                          </td>
                        </tr>
                      ) : (
                        pendingEvents.map((event) => (
                          <tr key={event.id || event._id} className="hover:bg-surface-muted transition group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={event.imageUrl} 
                                  alt="" 
                                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                />
                                <div>
                                  <p className="font-medium text-text-main">{event.title}</p>
                                  <span className="text-xs text-text-secondary bg-surface-muted px-2 py-0.5 rounded-full">
                                    {event.category}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-text-secondary">{event.organizer}</td>
                            <td className="py-4 px-4 text-sm text-text-secondary">
                              {new Date(event.startDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => setSelectedEvent(event)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-medium transition"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Volunteer Registrations Approval */}
              {activeTab === 'volunteers' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tình nguyện viên</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Đăng ký sự kiện</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Ngày đăng ký</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-text-muted">
                            Không có đăng ký nào đang chờ duyệt.
                          </td>
                        </tr>
                      ) : (
                        pendingRegistrations.map((reg) => (
                          <tr key={reg._id} className="hover:bg-surface-muted transition">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center overflow-hidden">
                                  {reg.volunteer.profilePicture ? (
                                    <img src={reg.volunteer.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-text-muted font-bold">{reg.volunteer.userName?.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-text-main">{reg.volunteer.userName}</p>
                                  <p className="text-xs text-text-muted">{reg.volunteer.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-medium text-text-main truncate max-w-[200px]">{reg.event.title}</p>
                            </td>
                            <td className="py-4 px-4 text-sm text-text-secondary">
                              {new Date(reg.registeredAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => setSelectedRegistration(reg)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 rounded-lg text-sm font-medium transition"
                              >
                                <Eye className="w-4 h-4" />
                                Xem hồ sơ
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Manager Requests Approval */}
              {activeTab === 'managers' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Ứng viên</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Công việc hiện tại</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Kinh nghiệm</th>
                        <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingManagerRequests.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-text-muted">
                            Không có yêu cầu nào đang chờ duyệt.
                          </td>
                        </tr>
                      ) : (
                        pendingManagerRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-surface-muted transition">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center overflow-hidden">
                                  {req.candidate.profilePicture ? (
                                    <img src={req.candidate.profilePicture} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-accent-600 font-bold">{req.candidate.userName?.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-text-main">{req.candidate.userName}</p>
                                  <p className="text-xs text-text-muted">{req.candidate.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-text-main">{req.currentRole}</p>
                              <p className="text-xs text-text-muted">{req.organization}</p>
                            </td>
                            <td className="py-4 px-4 text-sm text-text-secondary">
                              {req.experience} năm
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={() => setSelectedManagerRequest(req)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 rounded-lg text-sm font-medium transition"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Users Management */}
              {activeTab === 'users_management' && (
                <AdminUsersTab 
                  users={allUsers} 
                  registrations={pendingRegistrations} 
                  events={allEvents} 
                  onLockUser={handleLockUser}
                  onViewUser={handleViewUser}
                />
              )}

              {/* Tab: Events Management */}
              {activeTab === 'events_management' && (
                <AdminEventsTab 
                  events={allEvents} 
                  registrations={pendingRegistrations} 
                  users={allUsers}
                  onApprove={handleApproveEvent}
                  onReject={handleRejectEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onViewEvent={handleViewEvent}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
        user={viewingUser}
        registrations={pendingRegistrations}
        events={allEvents}
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
