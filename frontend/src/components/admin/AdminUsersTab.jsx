/** @format */

import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";

const AdminUsersTab = ({
  users = [],
  onViewUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false); // State mở rộng

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      user.userName?.toLowerCase().includes(search) ||
      user.userEmail?.toLowerCase().includes(search) ||
      user.phoneNumber?.includes(search);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 transition-all duration-300 flex flex-col ${
        isExpanded
          ? "fixed inset-0 z-50 rounded-none h-screen"
          : "relative rounded-xl h-full"
      }`}>
      {/* --- HEADER & FILTERS --- */}
      <div className='p-6 border-b border-gray-100 flex-none bg-white'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          {/* Title & Expand */}
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-bold text-gray-900'>
              Quản lý người dùng
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition'
              title={isExpanded ? "Thu gọn" : "Mở rộng"}>
              {isExpanded ? (
                <Minimize2 className='w-5 h-5' />
              ) : (
                <Maximize2 className='w-5 h-5' />
              )}
            </button>
          </div>

          <div className='flex gap-2 w-full sm:w-auto'>
            {/* Search */}
            <div className='relative flex-1 sm:flex-none'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Tìm tên, email, sđt...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all'
              />
            </div>

            {/* Filter */}
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className='pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none cursor-pointer'>
                <option value='all'>Tất cả vai trò</option>
                <option value='volunteer'>Tình nguyện viên</option>
                <option value='manager'>Quản lý (Manager)</option>
                <option value='admin'>Quản trị viên</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE CONTENT (SCROLLABLE) --- */}
      <div
        className='flex-1 overflow-y-auto bg-white p-6 pt-0'
        style={{ maxHeight: isExpanded ? "calc(100vh - 80px)" : "600px" }}>
        <div className='border border-gray-100 rounded-lg overflow-hidden mt-6'>
          <table className='w-full text-left border-collapse'>
            <thead className='sticky top-0 z-10'>
              <tr className='border-b border-gray-100 text-xs uppercase text-gray-500 bg-gray-50'>
                <th className='px-4 py-3 font-semibold'>
                  Thông tin người dùng
                </th>
                <th className='px-4 py-3 font-semibold'>Vai trò</th>
                <th className='px-4 py-3 font-semibold'>Trạng thái</th>
                <th className='px-4 py-3 font-semibold'>Ngày tham gia</th>
                <th className='px-4 py-3 font-semibold text-right'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='text-sm divide-y divide-gray-50 bg-white'>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className='hover:bg-gray-50/80 transition-colors'>
                    {/* User Info */}
                    <td className='px-4 py-3 max-w-[280px]'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden'>
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            (user.userName?.[0] || "U").toUpperCase()
                          )}
                        </div>
                        <div className='flex flex-col min-w-0'>
                          <span className='font-medium text-gray-900 truncate'>
                            {user.userName}
                          </span>
                          <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <span className='flex items-center gap-1 truncate'>
                              <Mail className='w-3 h-3' /> {user.userEmail}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : user.role === "manager"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                        <Shield className='w-3 h-3' />
                        {user.role === "admin"
                          ? "Admin"
                          : user.role === "manager"
                          ? "Manager"
                          : "Volunteer"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                        {user.status === "active" ? (
                          <CheckCircle className='w-3 h-3' />
                        ) : (
                          <XCircle className='w-3 h-3' />
                        )}
                        {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className='px-4 py-3 text-gray-600'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-xs font-medium'>
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span className='text-[10px] text-gray-400'>
                          {new Date(user.createdAt).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className='px-4 py-3 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => onViewUser(user)}
                          className='p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition'
                          title='Xem chi tiết'>
                          <Eye className='w-4 h-4' />
                        </button>
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() => onToggleUserStatus(user)}
                              className={`p-1.5 rounded-md transition ${
                                user.status === "active"
                                  ? "hover:bg-amber-50 text-amber-600"
                                  : "hover:bg-emerald-50 text-emerald-600"
                              }`}
                              title={
                                user.status === "active" ? "Khóa" : "Mở khóa"
                              }>
                              {user.status === "active" ? (
                                <Lock className='w-4 h-4' />
                              ) : (
                                <Unlock className='w-4 h-4' />
                              )}
                            </button>
                            <button
                              onClick={() => onDeleteUser(user)}
                              className='p-1.5 hover:bg-red-50 text-red-600 rounded-md transition'
                              title='Xóa'>
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='5' className='py-8 text-center text-gray-500'>
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTab;
