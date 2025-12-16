/** @format */

import React, { useEffect, useState } from "react";
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
import { checkInByQr } from "../features/registrationSlice";


// components
import EventFeed from "../components/socials/EventFeed";
import EventTabs from "../components/events/EventTabs";
import EventReviews from "../components/events/EventReviews"; // Import Component Đánh giá
import VolunteersList from "../components/registrations/VolunteersList";
import MyRegistrationStatus from "../components/registrations/MyRegistrationStatus";

/* ======================================================
   EVENT DETAIL VIEW
====================================================== */
const EventDetailView = ({ event, user, onBack }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("discussion");
  const [scannedToken, setScannedToken] = useState(null);
  const [scanError, setScanError] = useState(null);


  const { myQrToken, qrLoading } = useSelector(
  (state) => state.registration
);

useEffect(() => {
  if (activeTab === "qr" && user.role === "volunteer") {
    dispatch(fetchMyQRCode(event._id));
  }
}, []);


  useEffect(() => {
    dispatch(fetchChannelByEventId(event._id));
    return () => dispatch(clearChannel());
  }, [dispatch, event._id]);

  return (
    <div className="flex-1 bg-surface-50 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-10">
        {/* Back */}
        <div className="p-4 sticky top-0 z-30 bg-white border-b shadow-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
        {/* Header */}
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
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="px-4 lg:px-8 mt-6">
          <MyRegistrationStatus eventId={event._id} userId={user._id} />

          {activeTab === "discussion" && (
            <EventFeed event={event} user={user} />
          )}
          {activeTab === "reviews" && (
             <EventReviews user={user} eventId={event._id} />
          )}
          {activeTab === "members" && (
            <VolunteersList eventId={event._id} user={user} />
          )}

          {activeTab === "about" && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Giới thiệu</h2>
              <p className="text-text-secondary whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {activeTab === "media" && (
            <div className="card p-12 text-center">
              <ImageIcon className="w-10 h-10 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">Chưa có hình ảnh</p>
            </div>
          )}

{activeTab === "qr" && (
  <div className="card p-6 text-center">
    <h2 className="text-xl font-bold mb-4">
      {user.role === "volunteer"
        ? "Mã QR của bạn"
        : "Quét mã QR tình nguyện viên"}
    </h2>

    {/* ================= VOLUNTEER ================= */}
    {user.role === "volunteer" && (
      <>
        {qrLoading && <p>Đang tải QR...</p>}

        {myQrToken && (
          <div className="flex justify-center">
            <QRCode value={myQrToken} size={220} />
          </div>
        )}

        {!myQrToken && !qrLoading && (
          <p className="text-text-muted">
            Bạn chưa có mã QR cho sự kiện này
          </p>
        )}
      </>
    )}

{/* ================= MANAGER ================= */}
{user.role === "manager" && (
  <div className="max-w-sm mx-auto">
    <ManagerQrScanner
      onScanSuccess={(token) => {
        setScannedToken(token);

        // GỬI QR TOKEN VỀ BACKEND
        dispatch(
          checkInByQr({
            qrToken: token,
          })
        );
      }}
      onScanError={(err) => {
        setScanError(err);
      }}
    />

    {scannedToken && (
      <p className="mt-4 text-green-600 font-medium break-all">
        ✔ Đã quét: {scannedToken}
      </p>
    )}

    {scanError && (
      <p className="mt-4 text-red-500 text-sm">
        {scanError}
      </p>
    )}
  </div>
)}

  </div>
)}

        </div>
      </div>
    </div>
  );
};

/* ======================================================
   MEDIA (COMMUNITY LIST)
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
    <div className="flex-1 bg-surface-50 h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 lg:p-10">
        <h1 className="text-3xl font-bold mb-2">Cộng đồng của tôi</h1>
        <p className="text-text-secondary mb-8">
          Các sự kiện bạn đang tham gia
        </p>

        {!loading && myEvents.length === 0 && (
          <div className="card text-center py-16">
            <Calendar className="w-12 h-12 mx-auto text-primary-500 mb-4" />
            <p className="text-text-secondary">
              Bạn chưa tham gia cộng đồng nào
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {myEvents.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-2/5 h-60">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="btn-primary mt-6 flex items-center justify-center gap-2"
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