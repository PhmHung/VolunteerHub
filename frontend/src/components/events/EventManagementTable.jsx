/** @format */

import React, { useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Filter,
  Maximize2,
  Minimize2,
} from "lucide-react";

const EventManagementTable = ({
  events = [],
  registrations = [],
  onApprove,
  onReject,
  onDeleteEvent,
  onViewEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Tính số đơn chờ duyệt
  const getPendingCount = (eventId) => {
    return registrations.filter(
      (reg) =>
        (reg.eventId?._id || reg.eventId || reg.event?._id) === eventId &&
        (reg.status === "pending" || reg.status === "waitlisted")
    ).length;
  };

  // Lọc sự kiện
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Đã duyệt",
          icon: CheckCircle,
          color: "emerald",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          icon: Clock,
          color: "amber",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
        };
      default:
        return {
          label: "Từ chối",
          icon: XCircle,
          color: "red",
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
        };
    }
  };

  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 transition-all duration-300 flex flex-col rounded-xl overflow-hidden ${
        isExpanded ? "fixed inset-4 z-50 rounded-2xl" : "relative h-full"
      }`}>
      {/* HEADER - CỐ ĐỊNH KHI SCROLL */}
      <div className='sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex-none'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-gray-900'>
              Quản lý sự kiện tình nguyện
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition'
              title={isExpanded ? "Thu gọn" : "Mở rộng toàn màn hình"}>
              {isExpanded ? (
                <Minimize2 className='w-5 h-5' />
              ) : (
                <Maximize2 className='w-5 h-5' />
              )}
            </button>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Tìm tên sự kiện, địa điểm...'
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
                <option value='pending'>Chờ duyệt</option>
                <option value='approved'>Đã duyệt</option>
                <option value='rejected'>Đã từ chối</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BODY - SCROLL ĐỘC LẬP */}
      <div className='flex-1 overflow-y-auto bg-gray-50'>
        <div className='p-6'>
          {filteredEvents.length > 0 ? (
            <div className='grid gap-5'>
              {filteredEvents.map((event) => {
                const pendingCount = getPendingCount(event._id || event.id);
                const status = getStatusConfig(event.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={event._id || event.id}
                    className='bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200'>
                    <div className='flex flex-col lg:flex-row justify-between gap-6'>
                      {/* Thông tin chính */}
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-4'>
                          <h3 className='text-lg font-semibold text-gray-900 line-clamp-1'>
                            {event.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                            <StatusIcon className='w-4 h-4' />
                            {status.label}
                          </span>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4 text-gray-500 flex-shrink-0' />
                            <span>
                              {event.startDate
                                ? new Date(event.startDate).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "Chưa xác định"}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-gray-500 flex-shrink-0' />
                            <span className='truncate'>
                              {event.location || "Chưa có địa điểm"}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Users className='w-4 h-4 text-gray-500 flex-shrink-0' />
                            <span>
                              Tối đa {event.maxParticipants || "?"} tình nguyện
                              viên
                            </span>
                          </div>
                        </div>

                        {pendingCount > 0 && (
                          <div className='mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold'>
                            <Clock className='w-4 h-4' />
                            {pendingCount} đơn đăng ký mới
                          </div>
                        )}
                      </div>

                      {/* Nút hành động */}
                      <div className='flex items-center gap-3 self-start lg:self-center'>
                        {event.status === "pending" && (
                          <>
                            <button
                              onClick={() => onApprove(event)}
                              className='p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition'
                              title='Duyệt sự kiện'>
                              <CheckCircle className='w-5 h-5' />
                            </button>
                            <button
                              onClick={() => onReject(event)}
                              className='p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition'
                              title='Từ chối'>
                              <XCircle className='w-5 h-5' />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onViewEvent(event)}
                          className='p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition'
                          title='Xem chi tiết'>
                          <Eye className='w-5 h-5' />
                        </button>

                        <button
                          onClick={() => onDeleteEvent(event)}
                          className='p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition'
                          title='Xóa sự kiện'>
                          <Trash2 className='w-5 h-5' />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-center py-20 text-gray-500'>
              <Calendar className='w-16 h-16 mx-auto text-gray-300 mb-4' />
              <p className='text-lg font-medium'>Không tìm thấy sự kiện nào</p>
              <p className='text-sm mt-2'>Thử thay đổi từ khóa hoặc bộ lọc</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventManagementTable;
