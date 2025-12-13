import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, CheckCircle, XCircle, Clock, Mail, Phone, 
  Award, AlertTriangle, Search, Filter, RefreshCw 
} from 'lucide-react';
import { 
  fetchPendingRegistrations,
  acceptRegistration, 
  rejectRegistration 
} from '../../features/registration/registrationSlice';
import { fetchAllUsers } from '../../features/user/userSlice';
import { fetchEvents } from '../../features/event/eventSlice';
import { REGISTRATION_STATUS } from '../../utils/constants';

const RegistrationCard = ({ registration, volunteer, event, onAccept, onReject }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    await onAccept(registration._id);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    const reason = prompt('Lý do từ chối (tùy chọn):');
    await onReject(registration._id, reason);
    setIsProcessing(false);
  };

  const statusConfig = REGISTRATION_STATUS[registration.status];

  return (
    <div className="card p-5 rounded-lg border border-border hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {/* Volunteer Avatar */}
        <div className="flex-shrink-0">
          {volunteer?.profilePicture ? (
            <img 
              src={volunteer.profilePicture} 
              alt={volunteer.userName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center text-white font-bold text-xl">
              {volunteer?.userName?.charAt(0)?.toUpperCase() || 'V'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-bold text-text-main text-lg mb-1">
                {volunteer?.userName || 'Tình nguyện viên'}
              </h3>
              <p className="text-sm text-text-secondary mb-2">
                Đăng ký cho: <span className="font-medium text-text-main">{event?.title}</span>
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium
              ${statusConfig.color === 'amber' ? 'bg-warning-50 text-warning-700 border-warning-200' : ''}
              ${statusConfig.color === 'emerald' ? 'bg-success-50 text-success-700 border-success-200' : ''}
              ${statusConfig.color === 'red' ? 'bg-error-50 text-error-700 border-error-200' : ''}
            `}>
              {registration.status === 'pending' && <Clock className="w-4 h-4" />}
              {registration.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
              {registration.status === 'rejected' && <XCircle className="w-4 h-4" />}
              {statusConfig.label}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5 text-sm text-text-secondary mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{volunteer?.userEmail}</span>
            </div>
            
            {volunteer?.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{volunteer.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {volunteer?.skills && volunteer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {volunteer.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 text-text-secondary text-xs rounded-full"
                >
                  <Award className="w-3 h-3" />
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Registration Date */}
          <div className="text-xs text-text-muted mb-4">
            Đăng ký lúc: {new Date(registration.registeredAt).toLocaleString('vi-VN')}
          </div>

          {/* Actions */}
          {registration.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Chấp nhận
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageRegistrations = () => {
  const dispatch = useDispatch();
  const { pendingRegistrations, pendingLoading } = useSelector((state) => state.registration);
  const { allUsers } = useSelector((state) => state.user);
  const { events } = useSelector((state) => state.event);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine pending and other registrations for display
  const registrations = useMemo(() => {
    // For now use pendingRegistrations - backend should provide all registrations for admin
    return pendingRegistrations;
  }, [pendingRegistrations]);

  // Load registrations khi component mount
  useEffect(() => {
    dispatch(fetchPendingRegistrations());
    dispatch(fetchAllUsers());
    dispatch(fetchEvents());
  }, [dispatch]);

  const loadRegistrations = () => {
    dispatch(fetchPendingRegistrations());
    dispatch(fetchAllUsers());
    dispatch(fetchEvents());
  };

  const handleAcceptRegistration = async (registrationId) => {
    try {
      await dispatch(acceptRegistration(registrationId)).unwrap();
      loadRegistrations(); // Reload danh sách
    } catch (error) {
      alert(`Lỗi: ${error}`);
    }
  };

  const handleRejectRegistration = async (registrationId, reason) => {
    try {
      await dispatch(rejectRegistration({ registrationId, reason: reason || "Bị từ chối" })).unwrap();
      loadRegistrations(); // Reload danh sách
    } catch (error) {
      alert(`Lỗi: ${error}`);
    }
  };

  // Helper to find volunteer by userId
  const findVolunteer = (userId) => {
    if (!userId) return null;
    const id = typeof userId === 'object' ? userId._id : userId;
    return allUsers.find(v => v._id === id);
  };

  // Helper to find event by eventId
  const findEvent = (eventId) => {
    if (!eventId) return null;
    const id = typeof eventId === 'object' ? eventId._id : eventId;
    return events.find(e => e._id === id || e.id === id);
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    // Filter by status
    if (filterStatus !== 'all' && reg.status !== filterStatus) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const volunteer = findVolunteer(reg.userId);
      const event = findEvent(reg.eventId);
      const searchLower = searchQuery.toLowerCase();
      
      return (
        volunteer?.userName?.toLowerCase().includes(searchLower) ||
        volunteer?.userEmail?.toLowerCase().includes(searchLower) ||
        event?.title?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    accepted: registrations.filter(r => r.status === 'accepted').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2">Quản lý đăng ký tham gia</h1>
          <p className="text-text-secondary">Duyệt và quản lý các yêu cầu đăng ký từ tình nguyện viên</p>
        </div>
        <button
          onClick={loadRegistrations}
          className="flex items-center gap-2 px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Tổng cộng</p>
              <p className="text-2xl font-bold text-text-main">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Chờ duyệt</p>
              <p className="text-2xl font-bold text-text-main">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Đã chấp nhận</p>
              <p className="text-2xl font-bold text-text-main">{stats.accepted}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Đã từ chối</p>
              <p className="text-2xl font-bold text-text-main">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 rounded-lg border border-border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc sự kiện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="accepted">Đã chấp nhận</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {pendingLoading ? (
          <div className="card p-12 rounded-lg border border-border text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-text-secondary">Đang tải...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="card p-12 rounded-lg border border-border text-center">
            <AlertTriangle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-main mb-2">Không tìm thấy đăng ký nào</h3>
            <p className="text-text-secondary">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        ) : (
          filteredRegistrations.map(registration => {
            const volunteer = findVolunteer(registration.userId);
            const event = findEvent(registration.eventId);
            
            return (
              <RegistrationCard
                key={registration._id}
                registration={registration}
                volunteer={volunteer}
                event={event}
                onAccept={handleAcceptRegistration}
                onReject={handleRejectRegistration}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManageRegistrations;
