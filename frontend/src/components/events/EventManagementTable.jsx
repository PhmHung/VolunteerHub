
/** @format */

import React, { useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Trash2,
  Calendar,
  MapPin,
  Filter,
  Maximize2,
  Minimize2,
} from "lucide-react";

const AdminEventsTab = ({
  events = [],
  registrations = [],
  onApprove,
  onReject,
  onDeleteEvent,
  onViewEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false); // State mở rộng

  // Lọc sự kiện
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPendingCount = (eventId) => {
    return (
      registrations?.filter(
        (reg) => reg.eventId === eventId && reg.status === "pending"
      ).length || 0
    );
  };

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
          {/* Title & Expand Button */}
          <div className='flex items-center gap-3'>
            <h2 className='text-lg font-bold text-gray-900'>Quản lý sự kiện</h2>
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
                placeholder='Tìm sự kiện, địa điểm...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
              />
            </div>

            {/* Filter */}
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none cursor-pointer'>
                <option value='all'>Tất cả</option>
                <option value='pending'>Chờ duyệt</option>
                <option value='approved'>Đã duyệt</option>
                <option value='rejected'>Đã từ chối</option>
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
                <th className='px-4 py-3 font-semibold'>Thông tin sự kiện</th>
                <th className='px-4 py-3 font-semibold'>Người quản lý</th>
                <th className='px-4 py-3 font-semibold'>Trạng thái</th>
                <th className='px-4 py-3 font-semibold'>Thống kê</th>
                <th className='px-4 py-3 font-semibold text-right'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='text-sm divide-y divide-gray-50 bg-white'>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const pendingCount = getPendingCount(event._id || event.id);
                  return (
                    <tr
                      key={event._id || event.id}
                      className='hover:bg-gray-50/80 transition-colors'>
                      {/* Event Info */}
                      <td className='px-4 py-3 max-w-[300px]'>
                        <div
                          className='font-medium text-gray-900 mb-1 truncate'
                          title={event.title}>
                          {event.title}
                        </div>
                        <div className='flex flex-col gap-1 text-xs text-gray-500'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            {event.startDate
                              ? new Date(event.startDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "N/A"}
                          </div>
                          <div className='flex items-center gap-1'>
                            <MapPin className='w-3 h-3' />
                            <span
                              className='truncate max-w-[200px]'
                              title={event.location}>
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Manager */}
                      <td className='px-4 py-3 text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <div className='w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500'>
                            {event.createdBy?.userName?.[0] || (
                              <User className='w-3 h-3' />
                            )}
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium'>
                              {event.createdBy?.userName || "Unknown"}
                            </span>
                            <span className='text-xs text-gray-400'>
                              {event.createdBy?.userEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            event.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : event.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}>
                          {event.status === "approved" ? (
                            <CheckCircle className='w-3 h-3' />
                          ) : event.status === "pending" ? (
                            <Clock className='w-3 h-3' />
                          ) : (
                            <XCircle className='w-3 h-3' />
                          )}
                          {event.status === "approved"
                            ? "Đã duyệt"
                            : event.status === "pending"
                            ? "Chờ duyệt"
                            : "Từ chối"}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className='px-4 py-3 text-gray-600'>
                        <div className='space-y-1'>
                          <div className='text-xs flex items-center gap-1'>
                            <span className='font-semibold'>
                              {event.maxParticipants}
                            </span>{" "}
                            slot
                          </div>
                          {pendingCount > 0 && (
                            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold'>
                              +{pendingCount} đơn mới
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className='px-4 py-3 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          {event.status === "pending" && (
                            <>
                              <button
                                onClick={() => onApprove && onApprove(event)}
                                className='p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-md transition'
                                title='Duyệt'>
                                <CheckCircle className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => onReject && onReject(event)}
                                className='p-1.5 hover:bg-red-50 text-red-600 rounded-md transition'
                                title='Từ chối'>
                                <XCircle className='w-4 h-4' />
                              </button>
                              <div className='w-px h-4 bg-gray-200 mx-1'></div>
                            </>
                          )}
                          <button
                            onClick={() => onViewEvent && onViewEvent(event)}
                            className='p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition'
                            title='Chi tiết'>
                            <Eye className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() =>
                              onDeleteEvent && onDeleteEvent(event)
                            }
                            className='p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-md transition'
                            title='Xóa'>
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan='5' className='py-8 text-center text-gray-500'>
                    Không tìm thấy sự kiện nào phù hợp.
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

export default AdminEventsTab;
