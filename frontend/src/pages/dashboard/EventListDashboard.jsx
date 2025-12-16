/** @format */

import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Flame,
  Zap,
  TrendingUp,
  Megaphone,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";

// Helper
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

const formatFullDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

// --- Upcoming Events ---
export const UpcomingEventsList = ({ events }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <p className='text-sm text-gray-500'>Chọn ngày trên lịch hoặc xem</p>
          <h3 className='text-lg font-bold text-gray-900'>
            Sự kiện sắp diễn ra
          </h3>
        </div>
        <Link
          to='/events'
          className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'>
          Xem tất cả <ArrowRight className='h-4 w-4' />
        </Link>
      </div>
      {events.length > 0 ? (
        <div className='space-y-3'>
          {events.map((event, index) => (
            <motion.div
              key={event.id || event._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}>
              <Link
                to={`/events/${event.id || event._id}`}
                className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group border border-transparent hover:border-gray-100'>
                <div className='relative'>
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className='h-14 w-14 rounded-lg object-cover'
                  />
                  <span className='absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md'>
                    {formatDate(event.startDate).split(" ")[1]}
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-900 truncate group-hover:text-blue-600 transition'>
                    {event.title}
                  </p>
                  <div className='flex items-center gap-3 mt-1 text-xs text-gray-500'>
                    <span className='flex items-center gap-1'>
                      <Clock className='h-3 w-3' />
                      {new Date(event.startDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Users className='h-3 w-3' />
                      {event.currentParticipants || 0}/
                      {event.maxParticipants || event.volunteersNeeded}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          <CalendarDays className='h-10 w-10 mx-auto text-gray-300 mb-2' />
          <p>Không có sự kiện sắp tới</p>
        </div>
      )}
    </motion.div>
  );
};

// --- Selected Date Events ---
export const SelectedDateEvents = ({ date, events, onClear }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <p className='text-sm text-gray-500'>Sự kiện ngày</p>
          <h3 className='text-lg font-bold text-gray-900'>
            {formatFullDate(date)}
          </h3>
        </div>
        <button
          onClick={onClear}
          className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
          Xem tất cả
        </button>
      </div>
      {events.length > 0 ? (
        <div className='space-y-3'>
          {events.map((event) => (
            <Link
              key={event.id || event._id}
              to={`/events/${event.id || event._id}`}
              className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition group'>
              <img
                src={event.imageUrl}
                alt={event.title}
                className='h-14 w-14 rounded-lg object-cover'
              />
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-gray-900 truncate group-hover:text-blue-600 transition'>
                  {event.title}
                </p>
                <div className='flex items-center gap-3 mt-1 text-xs text-gray-500'>
                  <span className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {new Date(event.startDate).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className='flex items-center gap-1'>
                    <MapPin className='h-3 w-3' />
                    {event.city || event.location?.split(",").pop()?.trim()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          <CalendarDays className='h-10 w-10 mx-auto text-gray-300 mb-2' />
          <p>Không có sự kiện nào</p>
        </div>
      )}
    </motion.div>
  );
};

// --- Trending Events ---
export const TrendingEventsSection = ({ events }) => {
  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-orange-100 rounded-xl'>
            <Flame className='h-5 w-5 text-orange-600' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-900'>Sự kiện thu hút</h3>
            <p className='text-xs text-gray-500'>
              Đang được quan tâm nhiều nhất
            </p>
          </div>
        </div>
        <Link
          to='/events'
          className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'>
          Xem tất cả <ArrowRight className='h-4 w-4' />
        </Link>
      </div>

      {events.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {events.map((event, index) => (
            <motion.div
              key={event.id || event._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}>
              <Link
                to={`/events/${event.id || event._id}`}
                className='block bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 hover:shadow-md transition group relative overflow-hidden'>
                <div className='absolute top-3 right-3 flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-medium'>
                  <Zap className='h-3 w-3' />#{index + 1}
                </div>
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className='w-full h-28 object-cover rounded-xl mb-3'
                />
                <h4 className='font-semibold text-gray-900 text-sm truncate group-hover:text-orange-600 transition'>
                  {event.title}
                </h4>
                <div className='flex items-center gap-3 mt-2 text-xs text-gray-500'>
                  <span className='flex items-center gap-1'>
                    <Users className='h-3 w-3' />
                    {event.registrationCount}/{event.maxParticipants || "∞"}
                  </span>
                  <span className='flex items-center gap-1 text-orange-600 font-medium'>
                    <TrendingUp className='h-3 w-3' />
                    {event.fillRate}% đã đăng ký
                  </span>
                </div>
                <div className='mt-3'>
                  <div className='h-1.5 bg-orange-100 rounded-full overflow-hidden'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, event.fillRate)}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className='h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full'
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          <Flame className='h-10 w-10 mx-auto text-gray-300 mb-2' />
          <p>Chưa có sự kiện nổi bật</p>
        </div>
      )}
    </div>
  );
};

// --- Newly Announced Events ---
export const NewlyAnnouncedSection = ({ events }) => {
  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-blue-100 rounded-xl'>
            <Megaphone className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <h3 className='font-bold text-gray-900'>Mới công bố</h3>
            <p className='text-xs text-gray-500'>Sự kiện mới nhất</p>
          </div>
        </div>
      </div>
      {events.length > 0 ? (
        <div className='space-y-3'>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}>
              <Link
                to={`/events/${event.id || event._id}`}
                className='flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition group'>
                <div className='relative'>
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className='h-12 w-12 rounded-lg object-cover'
                  />
                  <span className='absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center'>
                    <Bell className='h-2.5 w-2.5 text-white' />
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition'>
                    {event.title}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {formatDate(event.startDate)} •{" "}
                    {event.city || event.location?.split(",").pop()?.trim()}
                  </p>
                </div>
                <span className='text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
                  Mới
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          <Megaphone className='h-10 w-10 mx-auto text-gray-300 mb-2' />
          <p>Chưa có sự kiện mới</p>
        </div>
      )}
    </div>
  );
};
