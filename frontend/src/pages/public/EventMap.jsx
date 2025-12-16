/** @format */

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Locate, Crosshair } from "lucide-react";
import { openGoogleMaps } from "../../utils/mapHelpers";

const EVENT_ICON = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const USER_ICON = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const EventMap = ({ event, userLocation, eventCoords }) => {
  const [currentCenter, setCurrentCenter] = useState(
    eventCoords || { lat: 21.0285, lng: 105.8542 }
  );

  useEffect(() => {
    if (eventCoords) {
      setCurrentCenter(eventCoords);
    }
  }, [eventCoords]);

  // --- HÀM XỬ LÝ ĐỊNH VỊ (Fix lỗi unused variable) ---
  const handleLocateMe = (e) => {
    // Ngăn sự kiện nổi bọt nếu nút nằm trong map container
    e.stopPropagation();

    if (userLocation) {
      setCurrentCenter(userLocation); // Cập nhật state -> MapUpdater sẽ chạy
    } else {
      alert("Đang lấy vị trí hoặc chưa cấp quyền GPS. Vui lòng thử lại sau.");
    }
  };

  return (
    // Dùng relative để đặt nút bấm đè lên bản đồ
    <div className='relative h-full w-full rounded-xl overflow-hidden shadow-sm border border-gray-200'>
      {/* --- NÚT ĐỊNH VỊ (LOCATE ME BUTTON) --- */}
      <button
        onClick={handleLocateMe} // 👈 ĐÃ SỬ DỤNG HÀM TẠI ĐÂY
        title='Vị trí của tôi'
        className='absolute top-3 right-3 z-[400] p-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 hover:text-blue-600 transition-colors border border-gray-200'>
        {userLocation ? (
          <Locate className='w-5 h-5 text-blue-600' />
        ) : (
          <Crosshair className='w-5 h-5 text-gray-400' />
        )}
      </button>

      {/* --- BẢN ĐỒ --- */}
      <MapContainer
        center={[currentCenter.lat, currentCenter.lng]}
        zoom={14}
        className='h-full w-full z-0'
        scrollWheelZoom={false} // Tắt cuộn chuột để tránh phiền khi lướt trang
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Component điều khiển camera */}
        <MapUpdater center={currentCenter} />

        {/* Marker Sự kiện (Màu Đỏ) */}
        {eventCoords && (
          <Marker
            position={[eventCoords.lat, eventCoords.lng]}
            icon={EVENT_ICON}>
            <Popup>
              <div className='text-center min-w-[150px]'>
                <b className='text-red-600 text-sm block mb-1'>
                  {event?.title}
                </b>
                <p className='text-xs text-gray-600 mb-2'>
                  {event?.location || "Địa điểm sự kiện"}
                </p>
                <button
                  onClick={() => openGoogleMaps(event)}
                  className='text-xs text-blue-600 font-medium underline flex items-center justify-center gap-1 mx-auto hover:text-blue-800'>
                  <Navigation className='w-3 h-3' /> Chỉ đường Google Maps
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marker Người dùng (Màu Xanh - Chỉ hiện khi có vị trí) */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={USER_ICON}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default EventMap;
