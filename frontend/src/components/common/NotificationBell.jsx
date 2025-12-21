/** @format */

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const dropdownRef = useRef(null);

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

  // --- 1. FETCH DATA ---
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

  // NotificationBell.jsx

  useEffect(() => {
    if (!user?._id) return;

    const handleSocket = (data) => {
      // 1. Hiện Toast báo hiệu (Cái này hiện ngay lập tức)
      addToast(data.message, data.type || "info");

      // 2. 🔥 QUAN TRỌNG: Gọi lại các hàm fetch để "Chuông" tự cập nhật số lượng
      // Bạn phải fetch CẢ dữ liệu đăng ký (Registrations) thì chuông mới nhảy số
      if (role === "admin") {
        dispatch(fetchPendingApprovals());
        dispatch(fetchManagementEvents({ status: "pending" }));
        dispatch(fetchAllRegistrations()); // <-- Phải có cái này để hiện "Yêu cầu tham gia mới"
      } else if (role === "manager") {
        dispatch(fetchMyRequests());
        dispatch(fetchAllRegistrations()); // <-- Phải có cái này để Manager thấy TNV vừa đăng ký
        dispatch(fetchMyEvents({ limit: 100 }));
      } else if (role === "volunteer") {
        dispatch(fetchMyRegistrations());
        // Nếu có link về /information, có thể là vừa được duyệt lên Manager
        if (data.link === "/information") dispatch(fetchUserProfile());
      }
    };

    socket.on("NOTIFICATION", handleSocket);

    return () => {
      socket.off("NOTIFICATION", handleSocket);
    };
  }, [dispatch, user?._id, role]); // Thêm role vào đây để khi đổi vai trò listener vẫn chạy đúng

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
    setReadIds((prev) => {
      // Sử dụng Set để tránh trùng lặp ID
      const newReadIds = new Set([...prev, ...allIds]);
      return Array.from(newReadIds);
    });
  };
  // --- 2. XỬ LÝ LOGIC THÔNG BÁO ---
  const notifications = useMemo(() => {
    let list = [];

    // === ADMIN === ?? Đang lõi route

    if (role === "admin") {
      // 1. Thông báo Sự kiện mới chờ duyệt (Tab Quản lý sự kiện)
      const newEvents = allEvents.filter((e) => e.status === "pending");
      newEvents.forEach((e) => {
        list.push({
          id: `new_event_${e._id}`,
          title: "Sự kiện mới chờ duyệt",
          message: `Sự kiện "${e.title}" vừa được tạo và đang chờ bạn phê duyệt.`,
          type: "info",
          time: e.createdAt,
          icon: CalendarIcon,
          // Dẫn đến tab Quản lý sự kiện, mở modal view và highlight
          link: `/admin/dashboard?tab=events_management&action=view&highlight=${e._id}`,
        });
      });

      // 2. Thông báo Duyệt đăng ký tham gia của Volunteer (Tab Duyệt đăng ký)
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
            // Trỏ về tab volunteers (Duyệt đăng ký) và highlight đơn đó
            link: `/admin/dashboard?tab=volunteers&highlight=${reg._id}`,
          });
        });

      pendingApprovals.forEach((req) => {
        // 3. Thông báo Yêu cầu HỦY sự kiện (Tab Quản lý sự kiện)
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
            // Dẫn đến tab Quản lý sự kiện, mở modal review_cancel và highlight sự kiện
            link: `/admin/dashboard?tab=events_management&action=review_cancel&highlight=${
              req.event?._id || req.event
            }`,
          });
        }
        // 4. Thông báo Yêu cầu thăng cấp Manager chủ động (Tab Duyệt Manager)
        else if (req.type === "manager_promotion") {
          const isNewRegistration =
            !req.promotionData || req.promotionData.eventsCompleted === 0;

          list.push({
            id: req._id,
            title: isNewRegistration
              ? "Đăng ký tài khoản Manager/Admin"
              : "Yêu cầu thăng cấp",
            message: isNewRegistration
              ? `Người dùng ${
                  req.requestedBy?.userName || "Hội viên"
                } yêu cầu quyền quản trị khi đăng ký.`
              : `TNV ${
                  req.requestedBy?.userName || "Hội viên"
                } đang chờ duyệt thăng cấp Manager.`,
            type: isNewRegistration ? "info" : "warning",
            time: req.createdAt,
            icon: UserIcon,
            link: `/admin/dashboard?tab=managers&action=review_promotion&highlight=${req._id}`,
          });
        }
      });

      // 5. Thông báo Gợi ý ứng viên tiềm năng
      suggestedManagers.forEach((suggest) => {
        list.push({
          id: `suggest_${suggest._id}`,
          title: "Ứng viên Manager tiềm năng",
          message: `Hệ thống gợi ý thăng cấp cho "${suggest.userName}" dựa trên hoạt động tích cực.`,
          type: "success",
          time: new Date(),
          icon: CheckIcon,
          // Dẫn đến tab suggestions (Gợi ý Manager) và highlight User đó
          link: `/admin/dashboard?tab=suggestions&highlight=${suggest._id}`,
        });
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

    return list
      .filter((item) => !dismissedIds.includes(item.id)) // Loại bỏ thông báo bị ẩn
      .sort((a, b) => {
        const aRead = readIds.includes(a.id);
        const bRead = readIds.includes(b.id);

        // 1. Nếu một cái chưa đọc (false) và một cái đã đọc (true)
        // false - true = -1 (đẩy lên đầu)
        if (aRead !== bRead) {
          return aRead ? 1 : -1;
        }

        // 2. Nếu cùng trạng thái đọc/chưa đọc, sắp xếp theo thời gian mới nhất
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
    if (!readIds.includes(item.id)) setReadIds([...readIds, item.id]); // Tự động đánh dấu đã đọc khi click
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
        className='relative cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors'
        onClick={() => setIsOpen(!isOpen)}>
        <Bell
          className={`w-6 h-6 ${isOpen ? "text-primary-600" : "text-gray-500"}`}
        />
        {unreadCount > 0 && (
          <span className='absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1'>
            {unreadCount > 99 ? "9" : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className='absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50'>
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
                    {/* NÚT THAO TÁC (Hiện khi hover) */}
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
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
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
