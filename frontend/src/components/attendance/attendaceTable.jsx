/** @format */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Calendar,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";

import { fetchEventAttendances } from "../../features/attendanceSlice";

const AttendanceTable = ({ eventId }) => {
  const dispatch = useDispatch();

  const { byEvent, loading, error } = useSelector((state) => state.attendance);

  const attendances = byEvent[eventId] || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch danh sách điểm danh khi component mount hoặc eventId thay đổi
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventAttendances(eventId));
    }
  }, [dispatch, eventId]);

  // Lọc theo tên/email và trạng thái điểm danh
  const filteredAttendances = attendances.filter((att) => {
    const user = att.regId?.userId || {};
    const fullName = `${user.userName || ""} ${
      user.userEmail || ""
    }`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checkedIn" && att.checkIn) ||
      (statusFilter === "completed" && att.status === "completed") ||
      (statusFilter === "absent" && att.status === "absent");

    return matchesSearch && matchesStatus;
  });

  // Tính thống kê nhanh
  const stats = {
    total: attendances.length,
    checkedIn: attendances.filter((a) => a.checkIn).length,
    completed: attendances.filter((a) => a.status === "completed").length,
    absent: attendances.filter((a) => a.status === "absent").length,
  };

  const getStatusConfig = (att) => {
    if (att.status === "completed")
      return {
        label: "Hoàn thành",
        icon: CheckCircle,
        color: "emerald",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    if (att.checkIn)
      return {
        label: "Đã vào",
        icon: UserCheck,
        color: "blue",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    if (att.status === "absent")
      return {
        label: "Vắng",
        icon: UserX,
        color: "red",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    return {
      label: "Chưa vào",
      icon: Clock,
      color: "amber",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    };
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const diff = new Date(checkOut) - new Date(checkIn);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}p` : ""}`;
  };

  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${
        isExpanded ? "fixed inset-4 z-50 rounded-2xl" : "relative h-full"
      }`}>
      {/* Header */}
      <div className='sticky top-0 z-40 bg-white border-b border-gray-200 p-6 flex-none shadow-sm'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-gray-900'>
              Điểm danh tình nguyện viên
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition'>
              {isExpanded ? (
                <Minimize2 className='w-5 h-5' />
              ) : (
                <Maximize2 className='w-5 h-5' />
              )}
            </button>
            <button
              onClick={() => dispatch(fetchEventAttendances(eventId))}
              className='p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition'
              disabled={loading}>
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Tìm tên, email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
              />
            </div>

            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white appearance-none cursor-pointer'>
                <option value='all'>Tất cả trạng thái</option>
                <option value='checkedIn'>Đã vào</option>
                <option value='completed'>Hoàn thành</option>
                <option value='absent'>Vắng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4'>
          <div className='bg-gray-50 rounded-lg p-3 text-center'>
            <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
            <p className='text-xs text-gray-500'>Tổng đăng ký</p>
          </div>
          <div className='bg-blue-50 rounded-lg p-3 text-center'>
            <p className='text-2xl font-bold text-blue-700'>
              {stats.checkedIn}
            </p>
            <p className='text-xs text-gray-500'>Đã điểm danh vào</p>
          </div>
          <div className='bg-emerald-50 rounded-lg p-3 text-center'>
            <p className='text-2xl font-bold text-emerald-700'>
              {stats.completed}
            </p>
            <p className='text-xs text-gray-500'>Hoàn thành</p>
          </div>
          <div className='bg-red-50 rounded-lg p-3 text-center'>
            <p className='text-2xl font-bold text-red-700'>{stats.absent}</p>
            <p className='text-xs text-gray-500'>Vắng</p>
          </div>
        </div>
      </div>

      {/* Body - Scroll */}
      <div className='flex-1 overflow-y-auto bg-gray-50'>
        <div className='p-6'>
          {loading ? (
            <div className='text-center py-12'>
              <RefreshCw className='w-8 h-8 text-primary-600 animate-spin mx-auto' />
              <p className='mt-3 text-gray-600'>
                Đang tải danh sách điểm danh...
              </p>
            </div>
          ) : error ? (
            <div className='text-center py-12 text-red-600'>
              <XCircle className='w-12 h-12 mx-auto mb-3' />
              <p>{error}</p>
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className='text-center py-16 text-gray-500'>
              <UserCheck className='w-16 h-16 mx-auto text-gray-300 mb-4' />
              <p className='text-lg font-medium'>Không có dữ liệu điểm danh</p>
              <p className='text-sm mt-2'>
                Thử thay đổi bộ lọc hoặc làm mới dữ liệu
              </p>
            </div>
          ) : (
            <div className='grid gap-4'>
              {filteredAttendances.map((att) => {
                const user = att.regId?.userId || {};
                const status = getStatusConfig(att);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={att._id}
                    className='bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow'>
                    <div className='flex flex-col lg:flex-row justify-between items-start gap-4'>
                      <div className='flex items-center gap-4 flex-1'>
                        <div className='w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0'>
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.userName}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg'>
                              {user.userName?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-900'>
                            {user.userName || "Không rõ"}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {user.userEmail || "-"}
                          </p>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-500'>Vào</p>
                          <p className='font-medium'>
                            {formatTime(att.checkIn)}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Ra</p>
                          <p className='font-medium'>
                            {formatTime(att.checkOut)}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Thời gian</p>
                          <p className='font-medium'>
                            {formatDuration(att.checkIn, att.checkOut)}
                          </p>
                        </div>
                        <div className='flex items-end'>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                            <StatusIcon className='w-4 h-4' />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {att.feedback && (
                      <div className='mt-4 pt-4 border-t border-gray-100'>
                        <p className='text-sm font-medium text-gray-700 mb-1'>
                          Đánh giá:
                        </p>
                        <div className='flex items-center gap-2'>
                          <div className='flex'>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-lg ${
                                  star <= att.feedback.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}>
                                ★
                              </span>
                            ))}
                          </div>
                          {att.feedback.comment && (
                            <p className='text-sm text-gray-600 italic'>
                              "{att.feedback.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
