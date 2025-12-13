/** @format */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Search,
  Info,
  Clock,
  Image,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchEvents } from "../features/eventSlice";
import { fetchMyRegistrations } from "../features/registrationSlice";

// Import new components
import EventFeed from "../components/socials/EventFeed";
import VolunteersList from "../components/registrations/VolunteersList";
import EventHeader from "../components/events/EventHeader";
import EventTabs from "../components/events/EventTabs";
import MyRegistrationStatus from "../components/registrations/MyRegistrationStatus";

const EventDetailView = ({ event, user, onBack }) => {
  const [activeTab, setActiveTab] = useState("discussion");

  return (
    <div className='flex-1 bg-surface-50 h-screen overflow-y-auto'>
      <div className='max-w-6xl mx-auto pb-10'>
        {/* Back Button */}
        <div className='p-4 sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200'>
            <ArrowLeft className='w-5 h-5' />
            Quay lại danh sách
          </button>
        </div>

        {/* Header Section */}
        <EventHeader event={event} />

        {/* Tabs Navigation */}
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-8 mt-6'>
          {/* Right Feed/Content */}
          <div className='lg:col-span-3'>
            {/* Registration Status */}
            <div className='mb-4'>
              <MyRegistrationStatus
                eventId={event._id || event.id}
                userId={user._id}
              />
            </div>

            {activeTab === "discussion" && (
              <EventFeed user={user} event={event} />
            )}
            {activeTab === "about" && (
              <div className='card p-6'>
                <h2 className='text-xl font-bold mb-4 text-text-main'>
                  Giới thiệu chi tiết
                </h2>
                <p className='text-text-secondary whitespace-pre-line leading-relaxed'>
                  {event.description}
                </p>
                <div className='mt-6 pt-6 border-t border-border'>
                  <h3 className='font-bold mb-2 text-text-main'>Yêu cầu</h3>
                  <p className='text-text-secondary'>{event.requirements}</p>
                </div>
              </div>
            )}
            {activeTab === "members" && (
              <VolunteersList eventId={event._id || event.id} user={user} />
            )}
            {activeTab === "media" && (
              <div className='card p-12 text-center'>
                <div className='w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Image className='w-8 h-8 text-text-muted' />
                </div>
                <h3 className='text-lg font-medium text-text-main'>
                  Thư viện ảnh
                </h3>
                <p className='text-text-muted mt-1'>
                  Chưa có hình ảnh nào được tải lên.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Media = ({ user }) => {
  const dispatch = useDispatch();
  const { list: allEvents } = useSelector((state) => state.event);
  const { myRegistrations } = useSelector((state) => state.registration);

  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load events and registrations
  useEffect(() => {
    if (!user) return;
    dispatch(fetchEvents());
    dispatch(fetchMyRegistrations());
  }, [dispatch, user]);

  // Filter events based on user role
  useEffect(() => {
    if (!user || allEvents.length === 0) return;

    if (user.role === "manager") {
      // If manager, show events created by them
      const managerEvents = allEvents.filter((e) => e.createdBy === user._id);
      setMyEvents(managerEvents);
    } else {
      // If volunteer, show events they are accepted in
      // Filter for accepted registrations
      const acceptedRegs = myRegistrations.filter(
        (reg) => reg.status === "accepted"
      );

      // Get event details for these registrations
      const events = acceptedRegs
        .map((reg) => {
          const eventId = reg.eventId?._id || reg.eventId;
          const event = allEvents.find(
            (e) => e._id === eventId || e.id === eventId
          );
          return event ? { ...event, registrationId: reg._id } : null;
        })
        .filter(Boolean);

      setMyEvents(events);
    }
  }, [user, allEvents, myRegistrations]);

  if (selectedEvent) {
    return (
      <div className='w-full md:flex h-screen overflow-hidden bg-surface-50'>
        <EventDetailView
          event={selectedEvent}
          user={user}
          onBack={() => setSelectedEvent(null)}
        />
      </div>
    );
  }

  return (
    <div className='w-full md:flex h-screen overflow-hidden bg-surface-50'>
      <div className='flex-1 overflow-y-auto bg-surface-50/50'>
        <div className='max-w-5xl mx-auto p-6 lg:p-10'>
          <div className='mb-10'>
            <h1 className='text-3xl font-bold text-text-main mb-2'>
              Cộng đồng của tôi
            </h1>
            <p className='text-text-secondary'>
              Các sự kiện bạn đã tham gia và được chấp nhận
            </p>
          </div>

          {myEvents.length === 0 ? (
            <div className='text-center py-16 card'>
              <div className='w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Calendar className='w-10 h-10 text-primary-600' />
              </div>
              <h3 className='text-xl font-bold text-text-main mb-2'>
                Chưa có cộng đồng nào
              </h3>
              <p className='text-text-secondary max-w-md mx-auto'>
                Bạn chưa có sự kiện nào được duyệt tham gia. Hãy đăng ký sự kiện
                mới và chờ quản trị viên xét duyệt nhé!
              </p>
            </div>
          ) : (
            <div className='grid gap-8'>
              {myEvents.map((event) => {
                return (
                  <motion.div
                    key={event._id || event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='group relative card hover:shadow-xl transition-all duration-300 overflow-hidden'>
                    <div className='flex flex-col md:flex-row'>
                      {/* Left: Image & Date */}
                      <div className='md:w-2/5 relative h-64 md:h-auto overflow-hidden'>
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/50' />

                        <div className='absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg'>
                          <p className='text-xs font-bold text-text-secondary uppercase tracking-wider mb-0.5'>
                            Tháng {new Date(event.startDate).getMonth() + 1}
                          </p>
                          <p className='text-2xl font-black text-text-main leading-none'>
                            {new Date(event.startDate).getDate()}
                          </p>
                        </div>

                        <div className='absolute bottom-4 left-4 text-white md:hidden'>
                          <span className='px-3 py-1 bg-primary-600 rounded-full text-xs font-bold shadow-lg'>
                            {event.category}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Divider (Visual) */}
                      <div className='hidden md:flex flex-col justify-between py-4 relative w-8 bg-surface-50 border-l border-r border-dashed border-border'>
                        <div className='w-8 h-8 rounded-full bg-surface-50 border border-border absolute -top-4 -left-4 z-10'></div>
                        <div className='w-8 h-8 rounded-full bg-surface-50 border border-border absolute -bottom-4 -left-4 z-10'></div>
                      </div>

                      {/* Right: Content */}
                      <div className='flex-1 p-6 md:p-8 flex flex-col justify-between bg-white relative'>
                        <div>
                          <div className='flex justify-between items-start mb-4'>
                            <span className='hidden md:inline-block px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider'>
                              {event.category}
                            </span>
                            <div className='flex items-center gap-2'>
                              <span className='w-2 h-2 rounded-full bg-success-500 animate-pulse'></span>
                              <span className='text-xs font-bold text-success-600 uppercase tracking-wider'>
                                Đã xác nhận
                              </span>
                            </div>
                          </div>

                          <h3 className='text-2xl font-bold text-text-main mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors'>
                            {event.title}
                          </h3>

                          <div className='space-y-3 text-text-secondary'>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-text-muted'>
                                <Clock className='w-4 h-4' />
                              </div>
                              <span className='font-medium'>
                                {event.startTime} - {event.endTime}
                              </span>
                            </div>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-text-muted'>
                                <MapPin className='w-4 h-4' />
                              </div>
                              <span className='font-medium line-clamp-1'>
                                {event.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center gap-4 mt-8 pt-6 border-t border-border'>
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className='flex-1 btn-primary flex items-center justify-center gap-2 group/btn'>
                            <MessageSquare className='w-5 h-5 group-hover/btn:scale-110 transition-transform' />
                            Vào khu vực thảo luận
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Media;
