import React from 'react';
import { XCircle, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';

const UserDetailModal = ({ user, registrations, events, onClose, onEventClick }) => {
  if (!user) return null;

  const getUserEvents = (userId) => {
    const userRegs = registrations.filter(reg => reg.userId === userId);
    return userRegs.map(reg => {
      const event = events.find(e => e.id === reg.eventId || e._id === reg.eventId);
      return {
        ...reg,
        event: event,
        eventTitle: event?.title || 'Unknown Event',
        eventDate: event?.date || event?.startDate
      };
    });
  };

  const userEvents = getUserEvents(user._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
              {user.userName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.userName}</h3>
              <p className="text-gray-500">{user.userEmail}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'manager' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role || 'Volunteer'}
                </span>
                {user.status === 'locked' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Đã khóa
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Lịch sử tham gia sự kiện
          </h4>
          
          <div className="space-y-3">
            {userEvents.length > 0 ? (
              userEvents.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => item.event && onEventClick && onEventClick(item.event)}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all ${item.event && onEventClick ? 'cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 group' : ''}`}
                >
                  <div>
                    <p className={`font-medium text-gray-900 ${item.event && onEventClick ? 'group-hover:text-emerald-700' : ''}`}>
                      {item.eventTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.eventDate ? new Date(item.eventDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'accepted' ? 'Đã tham gia' :
                     item.status === 'pending' ? 'Chờ duyệt' :
                     'Bị từ chối'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">Chưa tham gia sự kiện nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
