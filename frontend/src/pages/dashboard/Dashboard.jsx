/** @format */

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Flame,
  MessageCircle,
  ThumbsUp,
  Bell,
  Megaphone,
  Zap,
  Navigation,
  Ticket,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchEvents } from "../../features/eventSlice";

// ==================== MAP CONFIG ====================
const DEFAULT_MARKER_ICON = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const EARTH_RADIUS_KM = 6371;
const FALLBACK_COORDINATE = { lat: 21.0285, lng: 105.8542 }; // Hanoi

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) return Number.POSITIVE_INFINITY;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return EARTH_RADIUS_KM * c;
};

const formatDistance = (value) => {
  if (!Number.isFinite(value)) return "—";
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toFixed(1)} km`;
};

const radiusToZoomLevel = (radiusKm) => {
  if (radiusKm <= 20) return 11;
  if (radiusKm <= 60) return 9;
  if (radiusKm <= 200) return 7;
  if (radiusKm <= 800) return 5;
  return 3;
};

const isSameCoordinate = (pointA, pointB) => {
  if (!pointA || !pointB) return false;
  return (
    Math.abs(pointA.lat - pointB.lat) < 1e-6 &&
    Math.abs(pointA.lng - pointB.lng) < 1e-6
  );
};

// ==================== HELPERS ====================
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

const getEventsByDate = (events, date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.startDate || event.date);
    return eventDate.toDateString() === date.toDateString();
  });
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const openGoogleMaps = (event) => {
  if (event?.coordinates) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`,
      "_blank"
    );
  } else if (event?.location || event?.city) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        event.location || event.city
      )}`,
      "_blank"
    );
  }
};

// ==================== VIETNAM CITY COORDINATES ====================
// Mapping common Vietnam cities/provinces to coordinates for map display
const VIETNAM_CITY_COORDS = {
  "hà nội": { lat: 21.0285, lng: 105.8542 },
  hanoi: { lat: 21.0285, lng: 105.8542 },
  "hồ chí minh": { lat: 10.8231, lng: 106.6297 },
  "ho chi minh": { lat: 10.8231, lng: 106.6297 },
  saigon: { lat: 10.8231, lng: 106.6297 },
  "sài gòn": { lat: 10.8231, lng: 106.6297 },
  "đà nẵng": { lat: 16.0544, lng: 108.2022 },
  "da nang": { lat: 16.0544, lng: 108.2022 },
  "hải phòng": { lat: 20.8449, lng: 106.6881 },
  "hai phong": { lat: 20.8449, lng: 106.6881 },
  "cần thơ": { lat: 10.0452, lng: 105.7469 },
  "can tho": { lat: 10.0452, lng: 105.7469 },
  huế: { lat: 16.4637, lng: 107.5909 },
  hue: { lat: 16.4637, lng: 107.5909 },
  "nha trang": { lat: 12.2388, lng: 109.1967 },
  "vũng tàu": { lat: 10.346, lng: 107.0843 },
  "vung tau": { lat: 10.346, lng: 107.0843 },
  "đà lạt": { lat: 11.9404, lng: 108.4583 },
  "da lat": { lat: 11.9404, lng: 108.4583 },
  "phan thiết": { lat: 10.9289, lng: 108.1021 },
  "phan thiet": { lat: 10.9289, lng: 108.1021 },
  "quy nhơn": { lat: 13.776, lng: 109.2237 },
  "quy nhon": { lat: 13.776, lng: 109.2237 },
  "buôn ma thuột": { lat: 12.6667, lng: 108.05 },
  "buon ma thuot": { lat: 12.6667, lng: 108.05 },
  pleiku: { lat: 13.9833, lng: 108 },
  vinh: { lat: 18.6796, lng: 105.6813 },
  "thanh hóa": { lat: 19.8, lng: 105.7667 },
  "thanh hoa": { lat: 19.8, lng: 105.7667 },
  "nam định": { lat: 20.4167, lng: 106.1667 },
  "nam dinh": { lat: 20.4167, lng: 106.1667 },
  "thái nguyên": { lat: 21.5928, lng: 105.8442 },
  "thai nguyen": { lat: 21.5928, lng: 105.8442 },
  "bắc ninh": { lat: 21.1861, lng: 106.0763 },
  "bac ninh": { lat: 21.1861, lng: 106.0763 },
  "hạ long": { lat: 20.9517, lng: 107.0786 },
  "ha long": { lat: 20.9517, lng: 107.0786 },
  "quảng ninh": { lat: 21.0064, lng: 107.2925 },
  "quang ninh": { lat: 21.0064, lng: 107.2925 },
  "lào cai": { lat: 22.4856, lng: 103.9707 },
  "lao cai": { lat: 22.4856, lng: 103.9707 },
  sapa: { lat: 22.3364, lng: 103.8438 },
  "sa pa": { lat: 22.3364, lng: 103.8438 },
  "hội an": { lat: 15.8801, lng: 108.338 },
  "hoi an": { lat: 15.8801, lng: 108.338 },
  "mỹ tho": { lat: 10.36, lng: 106.35 },
  "my tho": { lat: 10.36, lng: 106.35 },
  "long xuyên": { lat: 10.3833, lng: 105.4167 },
  "long xuyen": { lat: 10.3833, lng: 105.4167 },
  "rạch giá": { lat: 10.0167, lng: 105.0833 },
  "rach gia": { lat: 10.0167, lng: 105.0833 },
  "phú quốc": { lat: 10.2899, lng: 103.984 },
  "phu quoc": { lat: 10.2899, lng: 103.984 },
  "biên hòa": { lat: 10.9574, lng: 106.8426 },
  "bien hoa": { lat: 10.9574, lng: 106.8426 },
  "thủ đức": { lat: 10.8519, lng: 106.7539 },
  "thu duc": { lat: 10.8519, lng: 106.7539 },
  "bình dương": { lat: 10.9804, lng: 106.6519 },
  "binh duong": { lat: 10.9804, lng: 106.6519 },
  "đồng nai": { lat: 10.9574, lng: 106.8426 },
  "dong nai": { lat: 10.9574, lng: 106.8426 },
};

// Function to extract coordinates from location string
const getCoordinatesFromLocation = (location) => {
  if (!location) return null;
  const locationLower = location.toLowerCase().trim();

  // Check direct match
  for (const [city, coords] of Object.entries(VIETNAM_CITY_COORDS)) {
    if (locationLower.includes(city)) {
      // Add small random offset to prevent overlapping markers
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.02,
        lng: coords.lng + (Math.random() - 0.5) * 0.02,
      };
    }
  }

  return null;
};

// ==================== MAIN DASHBOARD ====================
const Dashboard = () => {
  const dispatch = useDispatch();
  const { list: events, loading, error } = useSelector((state) => state.event);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(200);
  const [activeEventId, setActiveEventId] = useState(null);

  // Fetch events from Redux store
  const handleFetchEvents = () => {
    dispatch(fetchEvents({ limit: 100, status: "approved" }));
  };

  useEffect(() => {
    dispatch(fetchEvents({ limit: 100, status: "approved" }));
  }, [dispatch]);

  // Process events - add eventDate and coordinates
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

  // Events with coordinates for map
  const eventsWithCoordinates = useMemo(() => {
    return allEvents
      .filter((e) => e.coordinates)
      .map((event) => ({
        ...event,
        city:
          event.city || event.location?.split(",").pop()?.trim() || "Không rõ",
      }));
  }, [allEvents]);

  // Set default location
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

  // Events with distance
  const eventsWithDistance = useMemo(() => {
    if (!selectedLocation) return eventsWithCoordinates;
    return eventsWithCoordinates
      .map((event) => ({
        ...event,
        distance: calculateDistanceKm(selectedLocation, event.coordinates),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [eventsWithCoordinates, selectedLocation]);

  // Filtered events within radius
  const filteredEvents = useMemo(() => {
    const withinRadius = eventsWithDistance.filter(
      (event) => event.distance <= radiusKm
    );
    if (withinRadius.length > 0) return withinRadius.slice(0, 5);
    return eventsWithDistance.slice(0, 5);
  }, [eventsWithDistance, radiusKm]);

  // General Stats (public, not personal)
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

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsByDate(allEvents, selectedDate);
  }, [selectedDate, allEvents]);

  // Upcoming events (next 5)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return allEvents
      .filter((e) => e.eventDate >= now)
      .sort((a, b) => a.eventDate - b.eventDate)
      .slice(0, 5);
  }, [allEvents]);

  // Newly announced events (sorted by createdAt - newest first)
  const newlyAnnouncedEvents = useMemo(() => {
    return [...allEvents]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate) -
          new Date(a.createdAt || a.startDate)
      )
      .slice(0, 4);
  }, [allEvents]);

  // Trending events (based on currentParticipants - most popular)
  const trendingEvents = useMemo(() => {
    const eventScores = allEvents.map((event) => {
      const registrationCount = event.currentParticipants || 0;
      const maxParticipants = event.maxParticipants || 1;
      const fillRate = registrationCount / maxParticipants;
      // Score based on registration count and fill rate
      const score = registrationCount * 3 + fillRate * 50;
      return {
        ...event,
        totalLikes: 0, // Will be updated when we have channel data
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

  // --- EVENT HANDLERS (Giữ nguyên) ---
  const handleEventFocus = (event) => {
    if (!event) return;
    setActiveEventId(event.id || event._id);
    setSelectedLocation(event.coordinates);
  };

  const handleLocationPick = (coords) => {
    setSelectedLocation(coords);
    setActiveEventId(null);
  };

  // Loading state
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

  // Error state
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

  return (
    <div className='min-h-screen bg-gray-50 px-4 sm:px-6 py-6'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Bảng điều khiển
            </h1>
            <p className='text-gray-500 mt-1'>
              Tổng quan các sự kiện tình nguyện
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleFetchEvents}
              className='inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition'>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
            <Link
              to='/events'
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/25'>
              <Sparkles className='h-4 w-4' />
              Khám phá sự kiện
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid */}
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

          {/* Selected Date Events or Upcoming Events */}
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

          {/* MAP SECTION - Full Width with Leaflet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='md:col-span-2 lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
            <PopularEventsWithMap
              events={filteredEvents}
              allEvents={eventsWithDistance}
              activeEventId={activeEventId}
              selection={selectedLocation}
              mapZoom={mapZoom}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              onEventFocus={handleEventFocus}
              onLocationPick={handleLocationPick}
            />
          </motion.div>

          {/* Trending Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='md:col-span-2 lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5'>
            <TrendingEventsSection events={trendingEvents} />
          </motion.div>

          {/* Newly Announced Events */}
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

// ==================== STAT CARD ====================
const StatCard = ({ icon, label, value, color, delay }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  const iconColors = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${colors[color]} bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4`}>
      <div className={`${iconColors[color]} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className='text-2xl font-bold text-gray-900'>{value}</p>
        <p className='text-sm text-gray-500'>{label}</p>
      </div>
    </motion.div>
  );
};

// ==================== INTERACTIVE CALENDAR ====================
const InteractiveCalendar = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  events,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const monthName = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const eventCounts = useMemo(() => {
    const counts = {};
    events.forEach((event) => {
      const eventDate = new Date(event.startDate || event.date);
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        const day = eventDate.getDate();
        counts[day] = (counts[day] || 0) + 1;
      }
    });
    return counts;
  }, [events, month, year]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day);
    if (
      selectedDate &&
      clickedDate.toDateString() === selectedDate.toDateString()
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(clickedDate);
    }
  };

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();
  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-bold text-gray-900 capitalize'>
          {monthName}
        </h3>
        <div className='flex items-center gap-2'>
          <button
            onClick={goToPrevMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition'>
            <ChevronLeft className='h-5 w-5 text-gray-600' />
          </button>
          <button
            onClick={goToNextMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition'>
            <ChevronRight className='h-5 w-5 text-gray-600' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-2'>
        {weekDays.map((day) => (
          <div
            key={day}
            className='text-center text-xs font-semibold text-gray-400 py-2'>
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((day, index) => {
          const hasEvents = day && eventCounts[day];
          const evtCount = eventCounts[day] || 0;
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!day}
              className={`
                relative aspect-square rounded-xl text-sm font-medium transition-all
                ${!day ? "invisible" : "hover:bg-gray-100"}
                ${
                  isToday(day) ? "bg-blue-600 text-white hover:bg-blue-700" : ""
                }
                ${
                  isSelected(day) && !isToday(day)
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                    : ""
                }
                ${!isToday(day) && !isSelected(day) ? "text-gray-700" : ""}
              `}>
              <span className='absolute inset-0 flex items-center justify-center'>
                {day}
              </span>
              {hasEvents && (
                <span className='absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5'>
                  {evtCount <= 3 ? (
                    [...Array(evtCount)].map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-full ${
                          isToday(day) ? "bg-white" : "bg-blue-500"
                        }`}
                      />
                    ))
                  ) : (
                    <span
                      className={`text-[10px] font-bold ${
                        isToday(day) ? "text-white" : "text-blue-600"
                      }`}>
                      {evtCount}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className='mt-4 flex items-center justify-center gap-4 text-xs text-gray-500'>
        <span className='flex items-center gap-1'>
          <span className='h-2 w-2 rounded-full bg-blue-600' />
          Hôm nay
        </span>
        <span className='flex items-center gap-1'>
          <span className='h-1 w-1 rounded-full bg-blue-500' />
          Có sự kiện
        </span>
      </div>
    </div>
  );
};

// ==================== SELECTED DATE EVENTS ====================
const SelectedDateEvents = ({ date, events, onClear }) => {
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
              to='/events'
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

// ==================== UPCOMING EVENTS LIST ====================
const UpcomingEventsList = ({ events }) => {
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
                to='/events'
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

// ==================== POPULAR EVENTS WITH LEAFLET MAP ====================
const PopularEventsWithMap = ({
  events,
  allEvents,
  activeEventId,
  selection,
  mapZoom,
  radiusKm,
  onRadiusChange,
  onEventFocus,
  onLocationPick,
}) => {
  return (
    <div className='p-5'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4'>
        <div>
          <p className='text-sm font-medium text-gray-500'>Sự kiện gần bạn</p>
          <h3 className='text-lg font-bold text-gray-900'>
            Bản đồ sự kiện tình nguyện
          </h3>
        </div>
        <div className='flex items-center gap-3 text-xs text-gray-500'>
          <label htmlFor='radius-range' className='font-medium text-gray-600'>
            Bán kính
          </label>
          <input
            id='radius-range'
            type='range'
            min={50}
            max={3000}
            step={50}
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className='h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600'
          />
          <span className='font-semibold text-gray-700'>{radiusKm} km</span>
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-[1.2fr_1fr]'>
        {/* Event List */}
        <ul className='space-y-3 max-h-[400px] overflow-y-auto'>
          {events.length > 0 ? (
            events.map((event) => {
              const isActive = activeEventId === (event.id || event._id);
              return (
                <li
                  key={event.id || event._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${
                    isActive
                      ? "border-blue-300 bg-blue-50 shadow-md"
                      : "border-gray-100 bg-gray-50 hover:bg-white"
                  }`}
                  onClick={() => onEventFocus(event)}>
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className='h-14 w-14 flex-shrink-0 rounded-xl object-cover'
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-semibold text-gray-900 truncate'>
                        {event.title}
                      </p>
                      <span className='text-xs font-medium text-blue-600 ml-2 flex-shrink-0'>
                        {formatDistance(event.distance)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 mt-1 text-xs text-gray-500'>
                      <span className='flex items-center gap-1'>
                        <CalendarDays className='h-3 w-3' />
                        {formatDate(event.startDate)}
                      </span>
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        {event.city}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 mt-2'>
                      <span className='inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 border'>
                        <Ticket className='h-3 w-3' />
                        {event.currentParticipants || event.registered || 0}/
                        {event.maxParticipants || event.volunteersNeeded || "∞"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMaps(event);
                        }}
                        className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition'>
                        <Navigation className='h-3 w-3' />
                        Chỉ đường
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600 text-center'>
              Không tìm thấy sự kiện trong bán kính này. Điều chỉnh bản đồ hoặc
              tăng bán kính để xem thêm.
            </li>
          )}
        </ul>

        {/* Leaflet Map */}
        <div className='relative min-h-[350px] overflow-hidden rounded-2xl bg-gray-100 shadow-sm'>
          <InteractiveLeafletMap
            events={allEvents}
            selection={selection}
            mapZoom={mapZoom}
            radiusKm={radiusKm}
            activeEventId={activeEventId}
            onEventFocus={onEventFocus}
            onLocationPick={onLocationPick}
          />
        </div>
      </div>
    </div>
  );
};

// ==================== LEAFLET MAP COMPONENTS ====================
const InteractiveLeafletMap = ({
  events,
  selection,
  mapZoom,
  radiusKm,
  activeEventId,
  onEventFocus,
  onLocationPick,
}) => {
  const activeEvent = useMemo(
    () =>
      events.find((event) => (event.id || event._id) === activeEventId) ?? null,
    [events, activeEventId]
  );

  const showSelectionMarker =
    !activeEvent || !isSameCoordinate(activeEvent.coordinates, selection);

  if (!selection) {
    return (
      <div className='flex h-full items-center justify-center bg-gray-200 text-sm text-gray-600'>
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <MapContainer
      center={[selection.lat, selection.lng]}
      zoom={mapZoom}
      className='h-full w-full'
      scrollWheelZoom
      attributionControl={false}
      zoomControl={false}
      style={{ minHeight: "350px" }}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; OpenStreetMap contributors'
      />
      <MapViewUpdater center={selection} zoom={mapZoom} />
      <MapSelectionHandler onSelect={onLocationPick} />
      <Circle
        center={[selection.lat, selection.lng]}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.12,
          weight: 1.5,
        }}
      />
      {showSelectionMarker && (
        <Marker
          position={[selection.lat, selection.lng]}
          icon={DEFAULT_MARKER_ICON}>
          <Popup>Điểm đang chọn</Popup>
        </Marker>
      )}
      {events.map((event) => (
        <Marker
          key={event.id || event._id}
          position={[event.coordinates.lat, event.coordinates.lng]}
          icon={DEFAULT_MARKER_ICON}
          eventHandlers={{
            click: () => onEventFocus(event),
          }}>
          <Popup>
            <div className='min-w-[200px]'>
              <p className='text-sm font-semibold text-gray-900'>
                {event.title}
              </p>
              <p className='text-xs text-gray-600'>
                {event.location || event.city}
              </p>
              <p className='mt-1 text-xs font-medium text-blue-600'>
                Cách bạn: {formatDistance(event.distance)}
              </p>
              <button
                onClick={() => openGoogleMaps(event)}
                className='mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition'>
                <Navigation className='h-3 w-3' />
                Chỉ đường
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

const MapViewUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 0.4 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapSelectionHandler = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      if (typeof onSelect === "function") {
        onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
      }
    },
  });
  return null;
};

// ==================== TRENDING EVENTS SECTION ====================
const TrendingEventsSection = ({ events }) => {
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
                to='/events'
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

// ==================== NEWLY ANNOUNCED SECTION ====================
const NewlyAnnouncedSection = ({ events }) => {
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
                to='/events'
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

export default Dashboard;
