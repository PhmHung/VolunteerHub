/** @format */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Search,
  Filter,
} from "lucide-react";
import api from "../api";
import {
  acceptRegistration,
  rejectRegistration,
} from "../features/registration/registrationSlice";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile } = useSelector((state) => state.user);
  const isManagerOrAdmin =
    profile?.role === "admin" || profile?.role === "manager";

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho tab quản lý (chỉ dành cho Admin/Manager)
  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | rejected
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy chi tiết sự kiện
        const eventRes = await api.get(`/api/events/${id}`);
        const eventData = eventRes.data?.data || eventRes.data; // Xử lý nếu data bọc trong object

        // CHECK QUYỀN MANAGER
        if (profile?.role === "manager") {
          const creatorId = eventData.createdBy?._id || eventData.createdBy;
          if (creatorId !== profile._id) {
            setError("Bạn không có quyền truy cập sự kiện này.");
            setLoading(false);
            return;
          }
        }

        setEvent(eventData);

        // 2. Lấy danh sách đăng ký (CHỈ SỬA ĐOẠN NÀY)
        if (isManagerOrAdmin) {
          try {
            // GỌI ĐÚNG ROUTE CỦA EVENT CONTROLLER
            const regRes = await api.get(`/api/events/${id}/registrations`);
            setRegistrations(regRes.data);
          } catch (regError) {
            console.warn("Lỗi tải danh sách đăng ký:", regError);
          }
        }
      } catch (err) {
        console.error("Lỗi tải sự kiện:", err);
        setError("Không thể tải thông tin sự kiện.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, profile, isManagerOrAdmin]);

  // --- HANDLERS ---
  const handleApprove = async (regId) => {
    if (window.confirm("Duyệt người này tham gia sự kiện?")) {
      try {
        await dispatch(acceptRegistration(regId)).unwrap();
        // Cập nhật state local ngay lập tức
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regId ? { ...r, status: "accepted" } : r))
        );
      } catch (error) {
        alert("Lỗi: " + error);
      }
    }
  };

  const handleReject = async (regId) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (reason) {
      try {
        await dispatch(
          rejectRegistration({ registrationId: regId, reason })
        ).unwrap();
        setRegistrations((prev) =>
          prev.map((r) => (r._id === regId ? { ...r, status: "rejected" } : r))
        );
      } catch (error) {
        alert("Lỗi: " + error);
      }
    }
  };

  // --- RENDER HELPERS ---
  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
        <p className='text-red-500 font-medium'>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className='px-4 py-2 bg-gray-200 rounded-lg'>
          Quay lại
        </button>
      </div>
    );
  if (!event) return null;

  // Lọc danh sách đăng ký theo tab và search
  const filteredRegistrations = registrations.filter((reg) => {
    const statusMatch =
      activeTab === "all"
        ? true
        : activeTab === "approved"
        ? reg.status === "accepted" || reg.status === "approved"
        : reg.status === activeTab;

    const searchMatch =
      reg.volunteer?.userName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reg.volunteer?.userEmail
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Header Banner */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-gray-500 hover:text-gray-900 mb-4 transition'>
            <ArrowLeft className='w-4 h-4 mr-1' /> Quay lại
          </button>

          <div className='flex flex-col md:flex-row justify-between items-start gap-6'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase'>
                  {event.category || "Sự kiện"}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase border ${
                    event.status === "approved"
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : event.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}>
                  {event.status === "approved"
                    ? "Đã duyệt"
                    : event.status === "pending"
                    ? "Chờ duyệt"
                    : "Từ chối"}
                </span>
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {event.title}
              </h1>
              <p className='text-gray-500 flex items-center gap-2'>
                <User className='w-4 h-4' />
                Người tạo:{" "}
                <span className='font-medium text-gray-700'>
                  {event.createdBy?.userName || "Admin/Manager"}
                </span>
              </p>
            </div>

            {/* Quick Stats Card */}
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-6 text-sm'>
              <div className='text-center'>
                <p className='text-gray-500 mb-1'>Quy mô</p>
                <p className='font-bold text-gray-900 text-lg'>
                  {event.maxParticipants}
                </p>
              </div>
              <div className='w-px bg-gray-200'></div>
              <div className='text-center'>
                <p className='text-gray-500 mb-1'>Đã đăng ký</p>
                <p className='font-bold text-emerald-600 text-lg'>
                  {
                    registrations.filter(
                      (r) => r.status === "accepted" || r.status === "approved"
                    ).length
                  }
                </p>
              </div>
              <div className='w-px bg-gray-200'></div>
              <div className='text-center'>
                <p className='text-gray-500 mb-1'>Chờ duyệt</p>
                <p className='font-bold text-amber-500 text-lg'>
                  {registrations.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* LEFT COLUMN: Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Image */}
            <div className='rounded-2xl overflow-hidden shadow-sm h-64 sm:h-80 bg-gray-200'>
              <img
                src={event.image || "https://via.placeholder.com/800x400"}
                alt={event.title}
                className='w-full h-full object-cover'
              />
            </div>

            {/* Description */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Mô tả chi tiết
              </h3>
              <p className='text-gray-600 whitespace-pre-line leading-relaxed'>
                {event.description}
              </p>
            </div>

            {/* --- MANAGEMENT SECTION (Only for Admin/Manager) --- */}
            {isManagerOrAdmin && (
              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4'>
                  <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                    <Users className='w-5 h-5 text-emerald-600' />
                    Quản lý người tham gia
                  </h3>

                  {/* Search */}
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Tìm tên, email...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-64'
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className='flex border-b border-gray-100 bg-gray-50/50 px-6'>
                  {[
                    { id: "pending", label: "Chờ duyệt", icon: Clock },
                    { id: "approved", label: "Đã tham gia", icon: CheckCircle },
                    { id: "rejected", label: "Đã từ chối", icon: XCircle },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        activeTab === tab.id
                          ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}>
                      <tab.icon className='w-4 h-4' /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* List */}
                <div className='divide-y divide-gray-50 max-h-[500px] overflow-y-auto'>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <div
                        key={reg._id}
                        className='p-4 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0'>
                            {reg.volunteer?.profilePicture ? (
                              <img
                                src={reg.volunteer.profilePicture}
                                alt=''
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <span className='font-bold text-gray-400'>
                                {reg.volunteer?.userName?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {reg.volunteer?.userName || "Unknown User"}
                            </p>
                            <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500'>
                              <span className='flex items-center gap-1'>
                                <Mail className='w-3 h-3' />{" "}
                                {reg.volunteer?.userEmail}
                              </span>
                              <span className='hidden sm:inline'>•</span>
                              <span className='flex items-center gap-1'>
                                <Phone className='w-3 h-3' />{" "}
                                {reg.volunteer?.phoneNumber || "---"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
                          {reg.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(reg._id)}
                                className='px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition'>
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleReject(reg._id)}
                                className='px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition'>
                                Từ chối
                              </button>
                            </>
                          )}
                          {(reg.status === "accepted" ||
                            reg.status === "approved") && (
                            <span className='flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100'>
                              <CheckCircle className='w-3 h-3' /> Đã tham gia
                            </span>
                          )}
                          {reg.status === "rejected" && (
                            <span className='flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100'>
                              <XCircle className='w-3 h-3' /> Đã từ chối
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='p-8 text-center text-gray-500'>
                      Không có đăng ký nào trong danh sách này.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Info */}
          <div className='space-y-6'>
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
              <h4 className='font-bold text-gray-900 mb-2'>
                Thông tin thời gian & Địa điểm
              </h4>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0'>
                  <Calendar className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Ngày bắt đầu
                  </p>
                  <p className='text-gray-900 font-semibold'>
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                  <p className='text-xs text-gray-400'>
                    {event.startDate
                      ? new Date(event.startDate).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0'>
                  <MapPin className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Địa điểm</p>
                  <p className='text-gray-900 font-semibold'>
                    {event.location}
                  </p>
                  <p className='text-xs text-gray-400'>
                    {event.city || "Việt Nam"}
                  </p>
                </div>
              </div>
            </div>

            {/* Volunteer Action (Nếu là Volunteer xem trang này) */}
            {!isManagerOrAdmin && (
              <div className='bg-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-emerald-200'>
                <h4 className='text-xl font-bold mb-2'>Tham gia ngay!</h4>
                <p className='text-emerald-100 text-sm mb-6'>
                  Hãy chung tay đóng góp cho cộng đồng bằng cách tham gia sự
                  kiện này.
                </p>
                <button className='w-full py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition shadow-sm'>
                  Đăng ký tham gia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
