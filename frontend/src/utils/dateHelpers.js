/**
 * @file dateHelpers.js
 * @description Date formatting and manipulation utilities
 * @pattern Utility Module Pattern
 */

/**
 * Format date string to Vietnamese locale short format
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "T2, 09/12")
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

/**
 * Format date string to Vietnamese locale full format
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "09 tháng 12, 2025")
 */
export const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Get events that occur on a specific date
 * @param {Array} events - Array of event objects
 * @param {Date} date - Target date
 * @returns {Array} Filtered events
 */
export const getEventsByDate = (events, date) => {
  return events.filter((event) => {
    const eventDate = new Date(event.startDate || event.date);
    return eventDate.toDateString() === date.toDateString();
  });
};

/**
 * Get number of days in a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the first day of week for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Day of week (0-6, Sunday = 0)
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};
