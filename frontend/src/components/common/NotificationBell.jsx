/** @format */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../../clientSocket.js";
import { ToastContainer } from "../common/Toast";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Check,
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
import {
  fetchSuggestedManagers,
  fetchUserProfile,
} from "../../features/userSlice";

const NotificationBell = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem(`read_notifications_${user?._id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem(`dismissed_notifications_${user?._id}`);
    return saved ? JSON.parse(saved) : [];
  });

  // refs
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // vị trí dropdown (portal)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const { list: allEvents = [], myEvents = [] } = useSelector(
    (state) => state.event
  );
  const { pendingList: pendingApprovals = [], myRequestsList = [] } =
    useSelector((state) => state.approval);
  const { pendingRegistrations = [], myRegistrations = [] } = useSelector(
    (state) => state.registration
  );
  const { suggestedManagers = [] } = useSelector((state) => state.user);

  const role = user?.role;

  // --- Persist read/dismiss ---
  useEffect(() => {
    if (user?._id) {
      localStorage.setItem(
        `read_notifications_${user?._id}`,
        JSON.stringify(readIds)
      );
      localStorage.setItem(
        `dismissed_notifications_${user?._id}`,
        JSON.stringify(dismissedIds)
      );
    }
  }, [readIds, dismissedIds, user?._id]);

  // --- Fetch data ---
  useEffect(() => {
    if (!role || !user?._id) return;

    if (role === "admin") {
      dispatch(fetchPendingApprovals());
      dispatch(fetchManagementEvents({ status: "pending" }));
      dispatch(fetchSuggestedManagers());
      dispatch(fetchAllRegistrations());
    } else if (role === "manager") {
      dispatch(fetchMyEvents({ limit: 100 }));
      dispatch(fetchMyRequests());
      dispatch(fetchAllRegistrations());
    } else if (role === "volunteer") {
      dispatch(fetchMyRegistrations());
    }
  }, [dispatch, role, user?._id]);

  // --- Socket ---
  useEffect(() => {
    if (!user?._id) return;

    const handleSocket = (data) => {
      addToast(data.message, data.type || "info");

      if (role === "admin") {
        dispatch(fetchPendingApprovals());
        dispatch(fetchManagementEvents({ status: "pending" }));
        dispatch(fetchAllRegistrations());
      } else if (role === "manager") {
        dispatch(fetchMyRequests());
        dispatch(fetchAllRegistrations());
        dispatch(fetchMyEvents({ limit: 100 }));
      } else if (role === "volunteer") {
        dispatch(fetchMyRegistrations());
        if (data.link === "/information") dispatch(fetchUserProfile());
      }
    };

    socket.on("NOTIFICATION", handleSocket);
    return () => socket.off("NOTIFICATION", handleSocket);
  }, [dispatch, user?._id, role]);

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    if (!readIds.includes(id)) setReadIds([...readIds, id]);
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    if (!dismissedIds.includes(id)) setDismissedIds([...dismissedIds, id]);
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  // --- notifications memo (GIỮ NGUYÊN LOGIC của bạn) ---
  const notifications = useMemo(() => {
    let list = [];

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
          link: `/admin/dashboard?tab=events_management&action=view&highlight=${e._id}`,
        });
      });

      pendingRegistrations
        .filter(
          (reg) => reg.status === "pending" || reg.status === "waitlisted"
        )
        .forEach((reg) => {
          list.push({
            id: `reg_vol_${reg._id}`,
            title: "Yêu cầu tham gia mới",
            message: `${
              reg.userId?.userName || "Tình nguyện viên"
            } đăng ký tham gia "${reg.eventId?.title}"`,
            type: "info",
            time: reg.createdAt,
            icon: UserIcon,
            link: `/admin/dashboard?tab=volunteers&highlight=${reg._id}`,
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
            link: `/admin/dashboard?tab=events_management&action=review_cancel&highlight=${
              req.event?._id || req.event
            }`,
          });
        } else if (req.type === "manager_promotion") {
          const isNewRegistration =
            !req.promotionData || req.promotionData.eventsCompleted === 0;
          const isRequestedAdmin = req.reason?.toLowerCase().includes("admin");

          list.push({
            id: req._id,
            // SỬ DỤNG BIẾN ĐỂ PHÂN BIỆT TIÊU ĐỀ
            title: isNewRegistration
              ? isRequestedAdmin
                ? "Đăng ký Admin mới"
                : "Đăng ký Manager mới"
              : isRequestedAdmin
              ? "Yêu cầu thăng cấp Admin"
              : "Yêu cầu thăng cấp Manager",
            message: `${req.requestedBy?.userName} yêu cầu quyền ${
              isRequestedAdmin ? "ADMIN" : "MANAGER"
            }.`,
            type: isRequestedAdmin ? "danger" : "info",
            time: req.createdAt,
            icon: UserIcon,
            link: `/admin/dashboard?tab=managers&action=review_promotion&highlight=${req._id}`,
          });
        }
      });

      suggestedManagers.forEach((suggest) => {
        list.push({
          id: `suggest_${suggest._id}`,
          title: "Ứng viên Manager tiềm năng",
          message: `Hệ thống gợi ý thăng cấp cho "${suggest.userName}" dựa trên hoạt động tích cực.`,
          type: "success",
          time: new Date(),
          icon: CheckIcon,
          link: `/admin/dashboard?tab=suggestions&highlight=${suggest._id}`,
        });
      });
    }

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

    if (role === "volunteer") {
      myRegistrations.forEach((reg) => {
        const event = reg.eventId;
        const eventId = event?._id || event;
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

    return list
      .filter((item) => !dismissedIds.includes(item.id))
      .sort((a, b) => {
        const aRead = readIds.includes(a.id);
        const bRead = readIds.includes(b.id);
        if (aRead !== bRead) return aRead ? 1 : -1;
        return new Date(b.time) - new Date(a.time);
      });
  }, [
    role,
    allEvents,
    pendingApprovals,
    pendingRegistrations,
    myEvents,
    myRequestsList,
    myRegistrations,
    suggestedManagers,
    dismissedIds,
    readIds,
    user?._id,
  ]);

  const unreadCount = notifications.filter(
    (n) => !readIds.includes(n.id)
  ).length;

  const handleItemClick = (item) => {
    setIsOpen(false);
    if (!readIds.includes(item.id)) setReadIds([...readIds, item.id]);
    if (item.link) navigate(item.link);
  };

  // --- tính vị trí dropdown khi mở / resize / scroll ---
  useEffect(() => {
    if (!isOpen) return;

    const updatePos = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();

      // dropdown canh phải theo nút chuông
      const top = rect.bottom + 12 + window.scrollY; // mt-3 tương đương 12px
      const left = rect.right + window.scrollX; // dùng right để canh phải
      setDropdownPos({ top, left, width: rect.width });
    };

    updatePos();

    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true); // true để bắt scroll ở parent
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [isOpen]);

  // --- click outside (dùng portal vẫn ok vì ref dropdownRef) ---
  useEffect(() => {
    function handleClickOutside(event) {
      const drop = dropdownRef.current;
      const btn = buttonRef.current;
      if (!drop || !btn) return;

      if (!drop.contains(event.target) && !btn.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ----- UI -----
  const BellButton = (
    <div
      ref={buttonRef}
      className='relative cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors'
      onClick={() => setIsOpen(!isOpen)}>
      <Bell
        className={`w-6 h-6 ${isOpen ? "text-primary-600" : "text-gray-500"}`}
      />
      {unreadCount > 0 && (
        <span className='absolute top-0 right-0 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1'>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );

  const Dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      // ✅ Portal dropdown: fixed position by absolute document coordinates
      style={{
        position: "absolute",
        top: dropdownPos.top,
        left: dropdownPos.left,
        transform: "translateX(-100%)", // canh phải theo nút
        zIndex: 999999, // ✅ cực cao để đè mọi thứ
      }}
      className='w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden'>
      <div className='px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center'>
        <h3 className='font-bold text-gray-800 text-sm'>Thông báo</h3>
        <div className='flex gap-3'>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className='text-[11px] text-blue-600 font-medium hover:underline'>
              Đọc tất cả
            </button>
          )}
        </div>
      </div>

      <div className='max-h-[420px] overflow-y-auto custom-scrollbar'>
        {notifications.length === 0 ? (
          <div className='p-12 text-center text-gray-400'>
            <Bell className='w-12 h-12 mx-auto mb-3 opacity-20' />
            <p className='text-sm'>Hộp thư trống</p>
          </div>
        ) : (
          notifications.map((item) => {
            const isRead = readIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`px-4 py-3 border-b border-gray-50 flex gap-3 cursor-pointer relative group transition-all duration-300 ${
                  isRead
                    ? "opacity-60 bg-white"
                    : "bg-blue-50/30 hover:bg-white shadow-inner"
                }`}>
                <div className='absolute right-2 top-2 hidden group-hover:flex gap-1 z-10'>
                  {!isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(e, item.id)}
                      className='p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors'
                      title='Đã đọc'>
                      <Check className='w-3.5 h-3.5' />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDismiss(e, item.id)}
                    className='p-1.5 bg-white shadow-sm border border-gray-100 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors'
                    title='Bỏ qua'>
                    <Trash2 className='w-3.5 h-3.5' />
                  </button>
                </div>

                <div
                  className={`mt-1 p-2 rounded-lg shrink-0 ${getIconColor(
                    item.type
                  )} shadow-sm`}>
                  <item.icon className='w-4 h-4 text-white' />
                </div>

                <div className='flex-1 pr-6'>
                  <div className='flex items-center gap-2'>
                    <p
                      className={`text-sm ${
                        isRead
                          ? "font-medium text-gray-500"
                          : "font-bold text-gray-800"
                      }`}>
                      {item.title}
                    </p>
                    {!isRead && (
                      <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></span>
                    )}
                  </div>

                  <p className='text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed'>
                    {item.message}
                  </p>

                  <p className='text-[10px] text-gray-400 mt-1.5 flex items-center gap-1'>
                    <Clock className='w-3 h-3' />
                    {new Date(item.time).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className='relative'>
      {BellButton}

      {/* ✅ Render dropdown lên body để luôn nổi trên cùng */}
      {isOpen && createPortal(Dropdown, document.body)}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

// --- HELPER ICONS (GIỮ NGUYÊN) ---
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
