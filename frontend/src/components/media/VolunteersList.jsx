import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Mail, Phone, Award, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { fetchEventRegistrations, acceptRegistration, rejectRegistration } from '../../features/registration/registrationSlice';
import { REGISTRATION_STATUS } from '../../utils/constants';

const VolunteerCard = ({ volunteer, compact }) => {
  if (compact) {
    return (
        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {volunteer.profilePicture ? (
                        <img src={volunteer.profilePicture} alt={volunteer.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                            {volunteer.userName?.charAt(0)?.toUpperCase() || 'V'}
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{volunteer.userName}</h4>
                <p className="text-xs text-gray-500 truncate">{volunteer.role === 'manager' ? 'Quản trị viên' : 'Thành viên'}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {volunteer.profilePicture ? (
            <img 
              src={volunteer.profilePicture} 
              alt={volunteer.userName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
              {volunteer.userName?.charAt(0)?.toUpperCase() || 'V'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 mb-1">{volunteer.userName}</h3>
            {/* Status Badge */}
            {volunteer.status && (
                <RegistrationStatusBadge status={volunteer.status} />
            )}
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{volunteer.userEmail}</span>
            </div>
            
            {volunteer.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{volunteer.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {volunteer.skills && volunteer.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {volunteer.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                >
                  <Award className="w-3 h-3" />
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Registration Date */}
          {volunteer.registeredAt && (
            <div className="mt-2 text-xs text-gray-500">
              Đăng ký: {new Date(volunteer.registeredAt).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RegistrationStatusBadge = ({ status }) => {
  const statusConfig = REGISTRATION_STATUS[status] || REGISTRATION_STATUS.pending;
  
  const icons = {
    pending: <Clock className="w-4 h-4" />,
    accepted: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
    waitlisted: <Clock className="w-4 h-4" />,
  };

  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium text-sm ${colors[statusConfig.color]}`}>
      {icons[status]}
      {statusConfig.label}
    </div>
  );
};

const VolunteersList = ({ eventId, currentUser, user, compact = false }) => {
  const dispatch = useDispatch();
  const { eventRegistrations } = useSelector((state) => state.registration);
  const { events } = useSelector((state) => state.event);
  const { user: authUser } = useSelector((state) => state.auth);
  
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canView, setCanView] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  // Handle both prop names for backward compatibility, fallback to authUser from Redux
  const activeUser = user || currentUser || authUser;

  useEffect(() => {
    const fetchVolunteers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch registrations for this event
        await dispatch(fetchEventRegistrations(eventId)).unwrap();
      } catch (err) {
        if (!compact) {
          setError(err || "Không thể tải danh sách tình nguyện viên");
        }
        setCanView(false);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchVolunteers();
    }
  }, [eventId, dispatch, compact]);

  // Process registrations when they change
  useEffect(() => {
    if (eventRegistrations[eventId]) {
      const registrations = eventRegistrations[eventId];
      
      // Check if user is creator
      const event = events.find(e => e.id === eventId || e._id === eventId);
      const creator = event && (event.createdBy === activeUser?._id || event.createdBy?._id === activeUser?._id);
      setIsCreator(creator);

      if (compact) {
        // For compact view, show only accepted members
        const accepted = registrations.filter(v => v.status === 'accepted');
        setVolunteers(accepted);
        setCanView(true);
      } else {
        // Check if user has access (is creator or is accepted)
        const currentUserReg = registrations.find(
          (reg) => reg.userId === activeUser?._id || reg.userId?._id === activeUser?._id
        );
        const isAccepted = currentUserReg && currentUserReg.status === "accepted";
        
        if (creator || isAccepted) {
          setCanView(true);
          setVolunteers(registrations);
        } else {
          setCanView(false);
        }
      }
    }
  }, [eventRegistrations, eventId, events, activeUser, compact]);

  const handleAccept = async (registrationId) => {
    try {
      await dispatch(acceptRegistration(registrationId)).unwrap();
      // Refresh list
      dispatch(fetchEventRegistrations(eventId));
    } catch (err) {
      alert(err);
    }
  };

  const handleReject = async (registrationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối tình nguyện viên này?")) return;
    try {
      await dispatch(rejectRegistration({ registrationId, reason: "Bị từ chối bởi quản trị viên" })).unwrap();
      // Refresh list
      dispatch(fetchEventRegistrations(eventId));
    } catch (err) {
      alert(err);
    }
  };

  if (loading) {
    if (compact) return <div className="p-4 text-center text-xs text-gray-500">Đang tải...</div>;
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-500">Đang tải danh sách...</p>
        </div>
      </div>
    );
  }

  if (compact) {
      return (
          <div className="space-y-1">
              {volunteers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Chưa có thành viên nào</p>
              ) : (
                  volunteers.map(volunteer => (
                      <VolunteerCard key={volunteer.id || volunteer._id} volunteer={volunteer} compact={true} />
                  ))
              )}
          </div>
      );
  }

  // Nếu chưa được accept
  if (error || !canView) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa thể xem danh sách tình nguyện viên
          </h3>
          <p className="text-gray-600 mb-4">
            {error || 'Bạn cần được chấp nhận tham gia sự kiện trước khi có thể xem danh sách các tình nguyện viên khác.'}
          </p>
          <RegistrationStatusBadge status="pending" />
        </div>
      </div>
    );
  }

  // Nếu đã accepted nhưng chưa có ai
  if (volunteers.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có tình nguyện viên nào
          </h3>
          <p className="text-gray-500">
            Bạn là người đầu tiên được chấp nhận tham gia sự kiện này!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Danh sách tình nguyện viên</h2>
            <p className="text-sm text-gray-500">
              {volunteers.length} người {isCreator ? 'đăng ký' : 'đã được chấp nhận'}
            </p>
          </div>
        </div>
        {!isCreator && <RegistrationStatusBadge status="accepted" />}
      </div>

      <div className="space-y-3">
        {volunteers.map((volunteer) => (
          <VolunteerCard 
            key={volunteer._id} 
            volunteer={volunteer} 
            isCreator={isCreator}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
};

export default VolunteersList;
