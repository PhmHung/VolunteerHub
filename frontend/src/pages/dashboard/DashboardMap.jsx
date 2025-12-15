/** @format */

import React, { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
// 👇 Import thêm Locate và Crosshair
import {
  CalendarDays,
  MapPin,
  Ticket,
  Navigation,
  Locate,
  Crosshair,
} from "lucide-react";
import {
  formatDistance,
  openGoogleMaps,
  isSameCoordinate,
} from "../../utils/mapHelpers";

// --- Leaflet Icon Config ---
const DEFAULT_MARKER_ICON = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- Helper Date Formatter ---
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};

// --- Sub-components cho Map ---
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

  // Fallback nếu chưa có selection (mặc định Hà Nội)
  const safeSelection = selection || { lat: 21.0285, lng: 105.8542 };

  return (
    <MapContainer
      center={[safeSelection.lat, safeSelection.lng]}
      zoom={mapZoom}
      className='h-full w-full'
      scrollWheelZoom
      attributionControl={false}
      zoomControl={false}
      style={{ minHeight: "350px" }}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='© OpenStreetMap contributors'
      />
      {selection && <MapViewUpdater center={selection} zoom={mapZoom} />}
      <MapSelectionHandler onSelect={onLocationPick} />

      {selection && (
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
      )}

      {showSelectionMarker && selection && (
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

// --- Main Component ---
const DashboardMap = ({
  events,
  allEvents,
  activeEventId,
  selection,
  mapZoom,
  radiusKm,
  onRadiusChange,
  onEventFocus,
  onLocationPick,
  userLocation,
  geoLoading, // 👈 QUAN TRỌNG: Phải nhận prop này ở đây
}) => {
  // Hàm xử lý định vị
  const handleLocateMe = () => {
    if (userLocation) {
      // Gọi hàm onLocationPick được truyền từ cha (Dashboard.jsx)
      onLocationPick(userLocation);
    } else {
      alert("Đang lấy vị trí hoặc chưa cấp quyền GPS.");
    }
  };

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
                        {geoLoading ? (
                          <span className='animate-spin'>⌛</span> // Hoặc icon LoadingIcon
                        ) : userLocation ? (
                          <Locate className='w-5 h-5 text-blue-600' />
                        ) : (
                          <Crosshair className='w-5 h-5 text-gray-400' />
                        )}
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

        {/* Leaflet Map Container */}
        <div className='relative min-h-[350px] overflow-hidden rounded-2xl bg-gray-100 shadow-sm group'>
          {/* 👇 NÚT ĐỊNH VỊ (LOCATE ME BUTTON) */}
          <button
            onClick={handleLocateMe}
            title='Vị trí của tôi'
            className='absolute top-4 right-4 z-[400] p-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 hover:text-blue-600 transition-colors border border-gray-200'>
            {userLocation ? (
              <Locate className='w-5 h-5 text-blue-600' />
            ) : (
              <Crosshair className='w-5 h-5 text-gray-400' />
            )}
          </button>

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

export default DashboardMap;
