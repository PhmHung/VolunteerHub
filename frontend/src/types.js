// Shared frontend enum-like constants for events and attendee statuses
export const EventStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const AttendeeRequestStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  DENIED: 'Denied',
};

export const AttendeeCompletionStatus = {
  COMPLETED: 'Completed',
  NOT_COMPLETED: 'Not completed',
};

export default {
  EventStatus,
  AttendeeRequestStatus,
  AttendeeCompletionStatus,
};
