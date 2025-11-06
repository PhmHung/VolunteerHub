import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BellRing, CalendarDays, Clock, MapPin, Ticket } from 'lucide-react';
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import { MOCK_EVENTS } from '../data/mockEvents';

const userProfile = {
  name: 'Cecillia Yo',
  tagline: 'Event Strategist',
  status: 'Available for work',
  avatar:
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
};

const DEFAULT_MARKER_ICON = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const EARTH_RADIUS_KM = 6371;

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return Number.POSITIVE_INFINITY;
  }

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
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value < 1) {
    return `${Math.round(value * 1000)} m`;
  }
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
  if (!pointA || !pointB) {
    return false;
  }
  return Math.abs(pointA.lat - pointB.lat) < 1e-6 && Math.abs(pointA.lng - pointB.lng) < 1e-6;
};

const FALLBACK_COORDINATE = { lat: 21.0285, lng: 105.8542 };

const resolveCityLabel = (city, location) => {
  if (city) return city;
  if (!location) return 'Không rõ địa điểm';
  const segments = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : location;
};

const formatDateRange = (dateString, startTime, endTime) => {
  if (!dateString) {
    return [startTime, endTime].filter(Boolean).join(' - ');
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    const timeRange = [startTime, endTime].filter(Boolean).join(' - ');
    return timeRange ? `${dateString} · ${timeRange}` : dateString;
  }
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  const timeRange = [startTime, endTime].filter(Boolean).join(' - ');
  return timeRange ? `${formattedDate} · ${timeRange}` : formattedDate;
};

const formatAvailability = (registered, slots) => {
  if (typeof registered !== 'number' || typeof slots !== 'number') {
    return 'Thông tin đăng ký';
  }
  return `${registered}/${slots} người đăng ký`;
};

const formatScheduleDate = (eventDate, fallbackLabel) => {
  if (eventDate instanceof Date && !Number.isNaN(eventDate.getTime())) {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    }).format(eventDate);
  }
  return fallbackLabel ?? 'Ngày cập nhật';
};

const buildCalendarData = (events) => {
  const firstValidEvent = events.find((event) => event.eventDate);
  const baseDate = firstValidEvent?.eventDate ?? new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix = [];
  let currentDay = 1;

  for (let week = 0; week < 6 && currentDay <= daysInMonth; week += 1) {
    const row = [];
    for (let day = 0; day < 7; day += 1) {
      if ((week === 0 && day < firstDayOfMonth) || currentDay > daysInMonth) {
        row.push('');
      } else {
        row.push(String(currentDay));
        currentDay += 1;
      }
    }
    matrix.push(row);
    if (currentDay > daysInMonth) {
      break;
    }
  }

  const highlights = events.reduce((accumulator, event) => {
    if (event.eventDate && event.eventDate.getMonth() === month && event.eventDate.getFullYear() === year) {
      const dayKey = String(event.eventDate.getDate());
      const existing = accumulator[dayKey]?.label ?? '';
      const label = existing ? `${existing}, ${event.name}` : event.name;
      accumulator[dayKey] = {
        label,
        color: 'bg-indigo-500',
      };
    }
    return accumulator;
  }, {});

  return {
    monthLabel: `Tháng ${month + 1} ${year}`,
    matrix,
    highlights,
  };
};

const Dashboard = ({ user }) => {
  const displayName = user?.personalInformation?.name ?? userProfile.name;
  const avatar = user?.personalInformation?.avatarUrl ?? userProfile.avatar;

  const eventSummaries = useMemo(() => {
    const enriched = MOCK_EVENTS.filter((event) => event.coordinates)
      .map((event) => {
        const eventDate = event.date ? new Date(event.date) : null;
        const isValidDate = eventDate instanceof Date && !Number.isNaN(eventDate.getTime());
        const registered = typeof event.registered === 'number' ? event.registered : 0;
        const slots = typeof event.slots === 'number' ? event.slots : null;
        return {
          id: event.id,
          name: event.title,
          category: event.category,
          organizer: event.organizer,
          city: resolveCityLabel(event.city, event.location),
          location: event.location,
          formattedDate: formatDateRange(event.date, event.startTime, event.endTime),
          availability: formatAvailability(registered, slots),
          registered,
          slots,
          image: event.imageUrl,
          coordinates: event.coordinates,
          tags: event.tags ?? [],
          eventDate: isValidDate ? eventDate : null,
          isValid: isValidDate,
        };
      });

    return enriched
      .sort((a, b) => {
        const registrationDelta = (b.registered ?? 0) - (a.registered ?? 0);
        if (registrationDelta !== 0) {
          return registrationDelta;
        }
        if (a.eventDate && b.eventDate) {
          return a.eventDate - b.eventDate;
        }
        if (a.eventDate) return -1;
        if (b.eventDate) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3);
  }, []);

  const defaultCoordinate = eventSummaries[0]?.coordinates ?? FALLBACK_COORDINATE;
  const defaultEventId = eventSummaries[0]?.id ?? null;

  const [selectedLocation, setSelectedLocation] = useState(defaultCoordinate);
  const [radiusKm, setRadiusKm] = useState(200);
  const [activeEventId, setActiveEventId] = useState(defaultEventId);

  const mapZoom = useMemo(() => radiusToZoomLevel(radiusKm), [radiusKm]);

  const eventsWithDistance = useMemo(() => {
    return eventSummaries
      .map((event) => ({
        ...event,
        distance: calculateDistanceKm(selectedLocation, event.coordinates),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [eventSummaries, selectedLocation]);

  const filteredEvents = useMemo(() => {
    const withinRadius = eventsWithDistance.filter((event) => event.distance <= radiusKm);
    if (withinRadius.length > 0) {
      return withinRadius;
    }
    return eventsWithDistance.slice(0, Math.min(3, eventsWithDistance.length));
  }, [eventsWithDistance, radiusKm]);

  const upcomingEventCount = useMemo(() => {
    const now = new Date();
    return eventSummaries.filter((event) => (event.eventDate ? event.eventDate >= now : true)).length;
  }, [eventSummaries]);

  const uniqueCityCount = useMemo(() => {
    return new Set(eventSummaries.map((event) => event.city)).size;
  }, [eventSummaries]);

  useEffect(() => {
    if (!activeEventId && defaultEventId) {
      setActiveEventId(defaultEventId);
    }
  }, [activeEventId, defaultEventId]);

  useEffect(() => {
    const matchedEvent = eventsWithDistance.find((event) => isSameCoordinate(event.coordinates, selectedLocation));
    if (matchedEvent && matchedEvent.id !== activeEventId) {
      setActiveEventId(matchedEvent.id);
    }
  }, [eventsWithDistance, selectedLocation, activeEventId]);

  const ticketHighlights = useMemo(
    () =>
      eventsWithDistance.slice(0, Math.min(3, eventsWithDistance.length)).map((event) => ({
        ...event,
        image:
          event.image ??
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(event.id)}`,
      })),
    [eventsWithDistance]
  );

  const upcomingHighlights = useMemo(() => {
    const now = new Date();
    const upcoming = eventSummaries.filter((event) => (event.eventDate ? event.eventDate >= now : true));
    return (upcoming.length > 0 ? upcoming : eventSummaries).slice(0, 3);
  }, [eventSummaries]);

  const destinationHighlights = useMemo(() => {
    const uniqueDestinations = new Map();
    eventSummaries.forEach((event) => {
      const key = event.city ?? event.location;
      if (!key) return;
      if (!uniqueDestinations.has(key)) {
        uniqueDestinations.set(key, {
          id: event.id,
          name: key,
          image:
            event.image ??
            'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=400&q=80',
        });
      }
    });
    return Array.from(uniqueDestinations.values()).slice(0, 3);
  }, [eventSummaries]);

  const scheduleHighlights = useMemo(() => {
    return eventSummaries.slice(0, Math.min(3, eventSummaries.length)).map((event) => ({
      id: event.id,
      date: formatScheduleDate(event.eventDate, event.formattedDate),
      detail: `${event.name} · ${event.city ?? event.location}`,
    }));
  }, [eventSummaries]);

  const calendarData = useMemo(() => buildCalendarData(eventSummaries), [eventSummaries]);

  const handleEventFocus = (event) => {
    if (!event) return;
    setActiveEventId(event.id);
    setSelectedLocation(event.coordinates);
  };

  const handleLocationPick = (coords) => {
    setSelectedLocation(coords);
    setActiveEventId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt={`Ảnh của ${displayName}`}
              className="h-14 w-14 rounded-full object-cover shadow-sm"
            />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900">{displayName}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {userProfile.status}
                </span>
                <span>{userProfile.tagline}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-slate-400">Tổng số sự kiện</span>
              <span className="text-lg font-semibold text-slate-900">{eventSummaries.length}</span>
            </div>
            <div className="hidden h-12 w-px bg-slate-200 sm:block" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-slate-400">Sự kiện sắp diễn ra</span>
              <span className="text-lg font-semibold text-slate-900">{upcomingEventCount}</span>
            </div>
            <div className="hidden h-12 w-px bg-slate-200 sm:block" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-slate-400">Địa điểm tham gia</span> 
              <span className="text-lg font-semibold text-slate-900">{uniqueCityCount}</span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <TicketStack events={ticketHighlights} />
            <PopularEvents
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
          </div>

          <div className="space-y-6 lg:col-span-5">
            <UpcomingEvents events={upcomingHighlights} />
            <TopDestinations destinations={destinationHighlights} />
            <EventSchedule schedule={scheduleHighlights} />
            <MiniCalendar
              monthLabel={calendarData.monthLabel}
              matrix={calendarData.matrix}
              highlights={calendarData.highlights}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketStack = ({ events }) => (
  <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <header className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Event Tickets</p>
        <h2 className="text-lg font-semibold text-slate-900">Sự kiện nổi bật dành cho bạn</h2>
      </div>
  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Xem thêm</button>
    </header>

    <div className="mt-6 space-y-5">
      {events.length > 0 ? (
        events.map((event) => <TicketCard key={event.id} event={event} />)
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Hiện chưa có sự kiện nào phù hợp. Hãy khám phá các sự kiện khác trong danh sách bên dưới.
        </p>
      )}
    </div>
  </section>
);

const TicketCard = ({ event }) => (
  <article className="grid gap-6 rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white md:grid-cols-[1.4fr_auto] md:items-center">
    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
      <div className="h-28 w-full overflow-hidden rounded-2xl bg-slate-200 md:h-32 md:w-44">
        <img src={event.image} alt={event.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {event.category ? `${event.category.toUpperCase()} EVENT` : 'SỰ KIỆN ĐẶC SẮC'}
        </span>
        <h3 className="text-xl font-semibold text-slate-900">{event.name}</h3>
        {event.organizer && (
          <p className="text-sm text-slate-600">Đơn vị tổ chức: {event.organizer}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {event.formattedDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <Ticket className="h-3.5 w-3.5" />
          {event.availability}
        </div>
        <p className="text-xs text-slate-500">
          Đã đăng ký: {event.registered.toLocaleString('vi-VN')} tình nguyện viên
        </p>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {event.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
    <div className="flex flex-col items-center justify-center gap-4 rounded-[20px] border-t border-dashed border-slate-200 pt-4 text-sm text-slate-500 md:border-l md:border-t-0 md:pl-6">
      <img src={event.qrCode} alt={`QR cho ${event.name}`} className="h-28 w-28 rounded-xl bg-white p-2 shadow" />
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-slate-400">{event.id}</p>
        <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          Xem vé
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  </article>
);

const PopularEvents = ({
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
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Popular Event</p>
          <h3 className="text-lg font-semibold text-slate-900">Những sự kiện được săn vé nhiều nhất</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <label htmlFor="radius-range" className="font-medium text-slate-600">
            Bán kính
          </label>
          <input
            id="radius-range"
            type="range"
            min={50}
            max={3000}
            step={50}
            value={radiusKm}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
            className="h-1.5 w-40 cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-900"
          />
          <span className="font-semibold text-slate-700">{radiusKm} km</span>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <ul className="space-y-4">
          {events.map((event) => {
            const isActive = activeEventId === event.id;
            const imageSource = event.image ?? 'https://images.unsplash.com/photo-1520004434532-668416a08753?auto=format&fit=crop&w=400&q=80';
            return (
              <li
                key={event.id}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-1 hover:bg-white ${
                  isActive
                    ? 'border-indigo-300 bg-indigo-50/70 shadow-md'
                    : 'border-slate-100 bg-slate-50/70'
                }`}
                onClick={() => onEventFocus(event)}
              >
                <img
                  src={imageSource}
                  alt={event.name}
                  className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{event.name}</p>
                    <span className="text-xs font-medium text-indigo-600">
                      {formatDistance(event.distance)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{event.formattedDate}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>
                  </div>
                  <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    <Ticket className="h-3 w-3" />
                    {event.availability}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Đã đăng ký: {event.registered.toLocaleString('vi-VN')} tình nguyện viên
                  </p>
                </div>
              </li>
            );
          })}
          {events.length === 0 && (
            <li className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Không tìm thấy sự kiện trong bán kính này. Điều chỉnh bản đồ hoặc tăng bán kính để xem thêm.
            </li>
          )}
        </ul>

        <div className="relative hidden min-h-[260px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm sm:block">
          <InteractiveMap
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
    </section>
  );
};

const InteractiveMap = ({
  events,
  selection,
  mapZoom,
  radiusKm,
  activeEventId,
  onEventFocus,
  onLocationPick,
}) => {
  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeEventId) ?? null,
    [events, activeEventId]
  );

  const showSelectionMarker = !activeEvent || !isSameCoordinate(activeEvent.coordinates, selection);

  if (!selection) {
    return <div className="flex h-full items-center justify-center bg-slate-200 text-sm text-slate-600">Đang tải bản đồ…</div>;
  }

  return (
    <MapContainer
      center={selection}
      zoom={mapZoom}
      className="h-full w-full"
      scrollWheelZoom
      attributionControl={false}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapViewUpdater center={selection} zoom={mapZoom} />
      <MapSelectionHandler onSelect={onLocationPick} />
      <Circle
        center={selection}
        radius={radiusKm * 1000}
        pathOptions={{ color: '#4A3AFF', fillColor: '#4A3AFF', fillOpacity: 0.12, weight: 1.2 }}
      />
      {showSelectionMarker && (
        <Marker position={selection} icon={DEFAULT_MARKER_ICON}>
          <Popup>Điểm đang chọn</Popup>
        </Marker>
      )}
      {events.map((event) => (
        <Marker
          key={event.id}
          position={event.coordinates}
          icon={DEFAULT_MARKER_ICON}
          eventHandlers={{
            click: () => onEventFocus(event),
          }}
        >
          <Popup>
            <p className="text-sm font-semibold text-slate-900">{event.name}</p>
            <p className="text-xs text-slate-600">{event.location}</p>
            <p className="mt-1 text-xs font-medium text-indigo-600">Cách bạn: {formatDistance(event.distance)}</p>
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
      map.flyTo(center, zoom, { duration: 0.4 });
    }
  }, [center, zoom, map]);

  return null;
};

const MapSelectionHandler = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      if (typeof onSelect === 'function') {
        onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
      }
    },
  });

  return null;
};

const UpcomingEvents = ({ events }) => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Upcoming Event</p>
          <h3 className="text-lg font-semibold text-slate-900">Đừng bỏ lỡ các sự kiện sắp diễn ra</h3>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Xem thêm</button>
      </header>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {events.length === 0 ? (
          <p className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Không có sự kiện nào đang được lên lịch. Vui lòng kiểm tra lại sau.
          </p>
        ) : (
          events.map((event) => (
          <article
            key={event.id}
            className="flex min-w-[220px] flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 shadow-sm transition hover:-translate-y-1 hover:bg-white"
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
              <img src={event.image} alt={event.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="font-semibold text-slate-900">{event.name}</p>
              <p className="inline-flex items-center gap-1 text-slate-500"><MapPin className="h-3 w-3" />{event.location}</p>
              <p className="inline-flex items-center gap-1 text-slate-500"><Clock className="h-3 w-3" />{event.formattedDate}</p>
            </div>
            <button className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Nhắc tôi
              <BellRing className="h-4 w-4" />
            </button>
          </article>
          ))
        )}
      </div>
    </section>
  );
};

const TopDestinations = ({ destinations }) => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Top Destinations</p>
          <h3 className="text-lg font-semibold text-slate-900">Những địa điểm tổ chức được yêu thích</h3>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Xem thêm</button>
      </header>

      <div className="mt-5 flex gap-4 overflow-x-auto">
        {destinations.map((destination) => (
          <figure
            key={destination.id}
            className="relative min-w-[160px] overflow-hidden rounded-2xl"
          >
            <img src={destination.image} alt={destination.name} className="h-36 w-full object-cover" />
            <figcaption className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-4 text-sm font-semibold text-white">
              {destination.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

const EventSchedule = ({ schedule }) => {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Japan Event</p>
          <h3 className="text-lg font-semibold text-slate-900">Lịch sự kiện nổi bật tại Tokyo</h3>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Xem thêm</button>
      </header>

      <ul className="mt-5 space-y-3">
        {schedule.length > 0 ? (
          schedule.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="flex h-10 w-16 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                {item.date}
              </span>
              <span className="text-sm text-slate-600">{item.detail}</span>
            </li>
          ))
        ) : (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Chưa có sự kiện nào trong lịch trình. Hãy cập nhật dữ liệu để hiển thị danh sách mới.
          </li>
        )}
      </ul>
    </section>
  );
};

const MiniCalendar = ({ monthLabel, matrix, highlights }) => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Calendar</p>
          <h3 className="text-lg font-semibold text-slate-900">{monthLabel}</h3>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Xem thêm</button>
      </header>

      <div className="mt-4 grid gap-2 text-center text-sm">
        <div className="grid grid-cols-7 gap-1 text-xs font-semibold uppercase text-slate-400">
          {weekDays.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>
        {matrix.map((week, index) => (
          <div key={index} className="grid grid-cols-7 gap-1 text-sm">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <span key={dayIndex} />;
              }
              const highlight = highlights[day];
              return (
                <span
                  key={dayIndex}
                  className={`flex h-9 items-center justify-center rounded-full border border-transparent text-slate-600 ${
                    highlight ? `${highlight.color} text-white font-semibold` : 'bg-white'
                  }`}
                >
                  {day}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2 text-xs text-slate-500">
        {Object.entries(highlights).length > 0 ? (
          Object.entries(highlights).map(([day, meta]) => (
            <li key={day} className="flex items-center gap-2">
              <span className={`inline-flex h-3 w-3 items-center justify-center rounded-full ${meta.color}`} />
              <span>
                Ngày {day}: {meta.label}
              </span>
            </li>
          ))
        ) : (
          <li>Chưa có sự kiện nào trong tháng này.</li>
        )}
      </ul>
    </section>
  );
};

export default Dashboard;