/**
 * @file eventService.js
 * @description Business logic layer for event operations
 * @pattern Service Layer Pattern
 */

/**
 * Calculate event status based on dates
 * @param {Object} event - Event object with startDate and endDate
 * @returns {string} Event status: 'upcoming' | 'ongoing' | 'past'
 */
export const getEventStatus = (event) => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'past';
  return 'ongoing';
};

/**
 * Check if event registration is full
 * @param {Object} event - Event object
 * @returns {boolean} True if event is full
 */
export const isEventFull = (event) => {
  return event.currentParticipants >= event.maxParticipants;
};

/**
 * Calculate event capacity percentage
 * @param {Object} event - Event object
 * @returns {number} Percentage (0-100)
 */
export const getEventCapacityPercentage = (event) => {
  if (!event.maxParticipants) return 0;
  return Math.round((event.currentParticipants / event.maxParticipants) * 100);
};

/**
 * Filter events by multiple criteria
 * @param {Array} events - Array of events
 * @param {Object} filters - Filter criteria
 * @param {string} filters.search - Search query
 * @param {string} filters.category - Event category
 * @param {string} filters.status - Event status
 * @param {string} filters.timeFilter - Time filter
 * @param {string} filters.selectedDate - Selected date
 * @returns {Array} Filtered events
 */
export const filterEvents = (events, filters) => {
  const { search = '', category = 'Tất cả', status = 'all', timeFilter = 'all', selectedDate = '' } = filters;

  return events.filter((event) => {
    // Search filter
    const matchesSearch = !search || 
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory = category === 'Tất cả' || event.category === category;

    // Status filter
    const matchesStatus = status === 'all' || event.status === status;

    // Time filter
    const now = new Date();
    const eventStart = new Date(event.startDate || `${event.date}T${event.startTime}`);
    const eventEnd = new Date(event.endDate || `${event.date}T${event.endTime}`);
    
    const matchesTime =
      timeFilter === 'all' ||
      (timeFilter === 'upcoming' && eventStart > now) ||
      (timeFilter === 'ongoing' && eventStart <= now && eventEnd >= now) ||
      (timeFilter === 'past' && eventEnd < now);

    // Date filter
    const matchesDate = !selectedDate || 
      (event.date === selectedDate || event.startDate?.startsWith(selectedDate));

    return matchesSearch && matchesCategory && matchesStatus && matchesTime && matchesDate;
  });
};

/**
 * Sort events by specified criteria
 * @param {Array} events - Array of events
 * @param {string} sortBy - Sort criteria: 'date' | 'participants' | 'title'
 * @param {string} order - Sort order: 'asc' | 'desc'
 * @returns {Array} Sorted events
 */
export const sortEvents = (events, sortBy = 'date', order = 'asc') => {
  const sorted = [...events].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.startDate) - new Date(b.startDate);
        break;
      case 'participants':
        comparison = (a.currentParticipants || 0) - (b.currentParticipants || 0);
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};
