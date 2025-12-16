/** @format */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  UserCheck,
  UserX,
  Clock,
  Maximize2,
  Minimize2,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

import { fetchEventAttendances } from "../../features/attendanceSlice";

const AttendanceTable = ({ eventId }) => {
  const dispatch = useDispatch();
  const { byEvent, loading, error } = useSelector((state) => state.attendance);
  const attendances = byEvent[eventId] || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch dữ liệu
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventAttendances(eventId));
    }
  }, [dispatch, eventId]);

  // --- LOGIC FILTER ---
  const filteredAttendances = attendances.filter((att) => {
    const user = att.regId?.userId || {};
    const fullName = `${user.userName || ""} ${
      user.userEmail || ""
    }`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-progress" && att.status === "in-progress") ||
      (statusFilter === "completed" && att.status === "completed") ||
      (statusFilter === "absent" && att.status === "absent");

    return matchesSearch && matchesStatus;
  });

  // --- LOGIC THỐNG KÊ (STATS) ---
  const stats = {
    total: attendances.length,
    inProgress: attendances.filter((a) => a.status === "in-progress").length,
    completed: attendances.filter((a) => a.status === "completed").length,
    absent: attendances.filter((a) => a.status === "absent").length,
  };

  // --- HELPERS ---
  const getStatusConfig = (att) => {
    if (att.status === "completed")
      return {
        label: "Hoàn thành",
        icon: CheckCircle,
        bg: "bg-emerald-100",
        text: "text-emerald-700",
      };
    if (att.status === "in-progress")
      return {
        label: "Đang tham gia",
        icon: UserCheck,
        bg: "bg-blue-100",
        text: "text-blue-700",
      };
    if (att.status === "absent")
      return {
        label: "Vắng mặt",
        icon: UserX,
        bg: "bg-red-100",
        text: "text-red-700",
      };
    return {
      label: "Chưa check-in",
      icon: Clock,
      bg: "bg-gray-100",
      text: "text-gray-600",
    };
  };

  const formatTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const diff = new Date(checkOut) - new Date(checkIn);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}p` : `${mins} phút`;
  };

  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 rounded-xl flex flex-col transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 shadow-2xl" : "relative h-full"
      }`}>
      {/* 1. HEADER & DASHBOARD STATS */}
      <div className='p-6 border-b border-gray-200 bg-white sticky top-0 z-20 rounded-t-xl'>
        {/* Title Row */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-gray-800'>
            Quản lý điểm danh ({stats.total})
          </h2>
          <div className='flex gap-2'>
            <button
              onClick={() => dispatch(fetchEventAttendances(eventId))}
              className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition'
              title='Làm mới'>
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition'
              title={isExpanded ? "Thu nhỏ" : "Phóng to"}>
              {isExpanded ? (
                <Minimize2 className='w-5 h-5' />
              ) : (
                <Maximize2 className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='p-4 rounded-xl bg-gray-50 border border-gray-100'>
            <div className='text-sm text-gray-500 mb-1'>Tổng đăng ký</div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.total}
            </div>
          </div>
          <div className='p-4 rounded-xl bg-blue-50 border border-blue-100'>
            <div className='text-sm text-blue-600 mb-1 flex items-center gap-1'>
              <UserCheck className='w-4 h-4' /> Đang tham gia
            </div>
            <div className='text-2xl font-bold text-blue-700'>
              {stats.inProgress}
            </div>
          </div>
          <div className='p-4 rounded-xl bg-emerald-50 border border-emerald-100'>
            <div className='text-sm text-emerald-600 mb-1 flex items-center gap-1'>
              <CheckCircle className='w-4 h-4' /> Hoàn thành
            </div>
            <div className='text-2xl font-bold text-emerald-700'>
              {stats.completed}
            </div>
          </div>
          <div className='p-4 rounded-xl bg-red-50 border border-red-100'>
            <div className='text-sm text-red-600 mb-1 flex items-center gap-1'>
              <UserX className='w-4 h-4' /> Vắng mặt
            </div>
            <div className='text-2xl font-bold text-red-700'>
              {stats.absent}
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Tìm kiếm theo tên hoặc email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none'
            />
          </div>
          <div className='relative w-full sm:w-48'>
            <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none bg-white cursor-pointer'>
              <option value='all'>Tất cả trạng thái</option>
              <option value='in-progress'>Đang tham gia</option>
              <option value='completed'>Hoàn thành</option>
              <option value='absent'>Vắng mặt</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. TABLE CONTENT */}
      <div className='flex-1 overflow-auto bg-white'>
        {loading ? (
          <div className='flex flex-col items-center justify-center h-64 text-gray-500'>
            <RefreshCw className='w-8 h-8 animate-spin mb-2 text-primary-500' />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center h-64 text-red-500'>
            <XCircle className='w-10 h-10 mb-2' />
            <p>{error}</p>
          </div>
        ) : filteredAttendances.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-64 text-gray-400'>
            <Search className='w-12 h-12 mb-3 opacity-20' />
            <p>Không tìm thấy kết quả nào</p>
          </div>
        ) : (
          <table className='w-full text-left border-collapse'>
            <thead className='bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
              <tr>
                <th className='px-6 py-4 border-b'>Tình nguyện viên</th>
                <th className='px-6 py-4 border-b'>Trạng thái</th>
                <th className='px-6 py-4 border-b'>Vào</th>
                <th className='px-6 py-4 border-b'>Ra</th>
                <th className='px-6 py-4 border-b'>Thời lượng</th>
                <th className='px-6 py-4 border-b'>Đánh giá</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredAttendances.map((att) => {
                const user = att.regId?.userId || {};
                const status = getStatusConfig(att);
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={att._id}
                    className='hover:bg-gray-50 transition-colors'>
                    {/* Cột 1: Thông tin user */}
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0'>
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.userName}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-500 font-bold'>
                              {user.userName?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {user.userName || "Không tên"}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {user.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Trạng thái */}
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <StatusIcon className='w-3.5 h-3.5' />
                        {status.label}
                      </span>
                    </td>

                    {/* Cột 3: Giờ vào */}
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {att.checkIn ? (
                        <span className='font-medium'>
                          {formatTime(att.checkIn)}
                        </span>
                      ) : (
                        <span className='text-gray-400 italic'>--:--</span>
                      )}
                    </td>

                    {/* Cột 4: Giờ ra */}
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {att.checkOut ? (
                        <span className='font-medium'>
                          {formatTime(att.checkOut)}
                        </span>
                      ) : (
                        <span className='text-gray-400 italic'>--:--</span>
                      )}
                    </td>

                    {/* Cột 5: Thời lượng */}
                    <td className='px-6 py-4 text-sm font-medium text-gray-700'>
                      {formatDuration(att.checkIn, att.checkOut)}
                    </td>

                    {/* Cột 6: Đánh giá */}
                    <td className='px-6 py-4'>
                      {att.feedback && att.feedback.rating ? (
                        <div className='flex flex-col'>
                          <div className='flex items-center gap-1 text-yellow-400'>
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < att.feedback.rating
                                    ? "text-yellow-400"
                                    : "text-gray-200"
                                }>
                                ★
                              </span>
                            ))}
                          </div>
                          {att.feedback.comment && (
                            <p
                              className='text-xs text-gray-500 mt-1 truncate max-w-[150px]'
                              title={att.feedback.comment}>
                              "{att.feedback.comment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className='text-xs text-gray-400 italic'>
                          Chưa đánh giá
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
