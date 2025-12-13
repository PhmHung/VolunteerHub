/**
 * @file useGeolocation.js
 * @description Custom hook for geolocation operations
 * @pattern Custom Hook Pattern
 */

import { useState, useEffect } from 'react';

/**
 * Get user's current geolocation
 * @returns {Object} Geolocation state
 * @returns {Object|null} location - Current location {lat, lng}
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message if any
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, loading, error };
};
