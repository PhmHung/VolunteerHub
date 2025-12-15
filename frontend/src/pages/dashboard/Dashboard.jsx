/** @format */

import React, { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  TrendingUp,
  Users,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Actions
import { fetchEvents } from "../../features/eventSlice";

// Components
import DashboardHeader from "../dashboard/DashboardHeader";
import StatCard from "../../components/common/StatCard";
import InteractiveCalendar from "../dashboard/InteractiveCalendar";
import DashboardMap from "../dashboard/DashboardMap";
import {
  UpcomingEventsList,
  SelectedDateEvents,
  TrendingEventsSection,
  NewlyAnnouncedSection,
} from "./EventListDashboard";

// Utils
import {
  calculateDistanceKm,
  radiusToZoomLevel,
  getCoordinatesFromLocation,
} from "../../utils/mapHelpers";

const FALLBACK_COORDINATE = { lat: 21.0285, lng: 105.8542 }; // Hanoi

const Dashboard = () => {
  const dispatch = useDispatch();
  const { list: events, loading, error } = useSelector((state) => state.event);
  const { location: userLocation, loading: geoLoading } = useGeolocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(200);
  const [activeEventId, setActiveEventId] = useState(null);

  // --- Logic Fetch Data & Tính Toán (Giữ nguyên) ---
  const handleFetchEvents = () => {
    dispatch(fetchEvents({ limit: 100, status: "approved" }));
  };

  useEffect(() => {
    dispatch(fetchEvents({ limit: 100, status: "approved" }));
  }, [dispatch]);

  const allEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      id: event._id || event.id,
      eventDate: new Date(event.startDate),
      imageUrl:
        event.image ||
        "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400",
      city: event.location?.split(",").pop()?.trim() || "Việt Nam",
      coordinates: getCoordinatesFromLocation(event.location),
    }));
  }, [events]);

  const eventsWithCoordinates = useMemo(() => {
    return allEvents
      .filter((e) => e.coordinates)
      .map((event) => ({
        ...event,
        city:
          event.city || event.location?.split(",").pop()?.trim() || "Không rõ",
      }));
  }, [allEvents]);

  useEffect(() => {
    if (!selectedLocation && eventsWithCoordinates.length > 0) {
      setSelectedLocation(eventsWithCoordinates[0].coordinates);
      setActiveEventId(
        eventsWithCoordinates[0].id || eventsWithCoordinates[0]._id
      );
    } else if (!selectedLocation) {
      setSelectedLocation(FALLBACK_COORDINATE);
    }
  }, [eventsWithCoordinates, selectedLocation]);

  const mapZoom = useMemo(() => radiusToZoomLevel(radiusKm), [radiusKm]);

  const eventsWithDistance = useMemo(() => {
    if (!selectedLocation) return eventsWithCoordinates;
    return eventsWithCoordinates
      .map((event) => ({
        ...event,
        distance: calculateDistanceKm(selectedLocation, event.coordinates),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [eventsWithCoordinates, selectedLocation]);

  const filteredEvents = useMemo(() => {
    const withinRadius = eventsWithDistance.filter(
      (event) => event.distance <= radiusKm
    );
    if (withinRadius.length > 0) return withinRadius.slice(0, 5);
    return eventsWithDistance.slice(0, 5);
  }, [eventsWithDistance, radiusKm]);

  // Helper function: getEventsByDate
  const getEventsByDate = (events, date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate || event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Stats & Lists Logic
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = allEvents.filter((e) => e.eventDate >= now);
    const totalParticipants = allEvents.reduce(
      (sum, e) => sum + (e.currentParticipants || e.registered || 0),
      0
    );
    const cities = new Set(
      allEvents
        .map((e) => e.city || e.location?.split(",").pop()?.trim())
        .filter(Boolean)
    );
    return {
      totalEvents: allEvents.length,
      upcomingEvents: upcoming.length,
      totalParticipants,
      cities: cities.size,
    };
  }, [allEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsByDate(allEvents, selectedDate);
  }, [selectedDate, allEvents]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return allEvents
      .filter((e) => e.eventDate >= now)
      .sort((a, b) => a.eventDate - b.eventDate)
      .slice(0, 5);
  }, [allEvents]);

  const newlyAnnouncedEvents = useMemo(() => {
    return [...allEvents]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      )
      .slice(0, 4);
  }, [allEvents]);

  const trendingEvents = useMemo(() => {
    const eventScores = allEvents.map((event) => {
      const registrationCount = event.currentParticipants || 0;
      const maxParticipants = event.maxParticipants || 1;
      const fillRate = registrationCount / maxParticipants;
      const score = registrationCount * 3 + fillRate * 50;
      return {
        ...event,
        totalLikes: 0,
        totalComments: 0,
        registrationCount,
        fillRate: Math.round(fillRate * 100),
        trendingScore: score,
      };
    });
    return eventScores
      .filter((e) => e.registrationCount > 0)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 4);
  }, [allEvents]);

  const handleEventFocus = (event) => {
    if (!event) return;
    setActiveEventId(event.id || event._id);
    setSelectedLocation(event.coordinates);
  };

  const handleLocationPick = (coords) => {
    setSelectedLocation(coords);
    setActiveEventId(null);
  };

  // --- Render Loading/Error ---
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 text-blue-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600 font-medium'>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-bold text-gray-900 mb-2'>
            Đã xảy ra lỗi
          </h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={handleFetchEvents}
            className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition'>
            <RefreshCw className='h-4 w-4' />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-6 py-6'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* 1. Header */}
        <DashboardHeader onRefresh={handleFetchEvents} loading={loading} />

        {/* 2. Grid Layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Stats Cards */}
          <StatCard
            icon={<CalendarDays className='h-6 w-6' />}
            label='Tổng sự kiện'
            value={stats.totalEvents}
            color='blue'
            delay={0}
          />
          <StatCard
            icon={<TrendingUp className='h-6 w-6' />}
            label='Sắp diễn ra'
            value={stats.upcomingEvents}
            color='purple'
            delay={0.1}
          />
          <StatCard
            icon={<Users className='h-6 w-6' />}
            label='TNV đã đăng ký'
            value={stats.totalParticipants}
            color='green'
            delay={0.2}
          />
          <StatCard
            icon={<MapPin className='h-6 w-6' />}
            label='Tỉnh/Thành phố'
            value={stats.cities}
            color='orange'
            delay={0.3}
          />

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='md:col-span-2 lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 row-span-2'>
            <InteractiveCalendar
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              events={allEvents}
            />
          </motion.div>

          {/* Dynamic Event List (Selected/Upcoming) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='md:col-span-2 lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 row-span-2'>
            <AnimatePresence mode='wait'>
              {selectedDate ? (
                <SelectedDateEvents
                  key='selected'
                  date={selectedDate}
                  events={selectedDateEvents}
                  onClear={() => setSelectedDate(null)}
                />
              ) : (
                <UpcomingEventsList key='upcoming' events={upcomingEvents} />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='md:col-span-2 lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
            <DashboardMap
              events={filteredEvents}
              allEvents={eventsWithDistance}
              activeEventId={activeEventId}
              selection={selectedLocation}
              mapZoom={mapZoom}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onEventFocus={handleEventFocus}
              onLocationPick={handleLocationPick}
              userLocation={userLocation}
              geoLoading={geoLoading}
            />
          </motion.div>

          {/* Trending & New Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='md:col-span-2 lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5'>
            <TrendingEventsSection events={trendingEvents} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className='md:col-span-2 lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5'>
            <NewlyAnnouncedSection events={newlyAnnouncedEvents} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
