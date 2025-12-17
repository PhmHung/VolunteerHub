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
  Star,
  FileX,
  Ban, // Icon cấm/hủy
  AlertTriangle, // Thêm icon cảnh báo
} from "lucide-react";

const EventManagementTable = ({
  events = [],
  registrations = [],
  cancelRequests = [], // Danh sách đơn hủy riêng (nếu dùng Red Block)
  onApprove, // Hàm duyệt (Admin)
  onReject, // Hàm từ chối (Admin)
  onDeleteEvent,
  onViewEvent,
  onCancelEvent,
  onApproveCancellation,
  onRejectCancellation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Tính toán số lượng pending registration
  const getPendingCount = (eventId) => {
    return registrations.filter(
      (reg) =>
        (reg.eventId?._id || reg.eventId || reg.event?._id) === eventId &&
        (reg.status === "pending" || reg.status === "waitlisted")
    ).length;
  };

  // 2. Logic Lọc dữ liệu
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 3. Cấu hình hiển thị Badge (ĐÃ CẬP NHẬT)
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "Đang hoạt động",
          icon: CheckCircle,
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          cardBorder: "border-gray-200", // Viền mặc định
        };
      case "pending":
        return {
          label: "CHỜ DUYỆT MỚI", // Viết hoa nhấn mạnh
          icon: Clock,
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          cardBorder: "border-amber-300 ring-1 ring-amber-100", // Viền vàng
        };
      case "cancel_pending":
        return {
          label: "YÊU CẦU HỦY", // Viết hoa, nhấn mạnh
          icon: Ban,
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-300",
          cardBorder: "border-red-400 bg-red-50/30", // Viền đỏ, nền hơi đỏ
        };
      case "rejected":
        return {
          label: "Đã từ chối",
          icon: XCircle,
          bg: "bg-gray-100",
          text: "text-gray-500",
          border: "border-gray-200",
          cardBorder: "border-gray-200 opacity-75",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          icon: Ban,
          bg: "bg-gray-200",
          text: "text-gray-600",
          border: "border-gray-300",
          cardBorder: "border-gray-200 opacity-60",
        };
      default:
        return {
          label: status,
          icon: Clock,
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          cardBorder: "border-gray-200",
        };
    }
  };

  // 4. Render Card (ĐÃ CẬP NHẬT GIAO DIỆN)
  const renderEventCard = (event) => {
    const pendingCount = getPendingCount(event._id || event.id);
    const statusConfig = getStatusConfig(event.status);
    const StatusIcon = statusConfig.icon;

    // Cờ trạng thái
    const isCancelRequest = event.status === "cancel_pending";
    const isNewRequest = event.status === "pending";

    return (
      <div
        key={event._id}
        // Thêm class viền động và relative để chứa dải màu
        className={`bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden ${
          statusConfig.cardBorder || "border-gray-200"
        }`}>
        {/* Dải màu đánh dấu bên trái thẻ */}
        {isCancelRequest && (
          <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-red-500'></div>
        )}
        {isNewRequest && (
          <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400'></div>
        )}

        {/* Nội dung chính (thêm padding trái nếu có dải màu) */}
        <div className='flex flex-col lg:flex-row justify-between gap-6 pl-2'>
          {/* CỘT TRÁI: THÔNG TIN */}
          <div className='flex-1'>
            <div className='flex items-start justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors'>
                {event.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                <StatusIcon className='w-4 h-4' />
                {statusConfig.label}
              </span>
            </div>

            {/* ALERT BOX CHO YÊU CẦU HỦY */}
            {isCancelRequest && (
              <div className='mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 flex items-start gap-3'>
                <AlertTriangle className='w-5 h-5 shrink-0 mt-0.5' />
                <div>
                  <p className='font-bold text-sm'>
                    Manager yêu cầu hủy sự kiện này
                  </p>
                  <p className='text-xs mt-1'>
                    Hành động này sẽ hủy vé của tất cả tình nguyện viên.
                  </p>
                </div>
              </div>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600'>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-400' />
                {new Date(event.startDate).toLocaleDateString("vi-VN")}
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-gray-400' />
                <span className='truncate max-w-[150px]'>
                  {event.location || "Chưa xác định"}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Users className='w-4 h-4 text-gray-400' />
                {event.registeredCount || 0} / {event.maxParticipants}
              </div>
              <div className='flex items-center gap-2'>
                <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                {event.averageRating || 0}
              </div>
            </div>

            {/* Hiển thị số lượng đăng ký mới */}
            {pendingCount > 0 && event.status === "approved" && (
              <div className='mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100'>
                <Clock className='w-3 h-3' /> {pendingCount} đơn đăng ký mới cần
                duyệt
              </div>
            )}
          </div>

          {/* CỘT PHẢI: HÀNH ĐỘNG */}
          <div className='flex items-center gap-2 self-start lg:self-center'>
            {/* --- TRƯỜNG HỢP 1: DUYỆT SỰ KIỆN MỚI --- */}
            {isNewRequest && onApprove && (
              <>
                <button
                  onClick={() => onApprove(event)}
                  className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium text-sm flex items-center gap-2'
                  title='Duyệt đăng sự kiện'>
                  <CheckCircle className='w-4 h-4' /> Duyệt đăng
                </button>
                <button
                  onClick={() => onReject(event)}
                  className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
                  title='Từ chối đăng'>
                  <XCircle className='w-5 h-5' />
                </button>
              </>
            )}

            {/* --- TRƯỜNG HỢP 2: XỬ LÝ YÊU CẦU HỦY --- */}
            {isCancelRequest &&
              onApproveCancellation &&
              (() => {
                // Tìm request tương ứng trong mảng cancelRequests
                const request = cancelRequests.find(
                  (r) => r.event?._id === event._id || r.event === event._id
                );
                // Nếu không tìm thấy request (do chưa load kịp), hiện thông báo lỗi nhỏ
                if (!request)
                  return (
                    <span className='text-xs text-red-500 italic'>
                      Đang tải request...
                    </span>
                  );

                return (
                  <>
                    <button
                      onClick={() => onApproveCancellation(request)}
                      className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm font-medium text-sm flex items-center gap-2 animate-pulse'>
                      <Trash2 className='w-4 h-4' /> Chấp thuận Hủy
                    </button>
                    <button
                      onClick={() => onRejectCancellation(request)}
                      className='p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition'
                      title='Từ chối hủy (Giữ lại sự kiện)'>
                      <XCircle className='w-5 h-5' />
                    </button>
                  </>
                );
              })()}

            {/* --- TRƯỜNG HỢP 3: CÁC NÚT THÔNG THƯỜNG --- */}
            {!isNewRequest && !isCancelRequest && (
              <>
                {/* Nút Hủy khẩn cấp cho Admin */}
                {event.status === "approved" && onCancelEvent && (
                  <button
                    onClick={() => onCancelEvent(event)}
                    className='p-2.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition'
                    title={
                      onApprove ? "Hủy sự kiện (Khẩn cấp)" : "Yêu cầu hủy"
                    }>
                    <Ban className='w-5 h-5' />
                  </button>
                )}
                {event.status === "cancel_pending" && !onApprove && (
                  <button
                    disabled
                    className='p-2.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed'
                    title='Đã gửi yêu cầu hủy, đang chờ Admin duyệt'>
                    <Clock className='w-5 h-5' />
                  </button>
                )}

                <div className='w-px h-8 bg-gray-200 mx-1'></div>
              </>
            )}

            <button
              onClick={() => onViewEvent(event)}
              className='p-2.5 bg-gray-100 text-blue-600 rounded-lg hover:bg-blue-100 transition'
              title='Xem chi tiết'>
              <Eye className='w-5 h-5' />
            </button>

            {/* Nút Xóa (Nếu có quyền xóa) */}
            {onDeleteEvent && (
              <button
                onClick={() => onDeleteEvent(event)}
                className='p-2.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition'
                title='Xóa dữ liệu'>
                <Trash2 className='w-5 h-5' />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white shadow-sm border border-gray-200 flex flex-col rounded-xl overflow-hidden transition-all ${
        isExpanded
          ? "fixed inset-4 z-50 rounded-2xl shadow-2xl"
          : "relative h-full"
      }`}>
      {/* HEADER */}
      <div className='sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex-none'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-gray-900'>
              Danh sách sự kiện
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition'>
              {isExpanded ? (
                <Minimize2 className='w-5 h-5' />
              ) : (
                <Maximize2 className='w-5 h-5' />
              )}
            </button>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            {/* Ô TÌM KIẾM */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Tìm kiếm sự kiện...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64'
              />
            </div>

            {/* BỘ LỌC */}
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer font-medium text-gray-700'>
                <option value='all'>Tất cả trạng thái</option>
                <option value='pending'>Chờ duyệt mới</option>
                <option value='cancel_pending'>Chờ hủy</option>
                <option value='approved'>Đang hoạt động</option>
                <option value='rejected'>Đã từ chối</option>
                <option value='cancelled'>Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className='flex-1 overflow-y-auto bg-gray-50 p-6'>
        {/* KHỐI YÊU CẦU HỦY (RED BLOCK) - Giữ lại để hiển thị danh sách gom nhóm trên đầu */}
        {cancelRequests.length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-6 mb-8 animate-in slide-in-from-top-2'>
            <h3 className='text-lg font-bold text-red-800 flex items-center gap-2 mb-4'>
              <span className='relative flex h-3 w-3'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500'></span>
              </span>
              Yêu cầu Hủy Sự kiện cần xử lý ({cancelRequests.length})
            </h3>
            <div className='grid gap-4'>
              {cancelRequests.map((req) => (
                <div
                  key={req._id}
                  className='bg-white border border-red-100 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase'>
                        Khẩn cấp
                      </span>
                      <h4 className='font-bold text-gray-900 text-lg'>
                        {req.event?.title || "Sự kiện không xác định"}
                      </h4>
                    </div>
                    <p className='text-gray-700 mt-1'>
                      <span className='font-semibold'>Lý do hủy:</span> "
                      {req.reason}"
                    </p>
                    <div className='flex items-center gap-3 mt-2 text-xs text-gray-500'>
                      <span>
                        Từ: <strong>{req.requestedBy?.userName}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(req.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className='flex gap-2 shrink-0'>
                    <button
                      onClick={() => onRejectCancellation(req)}
                      className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition'>
                      Từ chối (Giữ lại)
                    </button>
                    <button
                      onClick={() => onApproveCancellation(req)}
                      className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-sm transition flex items-center gap-2'>
                      <Trash2 className='w-4 h-4' /> Xác nhận Hủy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DANH SÁCH SỰ KIỆN CHÍNH */}
        {filteredEvents.length > 0 ? (
          <div className='grid gap-5'>
            {filteredEvents.map(renderEventCard)}
          </div>
        ) : (
          <div className='text-center py-20 text-gray-500'>
            <div className='bg-gray-100 p-4 rounded-full inline-block mb-3'>
              <FileX className='w-8 h-8 text-gray-400' />
            </div>
            <p className='font-medium text-lg'>Không tìm thấy sự kiện nào.</p>
            <p className='text-sm'>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagementTable;
