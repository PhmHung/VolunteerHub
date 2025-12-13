/**
 * @file mapHelpers.js
 * @description Map-related utility functions and constants
 * @pattern Utility Module Pattern
 */

import { Icon } from 'leaflet';

// ==================== CONSTANTS ====================

/**
 * Default Leaflet marker icon configuration
 */
export const DEFAULT_MARKER_ICON = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

/**
 * Earth radius in kilometers for distance calculations
 */
export const EARTH_RADIUS_KM = 6371;

/**
 * Default fallback coordinate (Hanoi, Vietnam)
 */
export const FALLBACK_COORDINATE = { lat: 21.0285, lng: 105.8542 };

/**
 * Mapping of major Vietnam cities to their coordinates
 */
export const VIETNAM_CITY_COORDS = {
  'hà nội': { lat: 21.0285, lng: 105.8542 },
  'hanoi': { lat: 21.0285, lng: 105.8542 },
  'hồ chí minh': { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'saigon': { lat: 10.8231, lng: 106.6297 },
  'sài gòn': { lat: 10.8231, lng: 106.6297 },
  'đà nẵng': { lat: 16.0544, lng: 108.2022 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'hải phòng': { lat: 20.8449, lng: 106.6881 },
  'hai phong': { lat: 20.8449, lng: 106.6881 },
  'cần thơ': { lat: 10.0452, lng: 105.7469 },
  'can tho': { lat: 10.0452, lng: 105.7469 },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert degrees to radians
 * @param {number} value - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (value) => (value * Math.PI) / 180;

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param {Object} pointA - First point {lat, lng}
 * @param {Object} pointB - Second point {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) return Number.POSITIVE_INFINITY;
  
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);
  
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  
  return EARTH_RADIUS_KM * c;
};

/**
 * Format distance value for display
 * @param {number} value - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (value) => {
  if (!Number.isFinite(value)) return '—';
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toFixed(1)} km`;
};

/**
 * Convert radius to appropriate zoom level for map display
 * @param {number} radiusKm - Radius in kilometers
 * @returns {number} Zoom level (3-11)
 */
export const radiusToZoomLevel = (radiusKm) => {
  if (radiusKm <= 20) return 11;
  if (radiusKm <= 60) return 9;
  if (radiusKm <= 200) return 7;
  if (radiusKm <= 800) return 5;
  return 3;
};

/**
 * Check if two coordinates are the same (within precision tolerance)
 * @param {Object} pointA - First point {lat, lng}
 * @param {Object} pointB - Second point {lat, lng}
 * @returns {boolean} True if coordinates are same
 */
export const isSameCoordinate = (pointA, pointB) => {
  if (!pointA || !pointB) return false;
  return Math.abs(pointA.lat - pointB.lat) < 1e-6 && 
         Math.abs(pointA.lng - pointB.lng) < 1e-6;
};

/**
 * Open Google Maps with directions to event location
 * @param {Object} event - Event object with coordinates or location
 */
export const openGoogleMaps = (event) => {
  if (event?.coordinates) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`,
      '_blank'
    );
  } else if (event?.location || event?.city) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.city)}`,
      '_blank'
    );
  }
};
