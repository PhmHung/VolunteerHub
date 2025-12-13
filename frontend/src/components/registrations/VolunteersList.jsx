/** @format */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Mail,
  Phone,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// SỬA: Import từ eventSlice (để đồng bộ với Dashboard)
import { fetchEventRegistrations } from "../../features/eventSlice";
import {
  acceptRegistration,
  rejectRegistration,
} from "../../features/registrationSlice";
import { REGISTRATION_STATUS } from "../../utils/constants";

// --- Volunteer Card Component ---
const VolunteerCard = ({
  volunteer,
  compact,
  isCreator,
  onAccept,
  onReject,
}) => {
  // Chuẩn hóa dữ liệu user từ prop volunteer
  const user = volunteer.user || {};
  const status = volunteer.status;
  const registeredAt = volunteer.registeredAt;

  if (compact) {
    return (
      <div className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer'>
        <div className='relative'>
          <div className='w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0'>
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.userName}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm'>
                {user.userName?.charAt(0)?.toUpperCase() || "V"}
              </div>
            )}
          </div>
          {status === "registered" && (
            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-gray-900 truncate'>
            {user.userName || "Người dùng"}
          </h4>
          <p className='text-xs text-gray-500 truncate'>
            {status === "registered" ? "Đã tham gia" : "Đang chờ"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition'>
      <div className='flex items-start gap-4'>
        {/* Avatar */}
        <div className='flex-shrink-0'>
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.userName}
              className='w-14 h-14 rounded-full object-cover'
            />
          ) : (
            <div className='w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl'>
              {user.userName?.charAt(0)?.toUpperCase() || "V"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex justify-between items-start'>
            <h3 className='font-semibold text-gray-900 mb-1'>
              {user.userName || "Người dùng"}
            </h3>
            <RegistrationStatusBadge status={status} />
          </div>

          <div className='space-y-1 text-sm text-gray-600'>
            <div className='flex items-center gap-2'>
              <Mail className='w-4 h-4 flex-shrink-0' />
              <span className='truncate'>{user.userEmail}</span>
            </div>

            {user.phoneNumber && (
              <div className='flex items-center gap-2'>
                <Phone className='w-4 h-4 flex-shrink-0' />
                <span>{user.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Action Buttons (Chỉ Manager/Creator mới thấy) */}
          {isCreator && status === "waitlisted" && (
            <div className='mt-3 flex gap-2'>
              <button
                onClick={() => onAccept(volunteer._id)}
                className='px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700'>
                Duyệt
              </button>
              <button
                onClick={() => onReject(volunteer._id)}
                className='px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200'>
                Từ chối
              </button>
            </div>
          )}

          {/* Registration Date */}
          {registeredAt && (
            <div className='mt-2 text-xs text-gray-500'>
              Đăng ký: {new Date(registeredAt).toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RegistrationStatusBadge = ({ status }) => {
  // Map status backend sang config hiển thị
  let mappedStatus = "pending";
  if (status === "registered" || status === "approved")
    mappedStatus = "accepted";
  if (status === "cancelled" || status === "rejected")
    mappedStatus = "rejected";
  if (status === "waitlisted") mappedStatus = "pending";

  const statusConfig =
    REGISTRATION_STATUS[mappedStatus] || REGISTRATION_STATUS.pending;

  const icons = {
    pending: <Clock className='w-4 h-4' />,
    accepted: <CheckCircle className='w-4 h-4' />,
    rejected: <XCircle className='w-4 h-4' />,
  };

  const colors = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium text-sm ${
        colors[statusConfig.color] || colors.gray
      }`}>
      {icons[mappedStatus]}
      {statusConfig.label}
    </div>
  );
};

// --- Main Component ---
const VolunteersList = ({ eventId, currentUser, compact = false }) => {
  const dispatch = useDispatch();

  // SỬA: Lấy registrations từ eventSlice (Nơi lưu data chuẩn)
  const { registrations = [], registrationsLoading } = useSelector(
    (state) => state.event
  );
  const { list: events } = useSelector((state) => state.event);
  const { user: authUser } = useSelector((state) => state.auth);

  const [volunteers, setVolunteers] = useState([]);
  const [canView, setCanView] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const activeUser = currentUser || authUser;

  // 1. Fetch data khi eventId thay đổi
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventRegistrations(eventId));
    }
  }, [eventId, dispatch]);

  // 2. Process Data
  useEffect(() => {
    // Map dữ liệu phẳng để dễ sử dụng
    // registrations từ API trả về mảng object { _id, status, userId: { ...info } }
    const mappedVolunteers = registrations.map((reg) => ({
      _id: reg._id,
      status: reg.status,
      registeredAt: reg.createdAt,
      user: reg.userId || {}, // Object user đã populate
    }));

    // Check quyền
    const event = events.find((e) => e._id === eventId || e.id === eventId);
    const creatorId = event?.createdBy?._id || event?.createdBy;
    const isOwner = creatorId === activeUser?._id;
    setIsCreator(isOwner);

    if (compact) {
      // Compact view: Chỉ hiện người đã tham gia
      setVolunteers(
        mappedVolunteers.filter(
          (v) => v.status === "registered" || v.status === "approved"
        )
      );
      setCanView(true);
    } else {
      // Full view
      // Nếu là chủ sự kiện -> Xem hết
      // Nếu là thành viên -> Chỉ xem nếu đã được duyệt
      const myReg = mappedVolunteers.find(
        (v) => v.user._id === activeUser?._id
      );
      const amIAccepted =
        myReg && (myReg.status === "registered" || myReg.status === "approved");

      if (isOwner || amIAccepted) {
        setVolunteers(mappedVolunteers);
        setCanView(true);
      } else {
        setCanView(false);
      }
    }
  }, [registrations, eventId, events, activeUser, compact]);

  const handleAccept = async (regId) => {
    try {
      await dispatch(acceptRegistration(regId)).unwrap();
      dispatch(fetchEventRegistrations(eventId)); // Reload list
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (regId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối?")) return;
    try {
      await dispatch(
        rejectRegistration({ registrationId: regId, reason: "Admin rejected" })
      ).unwrap();
      dispatch(fetchEventRegistrations(eventId)); // Reload list
    } catch (err) {
      console.error(err);
    }
  };

  if (registrationsLoading) {
    return (
      <div className='p-8 text-center text-gray-500'>Đang tải danh sách...</div>
    );
  }

  if (!canView && !compact) {
    return (
      <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center'>
        <AlertCircle className='w-12 h-12 text-amber-500 mx-auto mb-3' />
        <h3 className='text-lg font-medium'>Chưa thể xem danh sách</h3>
        <p className='text-gray-500'>
          Bạn cần tham gia sự kiện để xem danh sách thành viên.
        </p>
      </div>
    );
  }

  if (volunteers.length === 0) {
    return (
      <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center'>
        <Users className='w-12 h-12 text-gray-300 mx-auto mb-3' />
        <p className='text-gray-500'>Chưa có thành viên nào.</p>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? ""
          : "bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      }>
      {!compact && (
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold text-gray-900'>
            Danh sách tham gia ({volunteers.length})
          </h2>
        </div>
      )}

      <div className='space-y-3'>
        {volunteers.map((volunteer) => (
          <VolunteerCard
            key={volunteer._id}
            volunteer={volunteer}
            compact={compact}
            isCreator={isCreator}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
};

export default VolunteersList;
