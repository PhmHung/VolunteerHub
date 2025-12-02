import React from 'react';
import { XCircle, CheckCircle, Clock, User, Mail, MapPin, Calendar } from 'lucide-react';

const EventDetailModal = ({ event, registrations, users, onClose, onUserClick }) => {
  if (!event) return null;

  const getEventParticipants = (eventId) => {
    const eventRegs = registrations.filter(reg => reg.eventId === eventId);
    return eventRegs.map(reg => {
      const user = users.find(u => u._id === reg.userId) || { userName: 'Unknown', userEmail: 'unknown' };
      return {
        ...reg,
        user: user,
        userName: user.userName,
        userEmail: user.userEmail,
        userAvatar: user.profilePicture
      };
    });
  };

  const getManagerName = (managerId) => {
    if (!managerId) return 'N/A';
    const manager = users.find(u => u._id === managerId);
    return manager ? manager.userName : 'Unknown Manager';
  };

  const participants = getEventParticipants(event.id || event._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Quản lý bởi: <span className="font-medium text-gray-900">{getManagerName(event.createdBy)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(event.date || event.startDate).toLocaleDateString('vi-VN')}
              </span>
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
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Danh sách người tham gia ({participants.length})
            </h4>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                <CheckCircle className="w-3 h-3" /> Đã tham gia
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                <Clock className="w-3 h-3" /> Chờ duyệt
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {participants.length > 0 ? (
              participants.map((participant, idx) => (
                <div 
                  key={idx} 
                  onClick={() => participant.user && onUserClick && onUserClick(participant.user)}
                  className={`flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 transition-all ${participant.user && onUserClick ? 'cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 group' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shadow-sm">
                      {participant.userName.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-medium text-gray-900 ${participant.user && onUserClick ? 'group-hover:text-emerald-700' : ''}`}>
                        {participant.userName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {participant.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    participant.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                    participant.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {participant.status === 'accepted' ? 'Đã tham gia' :
                     participant.status === 'pending' ? 'Chờ duyệt' :
                     'Bị từ chối'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">Chưa có người tham gia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
