/** @format */

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "../components/socials/QRCode.jsx";
import ManagerQrScanner from "../components/socials/ManagerQrScanner.jsx";
// redux
import { fetchMyEvents } from "../features/eventSlice";
import { fetchChannelByEventId, clearChannel } from "../features/channelSlice";
import { fetchMyQRCode } from "../features/registrationSlice";
import { checkOutByQr } from "../features/registrationSlice";

// components
import EventFeed from "../components/socials/EventFeed";
import EventTabs from "../components/events/EventTabs";
import EventReviews from "../components/events/EventReview";
import VolunteersList from "../components/registrations/VolunteersList";
import MyRegistrationStatus from "../components/registrations/MyRegistrationStatus";
import { EventMediaGallery } from "../components/socials/EventMediaGallery.jsx";

/* ======================================================
   EVENT DETAIL VIEW (Trang chi tiết sự kiện)
====================================================== */
const EventDetailView = ({ event, user, onBack }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("discussion");
  const [scanError, setScanError] = useState(null);

  const {
  checkOutMessage,
  checkOutError,
  checkOutLoading,
} = useSelector((state) => state.registration);


  const { myQrToken, qrLoading } = useSelector((state) => state.registration);
  const [scrollToPostId, setScrollToPostId] = useState(null);

  const currentChannel = useSelector(
  (state) => state.channel.current
);



  useEffect(() => {
    if (activeTab === "qr" && user.role === "volunteer") {
      dispatch(fetchMyQRCode(event._id));
    }
  }, [activeTab, user.role, event._id, dispatch]);

  useEffect(() => {
    dispatch(fetchChannelByEventId(event._id));
    return () => dispatch(clearChannel());
  }, [dispatch, event._id]);

  const handleScanSuccess = useCallback(
  (token) => {
    dispatch(checkOutByQr({ qrToken: token }));
  },
  [dispatch]
);


  const handleScanError = useCallback((err) => {
    setScanError(err);
  }, []);

  const attendances = currentChannel?.attendances || [];

  const attendanceRegistrations = attendances.map((att) => ({
    _id: att._id,
    userId: att.regId?.userId,
    status: att.status,
    registeredAt: att.regId?.registeredAt,
    checkOut: att.checkOut,
    feedback: att.feedback,
  }));


  return (
    <div className="flex-1 bg-surface-50 min-h-screen">
      <div className="max-w-6xl mx-auto pb-10">
        {/* Back */}
        <div className="p-4 bg-white border-b shadow-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>

        {/* Banner */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="opacity-90 mt-1">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {/* Tabs */}
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="px-4 lg:px-8 mt-6">
          <MyRegistrationStatus eventId={event._id} userId={user._id} />

          {activeTab === "discussion" && (
            <EventFeed 
            event={event} 
            user={user} 
            scrollToPostId={scrollToPostId}
  onScrolled={() => setScrollToPostId(null)}
/>
          )}
          {activeTab === "reviews" && (
            <EventReviews user={user} eventId={event._id} />
          )}
          {activeTab === "members" && (
  <div className="card p-6">
    <VolunteersList
      registrations={attendanceRegistrations}
      compact={false}
      canView={true}
      onUserClick={(user) => {
        console.log("Click user:", user);
      }}
    />
  </div>
)}


          {activeTab === "reviews" && <EventReviews user={user} eventId={event._id} />}
          {activeTab === "members" && <VolunteersList eventId={event._id} user={user} />}
          {activeTab === "about" && (
            <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Giới thiệu</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

{activeTab === "media" && (
  <EventMediaGallery
    posts={currentChannel?.posts || []}
    user={user}
    eventId={event._id || event.id}
  />
)}


          {activeTab === "qr" && (
            <div className="card p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">
                {user.role === "volunteer" ? "Mã QR của bạn" : "Quét mã QR tình nguyện viên"}
              </h2>
              {user.role === "volunteer" && (
                <>
                  {qrLoading && <p className="animate-pulse">Đang tải QR...</p>}
                  {myQrToken && (
                    <div className="flex justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 w-fit mx-auto">
                      <QRCode value={myQrToken} size={220} />
                    </div>
                  )}
                  {!myQrToken && !qrLoading && (
                    <p className="text-gray-400">Bạn chưa có mã QR cho sự kiện này</p>
                  )}
                </>
              )}
              {user.role === "manager" && (
                <div className="max-w-sm mx-auto">
                  <ManagerQrScanner
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                  />

                  {checkOutLoading && (
  <p className="mt-4 text-blue-500 font-medium">
    ⏳ Đang xử lý check-out...
  </p>
)}

{checkOutMessage && (
  <p className="mt-4 text-green-600 font-semibold">
    ✔ {checkOutMessage}
  </p>
)}

{checkOutError && (
  <p className="mt-4 text-red-500 font-medium">
    ❌ {checkOutError}
  </p>
)}


                  {scanError && (
                    <p className='mt-4 text-red-500 text-sm'>{scanError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KHỐI HIỂN THỊ CHI TIẾT BÀI VIẾT (MEDIA DETAIL VIEW) */}
      {selectedPostDetail && (
        <PostDetailModal
          post={selectedPostDetail}
          currentUser={user}
          eventId={event._id}
          onClose={() => setSelectedPostDetail(null)}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

/* ======================================================
   MEDIA PAGE (Danh sách cộng đồng)
====================================================== */
const Media = ({ user }) => {
  const dispatch = useDispatch();
  const { myEvents, loading } = useSelector((state) => state.event);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchMyEvents());
  }, [dispatch, user]);

  if (selectedEvent) {
    return (
      <EventDetailView
        event={selectedEvent}
        user={user}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className="flex-1 bg-surface-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <h1 className="text-3xl font-bold mb-2">Cộng đồng của tôi</h1>
        <p className="text-text-secondary mb-8">
          Các sự kiện bạn đang tham gia
        </p>

        {!loading && myEvents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20 px-6">
            <Calendar className="w-16 h-16 mx-auto text-blue-100 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có cộng đồng nào</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Hãy tham gia các sự kiện tình nguyện để kết nối với cộng đồng.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {myEvents.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Image */}
                <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Bắt đầu: {new Date(event.startDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Vào thảo luận
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Media;