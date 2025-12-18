/** @format */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Trash2,
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
  const navigate = useNavigate();
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

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (!role || !user?._id) return;

    if (role === "admin") {
      dispatch(fetchPendingApprovals());
      dispatch(fetchManagementEvents({ status: "pending" }));
    } else if (role === "manager") {
      dispatch(fetchMyEvents({ limit: 100 }));
      dispatch(fetchMyRequests());
      dispatch(fetchAllRegistrations());
    } else if (role === "volunteer") {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, role, user?._id]);

  // --- 2. XỬ LÝ LOGIC THÔNG BÁO ---
  const notifications = useMemo(() => {
    let list = [];

    // === ADMIN ===
    if (role === "admin") {
      const newEvents = allEvents.filter((e) => e.status === "pending");
      newEvents.forEach((e) => {
        list.push({
          id: `new_event_${e._id}`,
          title: "Sự kiện mới chờ duyệt",
          message: `Sự kiện "${e.title}" vừa được tạo và đang chờ bạn phê duyệt.`,
          type: "info",
          time: e.createdAt,
          icon: CalendarIcon,
          link: `/admin/dashboard?tab=events_management&action=view&id=${e._id}`,
        });
      });

      pendingApprovals.forEach((req) => {
        if (req.type === "event_cancellation") {
          list.push({
            id: req._id,
            title: "Yêu cầu HỦY sự kiện",
            message: `${req.requestedBy?.userName || "Ai đó"} muốn hủy: "${
              req.event?.title || "sự kiện"
            }".`,
            type: "danger",
            time: req.createdAt,
            icon: AlertIcon,
            link: `/admin/dashboard?tab=events_management&action=review_cancel&id=${req._id}`,
          });
        } else if (req.type === "manager_promotion") {
          list.push({
            id: req._id,
            title: "Yêu cầu thăng cấp",
            message: `Người dùng ${
              req.requestedBy?.userName || "Hội viên"
            } đang chờ duyệt thăng cấp.`,
            type: "warning",
            time: req.createdAt,
            icon: UserIcon,
            link: `/admin/dashboard?tab=users_management&action=review_promotion&id=${req._id}`,
          });
        }
      });
    }

    // === MANAGER ===
    if (role === "manager") {
      const myEventIds = myEvents.map((e) => e._id);
      const myPendingRegs = pendingRegistrations.filter(
        (reg) =>
          myEventIds.includes(reg.eventId?._id || reg.eventId) &&
          (reg.status === "pending" || reg.status === "waitlisted")
      );

      myPendingRegs.forEach((reg) => {
        list.push({
          id: reg._id,
          title: "Đăng ký tham gia mới",
          message: `${reg.userId?.userName || "Tình nguyện viên"} đã đăng ký "${
            reg.eventId?.title || "sự kiện của bạn"
          }"`,
          type: "info",
          time: reg.createdAt,
          icon: UserIcon,
          link: `/manager/dashboard?tab=registrations&highlight=${reg._id}`,
        });
      });

      myRequestsList.forEach((req) => {
        // 👇 Lấy ID an toàn
        const targetEventId = req.event?._id || req.event;
        if (req.status === "approved") {
          list.push({
            id: req._id,
            title:
              req.type === "event_approval"
                ? "Sự kiện ĐÃ ĐƯỢC DUYỆT"
                : "Yêu cầu ĐÃ CHẤP NHẬN",
            message: `Yêu cầu cho "${
              req.event?.title || "sự kiện"
            }" đã được thông qua.`,
            type: "success",
            time: req.reviewedAt || req.updatedAt,
            icon: CheckIcon,
            link: `/manager/dashboard?tab=events&highlight=${targetEventId}`,
          });
        } else if (req.status === "rejected") {
          list.push({
            id: req._id,
            title: "Yêu cầu bị TỪ CHỐI",
            message: `Admin từ chối yêu cầu cho sự kiện "${
              req.event?.title || "sự kiện"
            }".`,
            type: "danger",
            time: req.reviewedAt || req.updatedAt,
            icon: XIcon,
            link: `/manager/dashboard?tab=events&highlight=${targetEventId}`,
          });
        }
      });

      myEvents.forEach((e) => {
        if (e.status === "cancelled" && e.cancelledBy !== user?._id) {
          list.push({
            id: `force_cancel_${e._id}`,
            title: "Sự kiện bị Admin HỦY",
            message: `"${e.title}" đã bị hủy trực tiếp bởi Admin.`,
            type: "danger",
            time: e.updatedAt,
            icon: AlertIcon,
            link: `/manager/dashboard?tab=events&highlight=${e._id}`,
          });
        }
      });
    }

    // === VOLUNTEER ===
    if (role === "volunteer") {
      myRegistrations.forEach((reg) => {
        const event = reg.eventId;
        const eventId = event?._id || event; // 👈 Lấy ID an toàn cho link
        const eventTitle = event?.title || "Sự kiện";

        if (reg.status === "approved" || reg.status === "registered") {
          list.push({
            id: `approved_${reg._id}`,
            title: "Đăng ký thành công",
            message: `Bạn đã được duyệt tham gia "${eventTitle}"`,
            type: "success",
            time: reg.updatedAt,
            icon: CheckIcon,
            link: `/events/${eventId}`,
          });
        }

        if (event?.status === "cancelled") {
          list.push({
            id: `event_cancelled_${eventId}`,
            title: "Sự kiện đã bị hủy",
            message: `Rất tiếc, sự kiện "${eventTitle}" bạn tham gia đã bị hủy.`,
            type: "danger",
            time: event.updatedAt,
            icon: AlertIcon,
            link: `/events/${eventId}`,
          });
        }

        if (
          event?.updatedAt &&
          new Date(event.updatedAt) > new Date(reg.createdAt) &&
          event.status === "approved"
        ) {
          list.push({
            id: `event_updated_${eventId}`,
            title: "Sự kiện có cập nhật mới",
            message: `Thông tin sự kiện "${eventTitle}" đã được thay đổi. Hãy kiểm tra lại.`,
            type: "info",
            time: event.updatedAt,
            icon: CalendarIcon,
            link: `/events/${eventId}`,
          });
        }
      });
    }

    return list.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [
    role,
    allEvents,
    pendingApprovals,
    pendingRegistrations,
    myEvents,
    myRequestsList,
    myRegistrations,
    user?._id,
  ]);

  // (Phần handleItemClick và Render giữ nguyên như cũ...)
  const unreadCount = notifications.length;
  const handleItemClick = (item) => {
    setIsOpen(false);
    if (item.link) navigate(item.link);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <div
        className='relative cursor-pointer p-1 rounded-full hover:bg-gray-100'
        onClick={() => setIsOpen(!isOpen)}>
        <Bell
          className={`w-6 h-6 ${isOpen ? "text-primary-600" : "text-gray-500"}`}
        />
        {unreadCount > 0 && (
          <span className='absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1'>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className='absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50'>
          <div className='px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center'>
            <h3 className='font-bold text-gray-800'>Thông báo</h3>
            <span className='text-xs text-gray-500 bg-white px-2 py-1 rounded border'>
              {unreadCount} mới
            </span>
          </div>
          <div className='max-h-[400px] overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>
                <Bell className='w-10 h-10 mx-auto mb-2 text-gray-300' />
                <p>Không có thông báo nào.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className='px-4 py-3 hover:bg-gray-50 border-b flex gap-3 cursor-pointer'>
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
                      {new Date(item.time).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER ICONS (Giữ nguyên các hàm Icon của bạn) ---
const CalendarIcon = ({ className }) => (
  <svg
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
const TrashIcon = ({ className }) => <Trash2 className={className} />;

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
