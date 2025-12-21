/** @format */
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react"; // 1. Thêm hooks
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Award,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { REGISTRATION_STATUS } from "../../utils/constants";

// Component con: Card hiển thị từng đăng ký
const RegistrationCard = ({
  registration,
  volunteer,
  event,
  onAccept,
  onReject,
  isHighlighted, // 2. Nhận prop highlight
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef(null); // 3. Tạo Ref

  // 4. Effect: Tự động cuộn đến thẻ này nếu được highlight
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isHighlighted]);

  // Fallback config nếu chưa có trong constants
  const statusConfig = REGISTRATION_STATUS?.[registration.status] || {
    label: registration.status,
    color: "gray",
  };

  const isEventFull =
    (event?.currentParticipants ?? 0) >= (event?.maxParticipants ?? 0);

  const handleAccept = async () => {
    setIsProcessing(true);
    await onAccept(registration);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onReject(registration);
    setIsProcessing(false);
  };

  return (
    <div
      ref={cardRef} // Gắn Ref vào thẻ cha
      // 5. Logic CSS: Giữ nguyên style cũ (bg-white, p-5...), chỉ đổi Border và Shadow khi highlight
      className={`bg-white p-5 rounded-xl border transition-all duration-500 ${
        isHighlighted
          ? "border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-1 ring-blue-300 scale-[1.02] z-10" // Hiệu ứng làm sáng viền
          : "border-gray-200 hover:shadow-md" // Style mặc định cũ
      }`}>
      <div className='flex flex-col sm:flex-row items-start gap-4'>
        {/* Avatar */}
        <div className='flex-shrink-0'>
          {volunteer?.profilePicture ? (
            <img
              src={volunteer.profilePicture}
              alt={volunteer.userName}
              className='w-16 h-16 rounded-full object-cover border border-gray-100'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-inner'>
              {volunteer?.userName?.charAt(0)?.toUpperCase() || "V"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0 w-full'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3'>
            <div>
              <h3 className='font-bold text-gray-900 text-lg'>
                {volunteer?.userName || "Tình nguyện viên"}
              </h3>
              <p className='text-sm text-gray-500'>
                Đăng ký sự kiện:{" "}
                <span className='font-medium text-blue-600'>
                  {event?.title || "Không xác định"}
                </span>
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`self-start md:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border
              ${
                statusConfig.color === "amber"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : ""
              }
              ${
                statusConfig.color === "emerald"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : ""
              }
              ${
                statusConfig.color === "red"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : ""
              }
              ${
                statusConfig.color === "blue"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : ""
              }
            `}>
              {registration.status === "pending" ||
              registration.status === "waitlisted" ? (
                <Clock className='w-3.5 h-3.5' />
              ) : null}
              {registration.status === "approved" ||
              registration.status === "registered" ? (
                <CheckCircle className='w-3.5 h-3.5' />
              ) : null}
              {registration.status === "rejected" ||
              registration.status === "cancelled" ? (
                <XCircle className='w-3.5 h-3.5' />
              ) : null}
              {statusConfig.label || registration.status}
            </div>
          </div>

          {/* Contact & Date Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3'>
            <div className='flex items-center gap-2'>
              <Mail className='w-4 h-4 text-gray-400' />
              <span className='truncate'>{volunteer?.userEmail || "---"}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-4 h-4 text-gray-400' />
              <span>{volunteer?.phoneNumber || "---"}</span>
            </div>
            <div className='flex items-center gap-2 md:col-span-2'>
              <Clock className='w-4 h-4 text-gray-400' />
              <span>
                Đăng ký:{" "}
                {new Date(
                  registration.createdAt || registration.registeredAt
                ).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Skills Tag */}
          {volunteer?.skills && volunteer.skills.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-4'>
              {volunteer.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className='inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200'>
                  <Award className='w-3 h-3 text-gray-400' />
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {(registration.status === "pending" ||
            registration.status === "waitlisted") && (
            <div className='flex gap-3 mt-2'>
              <button
                onClick={handleAccept}
                disabled={isProcessing || isEventFull}
                className={`flex-1 sm:flex-none px-4 py-2 text-white rounded-lg font-medium transition ... ${
                  isEventFull
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}>
                <CheckCircle className='w-4 h-4' />
                {isEventFull ? "Sự kiện đã đầy" : "Chấp nhận"}
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className='flex-1 sm:flex-none px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50'>
                <XCircle className='w-4 h-4' />
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component chính
const RegistrationManagementTable = ({
  registrations = [],
  users = [],
  events = [],
  onApprove,
  onReject,
  loading = false,
  highlightedId, // 6. Nhận ID cần highlight từ Parent
}) => {
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const findVolunteer = useCallback(
    (userId) => {
      if (!userId) return {};
      const id = userId._id || userId;
      return userId.userName ? userId : users.find((u) => u._id === id) || {};
    },
    [users]
  ); // Phụ thuộc vào danh sách users

  const findEvent = useCallback(
    (eventId) => {
      if (!eventId) return {};
      const id = eventId._id || eventId;
      return eventId.title ? eventId : events.find((e) => e._id === id) || {};
    },
    [events]
  );

  // const filteredRegistrations = useMemo(() => {
  //   // Ưu tiên đưa thẻ được highlight lên đầu danh sách (Tùy chọn, ở đây mình giữ nguyên thứ tự)
  //   return registrations.filter((reg) => {
  //     const event = findEvent(reg.eventId || reg.event);
  //     if (event?.status === "cancelled") return false;
  //     const currentStatus = reg.status;
  //     const isTargetHighlighted = reg._id === highlightedId;
  //     if (isTargetHighlighted) return true;
  //     if (filterStatus !== "all") {
  //       if (
  //         filterStatus === "pending" &&
  //         currentStatus !== "pending" &&
  //         currentStatus !== "waitlisted"
  //       )
  //         return false;
  //       if (
  //         filterStatus === "approved" &&
  //         currentStatus !== "approved" &&
  //         currentStatus !== "registered"
  //       )
  //         return false;
  //       if (
  //         filterStatus === "rejected" &&
  //         currentStatus !== "rejected" &&
  //         currentStatus !== "cancelled"
  //       )
  //         return false;
  //     }

  //     if (searchQuery) {
  //       const volunteer = findVolunteer(reg.userId || reg.volunteer);
  //       const event = findEvent(reg.eventId || reg.event);
  //       const term = searchQuery.toLowerCase();

  //       return (
  //         volunteer?.userName?.toLowerCase().includes(term) ||
  //         volunteer?.userEmail?.toLowerCase().includes(term) ||
  //         event?.title?.toLowerCase().includes(term)
  //       );
  //     }
  //     return true;
  //   });
  // }, [
  //   registrations,
  //   filterStatus,
  //   searchQuery,
  //   findVolunteer,
  //   findEvent,
  //   highlightedId,
  // ]);
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const event = findEvent(reg.eventId || reg.event);
      if (!event || event.status === "cancelled") return false;

      // QUY TẮC NGOẠI LỆ: Nếu là bản ghi đang được highlight, LUÔN giữ lại
      const isTargetHighlighted = reg._id === highlightedId;
      if (isTargetHighlighted) return true;

      // Logic lọc theo trạng thái thông thường
      if (filterStatus !== "all") {
        const currentStatus = reg.status;
        if (
          filterStatus === "pending" &&
          currentStatus !== "pending" &&
          currentStatus !== "waitlisted"
        )
          return false;
        if (
          filterStatus === "approved" &&
          currentStatus !== "approved" &&
          currentStatus !== "registered"
        )
          return false;
        if (
          filterStatus === "rejected" &&
          currentStatus !== "rejected" &&
          currentStatus !== "cancelled"
        )
          return false;
      }

      // Logic tìm kiếm (Nếu có searchQuery, nó sẽ lọc tiếp trên danh sách đã qua bộ lọc status)
      if (searchQuery) {
        const volunteer = findVolunteer(reg.userId || reg.volunteer);
        const term = searchQuery.toLowerCase();
        return (
          volunteer?.userName?.toLowerCase().includes(term) ||
          volunteer?.userEmail?.toLowerCase().includes(term) ||
          event?.title?.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [
    registrations,
    filterStatus,
    searchQuery,
    findVolunteer,
    findEvent,
    highlightedId,
  ]);
  const activeRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const event = findEvent(reg.eventId || reg.event);
      return event?.status !== "cancelled";
    });
  }, [registrations, findEvent]);

  // Stats
  const stats = {
    total: activeRegistrations.length,
    pending: registrations.filter((r) =>
      ["pending", "waitlisted"].includes(r.status)
    ).length,
    approved: registrations.filter((r) =>
      ["approved", "registered"].includes(r.status)
    ).length,
    rejected: registrations.filter((r) =>
      ["rejected", "cancelled"].includes(r.status)
    ).length,
  };

  if (loading) {
    return (
      <div className='p-12 text-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-4'></div>
        <p className='text-gray-500'>Đang tải danh sách đăng ký...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 1. Thống kê nhanh (Stats) - Giữ nguyên */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3'>
          <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
            <Users className='w-5 h-5' />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-semibold'>
              Tổng cộng
            </p>
            <p className='text-xl font-bold text-gray-900'>{stats.total}</p>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3'>
          <div className='p-2 bg-amber-50 text-amber-600 rounded-lg'>
            <Clock className='w-5 h-5' />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-semibold'>
              Chờ duyệt
            </p>
            <p className='text-xl font-bold text-gray-900'>{stats.pending}</p>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3'>
          <div className='p-2 bg-emerald-50 text-emerald-600 rounded-lg'>
            <CheckCircle className='w-5 h-5' />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-semibold'>
              Đã duyệt
            </p>
            <p className='text-xl font-bold text-gray-900'>{stats.approved}</p>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3'>
          <div className='p-2 bg-red-50 text-red-600 rounded-lg'>
            <XCircle className='w-5 h-5' />
          </div>
          <div>
            <p className='text-xs text-gray-500 uppercase font-semibold'>
              Từ chối
            </p>
            <p className='text-xl font-bold text-gray-900'>{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* 2. Bộ lọc (Filters) - Giữ nguyên */}
      <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Tìm theo tên TNV, email hoặc tên sự kiện...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
          />
        </div>
        <div className='flex items-center gap-2 min-w-[200px]'>
          <Filter className='w-4 h-4 text-gray-500' />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white'>
            <option value='all'>Tất cả trạng thái</option>
            <option value='pending'>Đang chờ duyệt</option>
            <option value='approved'>Đã chấp nhận</option>
            <option value='rejected'>Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* 3. Danh sách (List) */}
      <div className='space-y-4 pb-20'>
        {filteredRegistrations.length === 0 ? (
          <div className='bg-white p-12 rounded-xl border border-gray-200 border-dashed text-center'>
            <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertTriangle className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-1'>
              Không tìm thấy kết quả
            </h3>
            <p className='text-gray-500 text-sm'>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          filteredRegistrations.map((registration) => (
            <RegistrationCard
              key={registration._id}
              registration={registration}
              volunteer={findVolunteer(
                registration.userId || registration.volunteer
              )}
              event={findEvent(registration.eventId || registration.event)}
              onAccept={onApprove}
              onReject={onReject}
              // 7. Truyền trạng thái highlight
              isHighlighted={registration._id === highlightedId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RegistrationManagementTable;
