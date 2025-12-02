import React, { useState } from 'react';
import { Search, Eye, CheckCircle, Clock, XCircle, Users, User, Trash2 } from 'lucide-react';

const AdminEventsTab = ({ events, registrations, users, onApprove, onReject, onDeleteEvent, onViewEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventParticipants = (eventId) => {
    const eventRegs = registrations.filter(reg => reg.eventId === eventId);
    return eventRegs.map(reg => {
      const user = users.find(u => u._id === reg.userId) || { userName: 'Unknown', userEmail: 'unknown' };
      return {
        ...reg,
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Quản lý sự kiện</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sự kiện..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 bg-gray-50">
              <th className="px-4 py-3 font-semibold">Sự kiện</th>
              <th className="px-4 py-3 font-semibold">Người quản lý</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Tham gia</th>
              <th className="px-4 py-3 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredEvents.map(event => {
              const participants = getEventParticipants(event.id || event._id);
              const acceptedCount = participants.filter(p => p.status === 'accepted').length;
              const pendingCount = participants.filter(p => p.status === 'pending').length;
              
              return (
                <tr key={event.id || event._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1" title={event.title}>
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {getManagerName(event.createdBy)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      event.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {event.status === 'approved' ? 'Đã duyệt' : 
                       event.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600" title="Đã tham gia">
                        <CheckCircle className="w-3 h-3" /> {acceptedCount}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600" title="Chờ duyệt">
                        <Clock className="w-3 h-3" /> {pendingCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {event.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => onApprove && onApprove(event)}
                            className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition"
                            title="Duyệt sự kiện"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onReject && onReject(event)}
                            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition"
                            title="Từ chối sự kiện"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => onViewEvent && onViewEvent(event)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-emerald-600 transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteEvent && onDeleteEvent(event)}
                        className="p-1.5 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600 transition"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEventsTab;
