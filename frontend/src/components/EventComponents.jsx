/** @format */

import React, { useState, useMemo, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import {
  Calendar,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Filter,
  User,
} from "lucide-react";

import { REGISTRATION_STATUS, ATTENDANCE_STATUS } from "../types";

export const EventDetails = ({
  event,
  onAttendeeRequestChange,
  onViewDetail,
}) => {
  //console.log("--> Dữ liệu nhận được trong EventDetails:", event?.attendees);

  // 2. STATE
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // 3. CHUẨN BỊ DỮ LIỆU
  const attendees = useMemo(() => event?.attendees || [], [event]);
  const maxParticipants = event?.maxParticipants || 0;

  // 4. THỐNG KÊ (Để hiển thị số lượng trên Tab)
  const stats = useMemo(
    () => ({
      pending: attendees.filter(
        (a) => a.requestStatus === REGISTRATION_STATUS.WAITLISTED
      ).length,
      approved: attendees.filter(
        (a) => a.requestStatus === REGISTRATION_STATUS.REGISTERED
      ).length,
      rejected: attendees.filter(
        (a) => a.requestStatus === REGISTRATION_STATUS.CANCELLED
      ).length,
    }),
    [attendees]
  );

  // 5. TỰ ĐỘNG CHỌN TAB (Smart Tab)
  // Logic: Nếu tab hiện tại trống mà tab khác có dữ liệu -> Chuyển sang tab đó
  useEffect(() => {
    if (attendees.length > 0) {
      if (stats.pending > 0) {
        setActiveTab("pending");
      } else if (stats.approved > 0) {
        setActiveTab("approved"); // Tự động nhảy sang tab "Đã tham gia" nếu có người
      }
    }
  }, [event?.id, stats.pending, stats.approved, attendees.length]);

  // 6. LỌC DANH SÁCH HIỂN THỊ
  const filteredAttendees = useMemo(() => {
    if (!attendees.length) return [];

    return attendees.filter((a) => {
      let statusMatch = false;
      // So sánh status
      if (activeTab === "pending")
        statusMatch = a.requestStatus === REGISTRATION_STATUS.WAITLISTED;
      if (activeTab === "approved")
        statusMatch = a.requestStatus === REGISTRATION_STATUS.REGISTERED;
      if (activeTab === "rejected")
        statusMatch = a.requestStatus === REGISTRATION_STATUS.CANCELLED;

      // Tìm kiếm
      const searchMatch =
        (a.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (a.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [attendees, activeTab, searchTerm]);

  // Tính toán thanh tiến độ (Ưu tiên số tổng từ Event cha truyền xuống)
  const currentParticipants =
    event?.attendeesCount !== undefined ? event.attendeesCount : stats.approved;
  const progressPercent =
    maxParticipants > 0
      ? Math.min((currentParticipants / maxParticipants) * 100, 100)
      : 0;

  if (!event) return null;

  return (
    <div className='flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {/* HEADER */}
      <div className='p-6 border-b border-gray-100 bg-gray-50/50'>
        <div className='flex flex-col md:flex-row justify-between items-start gap-4 mb-4'>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              {event.title}
            </h2>
            <div className='flex gap-4 text-sm text-gray-600'>
              <span className='flex items-center gap-1'>
                <Calendar className='w-4 h-4 text-primary-500' />{" "}
                {new Date(event.startDate).toLocaleDateString("vi-VN")}
              </span>
              <span className='flex items-center gap-1 text-green-600 font-medium'>
                <Clock className='w-4 h-4' /> Đang phụ trách
              </span>
            </div>
          </div>
          {/* PROGRESS BAR */}
          <div className='bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-full md:w-56'>
            <div className='flex justify-between text-xs font-medium mb-1.5'>
              <span>Đã tham gia</span>
              <span className='text-primary-700 font-bold'>
                {currentParticipants} / {maxParticipants}
              </span>
            </div>
            <div className='w-full bg-gray-100 rounded-full h-2'>
              <div
                className='bg-primary-500 h-2 rounded-full transition-all duration-500'
                style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* TABS & SEARCH */}
        <div className='flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center mt-6'>
          <div className='flex p-1 bg-gray-200/60 rounded-lg'>
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              label='Chờ duyệt'
              count={stats.pending}
              color='yellow'
            />
            <TabButton
              active={activeTab === "approved"}
              onClick={() => setActiveTab("approved")}
              label='Đã tham gia'
              count={stats.approved}
              color='green'
            />
            <TabButton
              active={activeTab === "rejected"}
              onClick={() => setActiveTab("rejected")}
              label='Đã từ chối'
              count={stats.rejected}
              color='red'
            />
          </div>
          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Tìm tên, email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20'
            />
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      {/* TABLE */}
      <div className='flex-1 overflow-y-auto bg-white'>
        {filteredAttendees.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-48 text-gray-400'>
            <Filter className='w-10 h-10 mb-3 opacity-20' />
            <p className='text-sm'>
              {/* Debug dòng này nếu vẫn trống */}
              {attendees.length > 0
                ? "Không tìm thấy kết quả ở tab này"
                : "Danh sách trống (Chưa có dữ liệu từ API)"}
            </p>
          </div>
        ) : (
          <table className='w-full text-left border-collapse'>
            <thead className='bg-gray-50 sticky top-0 z-10 text-xs uppercase text-gray-500 font-semibold'>
              <tr>
                <th className='px-6 py-3 border-b'>Tình nguyện viên</th>
                <th className='px-6 py-3 border-b'>Liên hệ</th>
                <th className='px-6 py-3 border-b text-center'>Hồ sơ</th>
                <th className='px-6 py-3 border-b text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {filteredAttendees.map((attendee) => (
                <tr
                  key={attendee.regId}
                  className='hover:bg-gray-50/50 transition-colors'>
                  {/* CỘT 1: AVATAR & TÊN */}
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0'>
                        {attendee.avatarUrl ? (
                          <img
                            src={attendee.avatarUrl}
                            alt=''
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-gray-400 bg-gray-100'>
                            <User className='w-5 h-5' />
                          </div>
                        )}
                      </div>
                      <div>
                        {/* HIỂN THỊ TÊN TẠI ĐÂY */}
                        <p className='font-medium text-sm text-gray-800'>
                          {attendee.name}
                        </p>

                        {/* Status điểm danh */}
                        {activeTab === "approved" && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border inline-block mt-0.5 bg-gray-50 text-gray-500 border-gray-100`}>
                            {attendee.completionStatus ===
                            ATTENDANCE_STATUS.COMPLETED
                              ? "Hoàn thành"
                              : "Đang thực hiện"}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* CỘT 2: EMAIL & PHONE */}
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <Mail className='w-3.5 h-3.5 text-gray-400' />
                        {/* HIỂN THỊ EMAIL TẠI ĐÂY */}
                        <span
                          className='truncate max-w-[180px]'
                          title={attendee.email}>
                          {attendee.email}
                        </span>
                      </div>
                      {attendee.phoneNumber && (
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                          <span className='w-3.5 h-3.5 flex items-center justify-center'>
                            📞
                          </span>
                          <span>{attendee.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className='text-center'>
                    <button
                      onClick={() => onViewDetail(attendee.id)} // Gọi hàm từ cha truyền xuống
                      className='text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50'
                      title='Xem hồ sơ chi tiết'>
                      <FaEye size={18} />
                    </button>
                  </td>

                  {/* CỘT 3: HÀNH ĐỘNG */}
                  <td className='px-6 py-4 text-right'>
                    {/* ... (Giữ nguyên các nút bấm cũ) ... */}
                    {activeTab === "pending" && (
                      <div className='flex justify-end gap-2'>
                        <ActionButton
                          onClick={() =>
                            onAttendeeRequestChange(
                              event.id,
                              attendee.id,
                              REGISTRATION_STATUS.REGISTERED
                            )
                          }
                          icon={CheckCircle}
                          label='Duyệt'
                          variant='success'
                        />
                        <ActionButton
                          onClick={() =>
                            onAttendeeRequestChange(
                              event.id,
                              attendee.id,
                              REGISTRATION_STATUS.CANCELLED
                            )
                          }
                          icon={XCircle}
                          label='Từ chối'
                          variant='danger'
                        />
                      </div>
                    )}
                    {activeTab === "approved" && (
                      <button
                        onClick={() =>
                          onAttendeeRequestChange(
                            event.id,
                            attendee.id,
                            REGISTRATION_STATUS.CANCELLED
                          )
                        }
                        className='text-red-500 hover:underline text-xs'>
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---
const TabButton = ({ active, onClick, label, count, color }) => {
  const badgeColors = {
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 ${
        active
          ? "bg-white text-gray-800 shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
      }`}>
      {label}
      {count > 0 && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] ${badgeColors[color]}`}>
          {count}
        </span>
      )}
    </button>
  );
};

const ActionButton = ({ onClick, icon, label, variant }) => {
  const IconComponent = icon;
  const styles =
    variant === "success"
      ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
      : "bg-red-50 text-red-700 hover:bg-red-100 border-red-200";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${styles}`}
      title={label}>
      {IconComponent && <IconComponent className='w-3.5 h-3.5' />}
      {label}
    </button>
  );
};

export default { EventDetails };
