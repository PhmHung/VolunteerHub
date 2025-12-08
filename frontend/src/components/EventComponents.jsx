import React from 'react';
import { AttendeeRequestStatus, AttendeeCompletionStatus } from '../types';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />
    </svg>
);

const PlaceholderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const EventStatusBadge = ({ status }) => {
    const statusStyles = {
        Approved: 'badge-success',
        Pending: 'badge-warning',
        Completed: 'badge-info',
        Cancelled: 'badge-error',
    };
    return (
        <span className={`badge ${statusStyles[status] || 'bg-surface-muted text-text-secondary'} leading-none`}>
            {status}
        </span>
    );
};

const formatFullDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return "Invalid Date";
    }
};

export const EventDetails = ({ event, onAttendeeRequestChange, onAttendeeCompletionChange }) => {
  if (!event) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <PlaceholderIcon />
          <h2 className="heading-2 text-text-secondary mt-4">Select an event</h2>
          <p className="text-text-muted mt-2">Choose an event from the list to view its details and manage attendees.</p>
        </div>
      </div>
    );
  }

  const approvedAttendees = (event.attendees || []).filter(a => a.requestStatus === AttendeeRequestStatus.APPROVED).length;

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="w-full h-48 lg:h-64 flex-shrink-0">
        {event.image ? <img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-t-xl" /> : <div className="w-full h-full bg-surface-muted flex items-center justify-center rounded-t-xl"><PlaceholderIcon/></div>}
      </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <h2 className="heading-1">{event.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {(event.tags || []).map(tag => (
                        <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-muted text-text-secondary">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="flex-shrink-0">
                <EventStatusBadge status={event.status} />
            </div>
        </div>
        
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-text-secondary mt-6 border-t border-border pt-6">
            <div className="flex items-start">
                <ClockIcon/>
                <div>
                    <span className="font-semibold">Starts:</span> {formatFullDate(event.startDate)}
                    <br/>
                    <span className="font-semibold">Ends:</span> {formatFullDate(event.endDate)}
                </div>
            </div>
             <div className="flex items-start">
                <LocationIcon/>
                <div><span className="font-semibold">Location:</span> {event.location}</div>
            </div>
             <div className="flex items-start">
                <UsersIcon/>
                <div><span className="font-semibold">Participants:</span> {approvedAttendees} / {event.maxParticipants}</div>
            </div>
        </div>

        <p className="mt-6 text-text-secondary">{event.description}</p>
                </div>

                <div className="p-6 md:p-8 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-2xl font-semibold text-text-main">Attendees</h3>
          <span className="px-2.5 py-1 text-sm font-semibold rounded-full bg-primary-100 text-primary-800">{(event.attendees || []).length} Request(s)</span>
        </div>
        <AttendeeList 
          attendees={event.attendees || []} 
          onAttendeeRequestChange={(attendeeId, newStatus) => onAttendeeRequestChange(event.id, attendeeId, newStatus)}
          onAttendeeCompletionChange={(attendeeId, newStatus) => onAttendeeCompletionChange(event.id, attendeeId, newStatus)}
        />
      </div>
    </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
    const statusStyles = {
        [AttendeeRequestStatus.APPROVED]: 'bg-success-100 text-success-800',
        [AttendeeRequestStatus.PENDING]: 'bg-warning-100 text-warning-800',
        [AttendeeRequestStatus.DENIED]: 'bg-error-100 text-error-800',
        [AttendeeCompletionStatus.COMPLETED]: 'bg-primary-100 text-primary-800',
        [AttendeeCompletionStatus.NOT_COMPLETED]: 'bg-surface-muted text-text-main',
    };

    if (!status) return null;

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-surface-muted text-text-main'} leading-none`}>
            {status}
        </span>
    );
};

export const AttendeeItem = ({ attendee, onAttendeeRequestChange, onAttendeeCompletionChange }) => {
    return (
        <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
                <img
                    src={attendee.avatarUrl || 'https://via.placeholder.com/48'}
                    alt={attendee.name}
                    className="h-12 w-12 rounded-full object-cover"
                />
                                <div className="ml-4">
                                        <p className="text-md font-semibold text-text-main">{attendee.name}</p>
                                        <p className="text-sm text-text-muted">{attendee.email}</p>
                                        { (attendee.phone || attendee.phoneNumber) && (
                                            <p className="text-sm text-text-muted">📞 <a className="hover:underline" href={`tel:${attendee.phone || attendee.phoneNumber}`}>{attendee.phone || attendee.phoneNumber}</a></p>
                                        ) }
                                </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 sm:ml-auto">
                <div className="flex items-center gap-2">
                    <StatusBadge status={attendee.requestStatus} />
                    {attendee.requestStatus === AttendeeRequestStatus.APPROVED && (
                        <StatusBadge status={attendee.completionStatus} />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {attendee.requestStatus === AttendeeRequestStatus.PENDING && (
                        <>
                            <button
                                onClick={() => onAttendeeRequestChange(attendee.id, AttendeeRequestStatus.APPROVED)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-success-600 rounded-md hover:bg-success-700 transition-all shadow-sm hover:shadow-md"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onAttendeeRequestChange(attendee.id, AttendeeRequestStatus.DENIED)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-error-600 rounded-md hover:bg-error-700 transition-all shadow-sm hover:shadow-md"
                            >
                                Deny
                            </button>
                        </>
                    )}
                    {attendee.requestStatus === AttendeeRequestStatus.APPROVED && attendee.completionStatus === AttendeeCompletionStatus.NOT_COMPLETED && (
                        <button
                            onClick={() => onAttendeeCompletionChange(attendee.id, AttendeeCompletionStatus.COMPLETED)}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-all shadow-sm hover:shadow-md flex items-center gap-1.5"
                        >
                            Mark Complete
                        </button>
                    )}
                    {attendee.requestStatus === AttendeeRequestStatus.APPROVED && attendee.completionStatus === AttendeeCompletionStatus.COMPLETED && (
                         <button
                            onClick={() => onAttendeeCompletionChange(attendee.id, AttendeeCompletionStatus.NOT_COMPLETED)}
                            className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-surface-muted rounded-md hover:bg-surface-highlight transition-colors flex items-center gap-1.5"
                        >
                            Undo Completion
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AttendeeList = ({ attendees, onAttendeeRequestChange, onAttendeeCompletionChange }) => {
  if (!attendees || attendees.length === 0) {
    return <p className="text-text-muted italic">No attendees have registered for this event yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-200">
      {attendees.map(attendee => (
        <AttendeeItem
          key={attendee.id}
          attendee={attendee}
          onAttendeeRequestChange={(attId, status) => onAttendeeRequestChange(attId, status)}
          onAttendeeCompletionChange={(attId, status) => onAttendeeCompletionChange(attId, status)}
        />
      ))}
    </div>
  );
};

export default {
  EventDetails,
  AttendeeList,
  AttendeeItem,
};
