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
  Filter,
  Maximize2,
  Minimize2,
  FileX,
  Ban,
  AlertTriangle,
  Edit,
} from "lucide-react";

const EventManagementTable = ({
  events = [],
  registrations = [], // Dữ liệu đăng ký từ Redux (đã cập nhật status)
  cancelRequests = [],
  onApprove,
  onReject,
  onDeleteEvent,
  onViewEvent,
  onCancelEvent,
  onApproveCancellation,
  onRejectCancellation,
  onEditEvent,
  highlightedId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Helper tính số lượng chờ duyệt (Pending)
  const getPendingCount = (eventId) => {
    return registrations.filter(
      (reg) =>
        (reg.eventId?._id || reg.eventId || reg.event?._id) === eventId &&
        (reg.status === "pending" || reg.status === "waitlisted")
    ).length;
  };

  // 2. Helper tính số lượng ĐÃ DUYỆT (Registered / Approved)
  // Hàm này giúp số liệu cập nhật Real-time khi Manager duyệt đơn
  const getApprovedCount = (eventId) => {
    return registrations.filter(
      (reg) =>
        (reg.eventId?._id || reg.eventId || reg.event?._id) === eventId &&
        (reg.status === "registered" || reg.status === "approved")
    ).length;
  };

  // Filter Data
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower);
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  React.useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(`event-row-${highlightedId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedId]);

  // Config Status UI
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Đang chạy",
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: CheckCircle,
        };
      case "pending":
        return {
          label: "Chờ duyệt",
          bg: "bg-amber-100",
          text: "text-amber-700",
          icon: Clock,
        };
      case "cancel_pending":
        return {
          label: "Yêu cầu hủy",
          bg: "bg-orange-100",
          text: "text-orange-700",
          icon: Ban,
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: Ban,
        };
      case "rejected":
        return {
          label: "Từ chối",
          bg: "bg-red-100",
          text: "text-red-700",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-gray-100",
          text: "text-gray-600",
          icon: Clock,
        };
    }
  };

  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 flex flex-col rounded-xl overflow-hidden transition-all duration-300 ${
        isExpanded
          ? "fixed inset-4 z-50 rounded-2xl shadow-2xl"
          : "relative h-full"
      }`}>
      {/* HEADER: TOOLBAR */}
      <div className='p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-bold text-gray-800'>Danh sách sự kiện</h2>
          <span className='px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium'>
            {filteredEvents.length}
          </span>
        </div>

        <div className='flex gap-3 w-full sm:w-auto'>
          <div className='relative flex-1 sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Tìm kiếm...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition'
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer'>
            <option value='all'>Tất cả</option>
            <option value='approved'>Đang chạy</option>
            <option value='pending'>Chờ duyệt</option>
            <option value='cancel_pending'>Chờ hủy</option>
            <option value='cancelled'>Đã hủy</option>
            <option value='rejected'>Bị từ chối</option>
          </select>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition border border-gray-200'>
            {isExpanded ? (
              <Minimize2 className='w-4 h-4' />
            ) : (
              <Maximize2 className='w-4 h-4' />
            )}
          </button>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className='flex-1 overflow-auto bg-white custom-scrollbar'>
        {/* KHỐI CẢNH BÁO YÊU CẦU HỦY */}
        {cancelRequests.length > 0 && (
          <div className='m-6 p-4 bg-red-50 border border-red-100 rounded-xl mb-6'>
            <h3 className='text-sm font-bold text-red-800 flex items-center gap-2 mb-3 uppercase tracking-wider'>
              <AlertTriangle className='w-4 h-4' /> Yêu cầu hủy cần duyệt (
              {cancelRequests.length})
            </h3>
            <div className='grid gap-3'>
              {cancelRequests.map((req) => (
                <div
                  key={req._id}
                  className='bg-white p-3 rounded-lg border border-red-100 shadow-sm flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-gray-900 text-sm'>
                      {req.event?.title}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      Lý do: <span className='italic'>"{req.reason}"</span>
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => onApproveCancellation(req)}
                      className='px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition'>
                      Duyệt Hủy
                    </button>
                    <button
                      onClick={() => onRejectCancellation(req)}
                      className='px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded hover:bg-gray-200 transition'>
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BẢNG CHÍNH */}
        {filteredEvents.length > 0 ? (
          <table className='w-full text-left border-collapse'>
            <thead className='bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider shadow-sm'>
              <tr>
                <th className='px-6 py-4 border-b border-gray-200 w-[35%] bg-gray-50'>
                  Sự kiện
                </th>
                <th className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
                  Thời gian & Địa điểm
                </th>
                <th className='px-6 py-4 border-b border-gray-200 text-center bg-gray-50'>
                  Số lượng
                </th>
                <th className='px-6 py-4 border-b border-gray-200 text-center bg-gray-50'>
                  Trạng thái
                </th>
                <th className='px-6 py-4 border-b border-gray-200 text-right bg-gray-50'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredEvents.map((event) => {
                const statusInfo = getStatusConfig(event.status);
                const StatusIcon = statusInfo.icon;

                // Tính toán số liệu
                const pendingCount = getPendingCount(event._id);
                // 👇 DÙNG HÀM NÀY THAY VÌ event.registeredCount ĐỂ CẬP NHẬT LIVE
                const registered = getApprovedCount(event._id);
                const max = event.maxParticipants || 1;
                const percent = Math.min((registered / max) * 100, 100);
                const isFull = registered >= max;

                const isCancelPending = event.status === "cancel_pending";
                const isPending = event.status === "pending";
                const isHighlighted = event._id === highlightedId;
                return (
                  <tr
                    key={event._id}
                    id={`event-row-${event._id}`}
                    //className='hover:bg-gray-50/80 transition-colors group'>
                    className={`transition-all duration-500 group ${
                      isHighlighted
                        ? "bg-blue-50/80 ring-2 ring-blue-500 ring-inset z-10 relative shadow-md"
                        : "hover:bg-gray-50/80"
                    }`}>
                    {/* Cột 1: Tên sự kiện */}
                    <td className='px-6 py-4 align-top'>
                      <div className='flex gap-3'>
                        <div
                          className={`w-1 rounded-full self-stretch shrink-0 ${
                            isCancelPending
                              ? "bg-red-500"
                              : isPending
                              ? "bg-amber-400"
                              : "bg-transparent"
                          }`}></div>

                        <div className='flex-1 min-w-0'>
                          <p
                            className='font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600 transition-colors'
                            title={event.title}>
                            {event.title}
                          </p>
                          <div className='flex flex-wrap gap-2 mt-1.5'>
                            {pendingCount > 0 &&
                              event.status === "approved" && (
                                <span className='inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100'>
                                  <Clock className='w-3 h-3' /> {pendingCount}{" "}
                                  đơn mới
                                </span>
                              )}
                            {isCancelPending && (
                              <span className='text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded border border-red-100'>
                                ⚠️ Đang yêu cầu hủy
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Thời gian & Địa điểm */}
                    <td className='px-6 py-4 align-top'>
                      <div className='flex flex-col gap-1.5 text-sm text-gray-500'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-3.5 h-3.5 shrink-0 text-gray-400' />
                          <span>
                            {new Date(event.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-3.5 h-3.5 shrink-0 text-gray-400' />
                          <span
                            className='truncate max-w-[150px]'
                            title={event.location}>
                            {event.location || "Online"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Số lượng (CẬP NHẬT LOGIC MỚI) */}
                    <td className='px-6 py-4 text-center align-top'>
                      <div className='inline-flex flex-col items-center'>
                        <span
                          className={`text-sm font-bold ${
                            isFull ? "text-red-600" : "text-gray-700"
                          }`}>
                          {registered}{" "}
                          <span className='text-gray-400 font-normal'>
                            / {max}
                          </span>
                        </span>

                        {/* Thanh tiến độ */}
                        <div className='w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden'>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? "bg-red-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {isFull && (
                          <span className='text-[10px] text-red-500 font-medium mt-1'>
                            Đã đầy
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột 4: Trạng thái */}
                    <td className='px-6 py-4 text-center align-top'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                        <StatusIcon className='w-3.5 h-3.5' />
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Cột 5: Thao tác */}
                    <td className='px-6 py-4 text-right align-top'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => onViewEvent(event)}
                          className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition'
                          title='Xem chi tiết'>
                          <Eye className='w-4.5 h-4.5' />
                        </button>

                        {!onApprove &&
                          onEditEvent &&
                          event.status !== "cancelled" &&
                          event.status !== "cancel_pending" && (
                            <button
                              onClick={() => onEditEvent(event)}
                              className='p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition'
                              title='Sửa'>
                              <Edit className='w-4.5 h-4.5' />
                            </button>
                          )}

                        {onApprove && isPending && (
                          <button
                            onClick={() => onApprove(event)}
                            className='p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition'
                            title='Duyệt'>
                            <CheckCircle className='w-4.5 h-4.5' />
                          </button>
                        )}

                        {onReject && isPending && (
                          <button
                            onClick={() => onReject(event)}
                            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition'
                            title='Từ chối'>
                            <XCircle className='w-4.5 h-4.5' />
                          </button>
                        )}

                        {event.status === "approved" && onCancelEvent && (
                          <button
                            onClick={() => onCancelEvent(event)}
                            className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition'
                            title={onApprove ? "Hủy khẩn cấp" : "Yêu cầu hủy"}>
                            <Ban className='w-4.5 h-4.5' />
                          </button>
                        )}

                        {event.status === "cancel_pending" && !onApprove && (
                          <button
                            disabled
                            className='p-2 text-gray-300 cursor-not-allowed'
                            title='Đang chờ Admin duyệt hủy'>
                            <Clock className='w-4.5 h-4.5' />
                          </button>
                        )}

                        {onDeleteEvent &&
                          (event.status === "pending" ||
                            event.status === "rejected" ||
                            event.status === "cancelled") && (
                            <button
                              onClick={() => onDeleteEvent(event)}
                              className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition'
                              title='Xóa vĩnh viễn'>
                              <Trash2 className='w-4.5 h-4.5' />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
            <FileX className='w-12 h-12 mb-3 opacity-20' />
            <p>Không tìm thấy sự kiện nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagementTable;
