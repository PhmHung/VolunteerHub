import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock, XCircle, Lock, Unlock } from 'lucide-react';

const AdminUsersTab = ({ users, registrations, events, onLockUser, onViewUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserEvents = (userId) => {
    const userRegs = registrations.filter(reg => reg.userId === userId);
    return userRegs.map(reg => {
      const event = events.find(e => e.id === reg.eventId || e._id === reg.eventId);
      return {
        ...reg,
        eventTitle: event?.title || 'Unknown Event',
        eventDate: event?.date
      };
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Quản lý người dùng</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm người dùng..." 
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
              <th className="px-4 py-3 font-semibold">Người dùng</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3 font-semibold">Tham gia</th>
              <th className="px-4 py-3 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredUsers.map(user => {
              const userEvents = getUserEvents(user._id);
              const acceptedCount = userEvents.filter(e => e.status === 'accepted').length;
              const isLocked = user.status === 'locked';
              
              return (
                <tr key={user._id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isLocked ? 'bg-gray-50/80' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isLocked ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.userName.charAt(0)}
                      </div>
                      <div>
                        <span className={`font-medium block ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                          {user.userName}
                        </span>
                        {isLocked && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wider mt-0.5">
                            <Lock className="w-3 h-3 mr-1" /> Đã khóa
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>{user.userEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isLocked ? 'bg-gray-200 text-gray-500' :
                      user.role === 'manager' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role || 'Volunteer'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {acceptedCount} sự kiện
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onLockUser && onLockUser(user)}
                        className={`p-1.5 rounded-lg transition ${
                          isLocked 
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                        title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      >
                        {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => onViewUser && onViewUser(user)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-emerald-600 transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
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

export default AdminUsersTab;
