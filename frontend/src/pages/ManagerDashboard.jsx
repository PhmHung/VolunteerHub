import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, MapPin, Users } from 'lucide-react';
import EventFormModal from '../components/EventsForm.jsx';
import { EventDetails } from '../components/EventComponents.jsx';
import { AttendeeRequestStatus, AttendeeCompletionStatus } from '../types';
import { fetchEvents, createEvent, updateEvent } from '../features/event/eventSlice';
import { fetchPendingRegistrations, fetchEventRegistrations, acceptRegistration, rejectRegistration } from '../features/registration/registrationSlice';
import { fetchAllUsers } from '../features/user/userSlice';
import { ToastContainer } from '../components/common/Toast';

// Helper to map backend status to frontend enum
const mapStatusToRequestStatus = (status) => {
  switch (status) {
    case 'accepted': return AttendeeRequestStatus.APPROVED;
    case 'rejected': return AttendeeRequestStatus.DENIED;
    default: return AttendeeRequestStatus.PENDING;
  }
};

export default function ManagerDashboard({ user }) {
  const dispatch = useDispatch();
  const { events: reduxEvents = [] } = useSelector((state) => state.event);
  const { pendingRegistrations = [], eventRegistrations = {} } = useSelector((state) => state.registration);
  const { allUsers = [] } = useSelector((state) => state.user);
  const { user: authUser } = useSelector((state) => state.auth);

  const activeUser = user || authUser;
  const displayName = activeUser?.personalInformation?.name || activeUser?.userName || activeUser?.name || 'Người quản lý';
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchPendingRegistrations());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Transform events to match the dashboard's expected structure
  const initialEvents = useMemo(() => {
    // Filter events for this manager
    const managerId = activeUser?._id;
    const myEvents = managerId 
      ? reduxEvents.filter(e => {
          const createdBy = typeof e.createdBy === 'object' ? e.createdBy._id : e.createdBy;
          return createdBy === managerId;
        })
      : reduxEvents;

    return myEvents.map(event => {
      const eventId = event._id || event.id;
      
      // Find registrations for this event from eventRegistrations or pendingRegistrations
      const eventRegs = eventRegistrations[eventId] || 
        pendingRegistrations.filter(r => {
          const regEventId = typeof r.eventId === 'object' ? r.eventId._id : r.eventId;
          return regEventId === eventId;
        });
      
      // Map registrations to attendees
      const attendees = eventRegs.map(reg => {
        const userId = typeof reg.userId === 'object' ? reg.userId._id : reg.userId;
        const volunteer = allUsers.find(v => v._id === userId) || {
          userName: reg.userId?.userName || 'Unknown User',
          userEmail: reg.userId?.userEmail || 'unknown@example.com',
          phoneNumber: reg.userId?.phoneNumber || '',
          profilePicture: reg.userId?.profilePicture || ''
        };

        return {
          id: userId,
          regId: reg._id,
          name: volunteer.userName,
          email: volunteer.userEmail,
          phone: volunteer.phoneNumber,
          avatarUrl: volunteer.profilePicture,
          requestStatus: mapStatusToRequestStatus(reg.status),
          completionStatus: reg.completionStatus || AttendeeCompletionStatus.NOT_COMPLETED
        };
      });

      return {
        ...event,
        id: eventId,
        startDate: event.startDate || event.date,
        endDate: event.endDate || event.date,
        image: event.image || event.imageUrl,
        attendees: attendees
      };
    });
  }, [activeUser, reduxEvents, eventRegistrations, pendingRegistrations, allUsers]);

  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Update local events when initialEvents changes
  useEffect(() => {
    setEvents(initialEvents);
    // Only set selectedEventId if not already set and events available
    if (initialEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(initialEvents[0]?.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEvents.length]); // Use length instead of full array to prevent infinite loop

  const selectedEvent = events.find(e => e.id === selectedEventId || e._id === selectedEventId) || null;

  // Tính toán thống kê động từ dữ liệu events
  const summary = useMemo(() => {
    const totalEvents = events.length;
    
    // Đếm tổng số yêu cầu đăng ký chờ xử lý (status PENDING)
    const pendingRequests = events.reduce((sum, event) => {
      const pending = (event.attendees || []).filter(
        a => a.requestStatus === AttendeeRequestStatus.PENDING
      ).length;
      return sum + pending;
    }, 0);
    
    // Đếm tổng số tình nguyện viên đã được approve
    const totalVolunteers = events.reduce((sum, event) => {
      const approved = (event.attendees || []).filter(
        a => a.requestStatus === AttendeeRequestStatus.APPROVED
      ).length;
      return sum + approved;
    }, 0);
    
    // Tính giờ dự kiến: giả định mỗi event = 3 giờ, nhân với số volunteers approved
    const estimatedHours = events.reduce((sum, event) => {
      const approvedCount = (event.attendees || []).filter(
        a => a.requestStatus === AttendeeRequestStatus.APPROVED
      ).length;
      // Tính duration của event (hours)
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const durationHours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
      return sum + (approvedCount * durationHours);
    }, 0);

    return [
      { label: 'Sự kiện được quản lý', value: totalEvents },
      { label: 'Đăng ký chờ xử lý', value: pendingRequests },
      { label: 'Tình nguyện viên trong đội', value: totalVolunteers },
      { label: 'Giờ dự kiến (tháng)', value: `${estimatedHours}h` },
    ];
  }, [events]);

  const handleSelectEvent = (id) => {
    setSelectedEventId(id);
    // Fetch registrations for this event
    dispatch(fetchEventRegistrations(id));
  };

  const handleAttendeeRequestChange = async (eventId, attendeeId, newStatus) => {
    // Find the registration ID from the attendee
    const event = events.find(e => e.id === eventId || e._id === eventId);
    const attendee = event?.attendees?.find(a => a.id === attendeeId);
    
    if (attendee?.regId) {
      try {
        if (newStatus === AttendeeRequestStatus.APPROVED) {
          await dispatch(acceptRegistration(attendee.regId)).unwrap();
          addToast('Đã chấp nhận đăng ký', 'success');
        } else if (newStatus === AttendeeRequestStatus.DENIED) {
          await dispatch(rejectRegistration({ registrationId: attendee.regId, reason: 'Bị từ chối bởi quản trị viên' })).unwrap();
          addToast('Đã từ chối đăng ký', 'success');
        }
        // Refresh data
        dispatch(fetchEvents());
        dispatch(fetchPendingRegistrations());
      } catch (error) {
        addToast(`Lỗi: ${error}`, 'error');
      }
    }
    
    // Update local state for immediate UI feedback
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId && ev._id !== eventId) return ev;
      return {
        ...ev,
        attendees: (ev.attendees || []).map(a => a.id === attendeeId ? { ...a, requestStatus: newStatus } : a)
      };
    }));
  };

  const handleAttendeeCompletionChange = (eventId, attendeeId, newStatus) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      return {
        ...ev,
        attendees: (ev.attendees || []).map(a => a.id === attendeeId ? { ...a, completionStatus: newStatus } : a)
      };
    }));
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (evt) => {
    // Normalize older event shapes that use `date` -> the form expects `startDate`/`endDate`
    const normalized = { ...evt };
    if (!normalized.startDate && normalized.date) normalized.startDate = normalized.date;
    if (!normalized.endDate && normalized.date) normalized.endDate = normalized.date;
    setEditingEvent(normalized);
    setShowForm(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingEvent) {
        // Update existing event
        await dispatch(updateEvent({ eventId: editingEvent._id || editingEvent.id, eventData: data })).unwrap();
        addToast('Cập nhật sự kiện thành công', 'success');
      } else {
        // Create new event
        await dispatch(createEvent(data)).unwrap();
        addToast('Tạo sự kiện thành công', 'success');
      }
      // Refresh events list
      dispatch(fetchEvents());
      setShowForm(false);
      setEditingEvent(null);
    } catch (error) {
      addToast(`Lỗi: ${error}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="heading-1">Xin chào, {displayName}</h1>
            <p className="text-body mt-1">Quản lý lịch trình sự kiện, phân công đội và xử lý đăng ký.</p>
          </div>
        </header>
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
              {summary.map(({ label, value }) => (
                <div key={label} className="card p-5">
                  <p className="text-sm font-medium text-text-muted">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-text-main">{value}</p>
                </div>
              ))}
            </section>

            <main className="flex flex-col md:flex-row gap-6">
              <aside className="w-full md:w-1/3">
                <div className="card p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-text-main">Sự kiện được giao</h2>
                      <p className="text-sm text-text-muted">Sự kiện bạn đang phụ trách</p>
                    </div>
                    <button 
                      onClick={handleOpenCreate} 
                      className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-100 transition"
                    >
                      + Tạo
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                    {events.map((e) => {
                      const isSelected = selectedEventId === e.id;
                      return (
                        <article 
                          key={e.id} 
                          onClick={() => handleSelectEvent(e.id)}
                          className={`cursor-pointer transition-all rounded-lg border p-3 ${
                            isSelected 
                              ? 'ring-2 ring-primary-500 bg-primary-50/30 border-primary-300 shadow-md' 
                              : 'bg-white border-gray-200 hover:shadow-sm hover:border-primary-200'
                          }`}
                        >
                          <div className="flex gap-3 mb-2">
                            {/* Thumbnail */}
                            <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                              {e.image ? (
                                <img src={e.image} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <Calendar className="h-8 w-8 opacity-50" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-text-main line-clamp-2">{e.title}</p>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                                  ['Open', 'Approved', 'approved'].includes(e.status) ? 'badge-success' : 'badge-warning'
                                }`}>
                                  {e.status}
                                </span>
                              </div>
                              
                              <div className="mt-1 space-y-0.5 text-xs text-text-secondary">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{new Date(e.startDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{e.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <Users className="h-3 w-3" />
                              <span>{(e.attendees || []).length} yêu cầu</span>
                            </div>
                            <button 
                              onClick={(ev) => { ev.stopPropagation(); handleEdit(e); }} 
                              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-muted hover:text-primary-600 transition-colors"
                            >
                              Sửa
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <section className="w-full md:w-2/3 card">
                {selectedEvent ? (
                  <EventDetails
                    event={selectedEvent}
                    user={user}
                    onAttendeeRequestChange={handleAttendeeRequestChange}
                    onAttendeeCompletionChange={handleAttendeeCompletionChange}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-text-muted">
                    <Calendar className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Chọn một sự kiện để xem chi tiết</p>
                    <p className="text-sm mt-2">Nhấp vào sự kiện bên trái</p>
                  </div>
                )}
              </section>
            </main>
      </div>

      {showForm && (
        <EventFormModal
          eventToEdit={editingEvent}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingEvent(null); }}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
