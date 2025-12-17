/** @format */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";

// Actions
import {
  fetchPendingApprovals,
  fetchMyRequests,
} from "../../features/approvalSlice";
import {
  fetchManagementEvents,
  fetchMyEvents,
} from "../../features/eventSlice";
import {
  fetchAllRegistrations,
  fetchMyRegistrations,
} from "../../features/registrationSlice";

const NotificationBell = ({ user }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- REDUX STATE ---
  const { list: allEvents = [], myEvents = [] } = useSelector(
    (state) => state.event
  );
  const { pendingList: pendingApprovals = [], myRequestsList = [] } =
    useSelector((state) => state.approval);
  const { pendingRegistrations = [], myRegistrations = [] } = useSelector(
    (state) => state.registration
  );

  const role = user?.role;

  // --- 1. FETCH DATA DỰA TRÊN ROLE ---
  useEffect(() => {
    if (role === "admin") {
      dispatch(fetchPendingApprovals());
      dispatch(fetchManagementEvents({ status: "pending" })); // Lấy sự kiện chờ duyệt
      // Admin cũng cần xem registration pending nếu muốn (tùy logic)
      dispatch(fetchAllRegistrations());
    } else if (role === "manager") {
      dispatch(fetchMyEvents({ limit: 100 })); // Lấy event của tôi để check registration
      dispatch(fetchMyRequests()); // Xem trạng thái các yêu cầu hủy/tạo event
      dispatch(fetchAllRegistrations()); // Lấy danh sách đăng ký pending
    } else if (role === "volunteer") {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, role]);

  // --- 2. XỬ LÝ LOGIC THÔNG BÁO CHO TỪNG ROLE ---
  const notifications = useMemo(() => {
    let list = [];

    // === ADMIN: Yêu cầu duyệt Event, User, Hủy Event ===
    if (role === "admin") {
      // 1. Sự kiện mới chờ duyệt
      const newEvents = allEvents.filter((e) => e.status === "pending");
      newEvents.forEach((e) => {
        list.push({
          id: `new_event_${e._id}`,
          title: "Sự kiện mới chờ duyệt",
          message: e.title,
          type: "info",
          time: e.createdAt,
          icon: CalendarIcon,
        });
      });

      // 2. Yêu cầu từ Approval Slice (Thăng cấp, Hủy sự kiện)
      pendingApprovals.forEach((req) => {
        if (req.type === "manager_promotion") {
          list.push({
            id: req._id,
            title: "Yêu cầu thăng cấp Manager",
            message: `Từ: ${req.requestedBy?.userName || "User"}`,
            type: "warning",
            time: req.createdAt,
            icon: UserIcon,
          });
        } else if (req.type === "event_cancellation") {
          list.push({
            id: req._id,
            title: "Yêu cầu HỦY sự kiện",
            message: `Event: ${req.event?.title || "Unknown"}`,
            type: "danger",
            time: req.createdAt,
            icon: AlertIcon,
          });
        }
      });
    }

    // === MANAGER: Đăng ký mới, Trạng thái Event, Trạng thái yêu cầu hủy ===
    if (role === "manager") {
      // 1. User đăng ký tham gia event của tôi (Pending)
      // Lọc các đăng ký thuộc về event do manager này tạo
      const myEventIds = myEvents.map((e) => e._id);
      const myPendingRegs = pendingRegistrations.filter(
        (reg) =>
          myEventIds.includes(reg.eventId?._id || reg.eventId) &&
          (reg.status === "pending" || reg.status === "waitlisted")
      );

      myPendingRegs.forEach((reg) => {
        const eventTitle = reg.eventId?.title || "Sự kiện của bạn";
        list.push({
          id: reg._id,
          title: "Đăng ký tham gia mới",
          message: `${reg.userId?.userName} đã đăng ký "${eventTitle}"`,
          type: "info",
          time: reg.createdAt,
          icon: UserIcon,
        });
      });

      // 2. Thông báo về trạng thái yêu cầu (Event được duyệt, Event hủy được duyệt)
      // Dựa vào myRequestsList
      myRequestsList.forEach((req) => {
        // Chỉ hiện những cái đã xử lý (approved/rejected) gần đây (Logic giả định vì ko có field 'read')
        if (req.status === "approved") {
          if (req.type === "event_approval") {
            list.push({
              id: req._id,
              title: "Sự kiện được CHẤP NHẬN",
              message: `Admin đã duyệt sự kiện "${req.event?.title}"`,
              type: "success",
              time: req.reviewedAt || req.updatedAt,
              icon: CheckIcon,
            });
          } else if (req.type === "event_cancellation") {
            list.push({
              id: req._id,
              title: "Yêu cầu HỦY được chấp nhận",
              message: `Sự kiện "${req.event?.title}" đã được hủy thành công.`,
              type: "danger", // Màu đỏ để chú ý nhưng là success action
              time: req.reviewedAt || req.updatedAt,
              icon: CheckIcon,
            });
          }
        } else if (req.status === "rejected") {
          list.push({
            id: req._id,
            title: "Yêu cầu bị TỪ CHỐI",
            message: `Admin từ chối yêu cầu cho "${req.event?.title}". Lý do: ${req.adminNote}`,
            type: "warning",
            time: req.reviewedAt || req.updatedAt,
            icon: XIcon,
          });
        }
      });

      // 3. Sự kiện bị hủy cưỡng chế (Admin Force Cancel)
      // Check trong myEvents nếu status = cancelled và không phải do mình request (logic tương đối)
      myEvents.forEach((e) => {
        if (e.status === "cancelled" && e.cancelledBy !== user._id) {
          // Đây là logic giả định, cần backend hỗ trợ để biết chính xác ai hủy
          // Hoặc kiểm tra xem có approval request nào approved không, nếu không mà status cancelled -> Admin hủy
        }
      });
    }

    // === VOLUNTEER: Trạng thái đăng ký, Check-in ===
    if (role === "volunteer") {
      myRegistrations.forEach((reg) => {
        const eventTitle = reg.eventId?.title || "Sự kiện";

        if (reg.status === "registered" || reg.status === "approved") {
          list.push({
            id: `reg_app_${reg._id}`,
            title: "Đăng ký thành công",
            message: `Bạn đã được chấp nhận tham gia "${eventTitle}"`,
            type: "success",
            time: reg.updatedAt,
            icon: CheckIcon,
          });
        } else if (reg.status === "cancelled" || reg.status === "rejected") {
          // Có thể là bị từ chối hoặc user tự hủy
          if (reg.status === "rejected") {
            list.push({
              id: `reg_rej_${reg._id}`,
              title: "Đăng ký bị từ chối",
              message: `Rất tiếc, đăng ký tham gia "${eventTitle}" không thành công.`,
              type: "danger",
              time: reg.updatedAt,
              icon: XIcon,
            });
          }
        } else if (reg.status === "event_cancelled") {
          list.push({
            id: `evt_cx_${reg._id}`,
            title: "Sự kiện bị HỦY",
            message: `Sự kiện "${eventTitle}" đã bị hủy bởi BTC.`,
            type: "danger",
            time: reg.updatedAt,
            icon: AlertIcon,
          });
        }

        // Check-in (Logic: Có attendance record - cần attendanceSlice, tạm thời bỏ qua hoặc check field checkInTime trong registration nếu có)
      });
    }

    // Sắp xếp mới nhất lên đầu
    return list.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [
    role,
    allEvents,
    pendingApprovals,
    pendingRegistrations,
    myEvents,
    myRequestsList,
    myRegistrations,
  ]);

  const unreadCount = notifications.length;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <div
        className='relative cursor-pointer p-1 rounded-full hover:bg-gray-100 transition'
        onClick={() => setIsOpen(!isOpen)}>
        <Bell
          className={`w-6 h-6 ${
            isOpen ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
          }`}
        />
        {unreadCount > 0 && (
          <span className='absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1'>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className='absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
            <h3 className='font-bold text-gray-800'>Thông báo</h3>
            <span className='text-xs text-gray-500 bg-white px-2 py-1 rounded border'>
              {unreadCount} mới
            </span>
          </div>

          <div className='max-h-[400px] overflow-y-auto custom-scrollbar'>
            {notifications.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>
                <Bell className='w-10 h-10 mx-auto mb-2 text-gray-300' />
                <p className='text-sm'>Bạn không có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className='px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition cursor-pointer flex gap-3 items-start'>
                  <div
                    className={`mt-1 p-1.5 rounded-full shrink-0 ${getIconColor(
                      item.type
                    )}`}>
                    <item.icon className='w-4 h-4 text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>
                      {item.title}
                    </p>
                    <p className='text-xs text-gray-600 mt-0.5 line-clamp-2'>
                      {item.message}
                    </p>
                    <p className='text-[10px] text-gray-400 mt-1 flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      {item.time
                        ? new Date(item.time).toLocaleString("vi-VN")
                        : "Vừa xong"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='p-2 bg-gray-50 text-center border-t border-gray-100'>
            <button className='text-xs text-primary-600 hover:text-primary-700 font-medium'>
              Xem tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER ICONS & STYLES ---
const CalendarIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}>
    <rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
    <line x1='16' x2='16' y1='2' y2='6' />
    <line x1='8' x2='8' y1='2' y2='6' />
    <line x1='3' x2='21' y1='10' y2='10' />
  </svg>
);
const UserIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}>
    <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
);
const CheckIcon = ({ className }) => <CheckCircle className={className} />;
const XIcon = ({ className }) => <XCircle className={className} />;
const AlertIcon = ({ className }) => <AlertTriangle className={className} />;

const getIconColor = (type) => {
  switch (type) {
    case "success":
      return "bg-emerald-500";
    case "danger":
      return "bg-red-500";
    case "warning":
      return "bg-amber-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-gray-400";
  }
};

export default NotificationBell;
