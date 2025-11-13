import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import EventFormModal from '../components/EventsForm.jsx';
import { EventDetails } from '../components/EventComponents.jsx';
import { AttendeeRequestStatus, AttendeeCompletionStatus } from '../types';

const ASSIGNED_EVENTS = [
  {
    id: 'evt-1',
    title: 'Dọn rác bờ sông',
    startDate: '2025-11-18T08:00:00.000Z',
    endDate: '2025-11-18T11:00:00.000Z',
    location: 'Công viên A',
    status: 'Open',
    description: 'Thu gom rác tại khu vực bờ sông, cung cấp găng tay và túi rác.',
    maxParticipants: 30,
    tags: ['Môi trường', 'ngoài trời'],
    image: '',
    attendees: [
      { id: 'a1', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '0912345678', avatarUrl: '', requestStatus: AttendeeRequestStatus.APPROVED, completionStatus: AttendeeCompletionStatus.COMPLETED },
      { id: 'a2', name: 'Bob Williams', email: 'bob.w@example.com', phone: '0987654321', avatarUrl: '', requestStatus: AttendeeRequestStatus.APPROVED, completionStatus: AttendeeCompletionStatus.NOT_COMPLETED },
      { id: 'a3', name: 'Charlie Brown', email: 'charlie.b@example.com', phone: '0965432109', avatarUrl: '', requestStatus: AttendeeRequestStatus.PENDING, completionStatus: AttendeeCompletionStatus.NOT_COMPLETED },
    ],
  },
  {
    id: 'evt-2',
    title: 'Trồng cây xanh',
    startDate: '2025-11-23T07:30:00.000Z',
    endDate: '2025-11-23T12:00:00.000Z',
    location: 'Khu đô thị B',
    status: 'Pending',
    description: 'Trồng 200 cây xanh dọc theo lối đi bộ.',
    maxParticipants: 50,
    tags: ['Môi trường', 'cây xanh'],
    image: '',
    attendees: [],
  },
  {
    id: 'evt-3',
    title: 'Hội thảo kỹ năng',
    startDate: '2025-12-02T13:00:00.000Z',
    endDate: '2025-12-02T16:00:00.000Z',
    location: 'Nhà văn hóa',
    status: 'Open',
    description: 'Buổi hội thảo nâng cao kỹ năng mềm cho sinh viên.',
    maxParticipants: 120,
    tags: ['Đào tạo', 'kỹ năng'],
    image: '',
    attendees: [],
  },
];

const TEAM_MEMBERS = [
  { name: 'Nguyễn Văn A', role: 'Tình nguyện viên', hours: 68 },
  { name: 'Trần Thị B', role: 'Tình nguyện viên', hours: 54 },
  { name: 'Lê C', role: 'Tình nguyện viên', hours: 47 },
];

export default function ManagerDashboard({ user }) {
  const displayName = user?.personalInformation?.name || user?.userName || user?.name || 'Người quản lý';
  const [events, setEvents] = useState(ASSIGNED_EVENTS);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(ASSIGNED_EVENTS[0]?.id || null);

  const selectedEvent = events.find(e => e.id === selectedEventId) || null;

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
  };

  const handleAttendeeRequestChange = (eventId, attendeeId, newStatus) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
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

  const handleSave = (data) => {
    // If editing, replace existing
    if (editingEvent) {
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? { ...e, ...data, id: editingEvent.id } : e)));
    } else {
      const id = `evt-${Date.now()}`;
      setEvents((prev) => [{ id, ...data }, ...prev]);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Xin chào, {displayName}</h1>
          <p className="text-lg text-slate-500 mt-1">Quản lý lịch trình sự kiện, phân công đội và xử lý đăng ký.</p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {summary.map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <main className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-1/3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Sự kiện được giao</h2>
                  <p className="text-sm text-slate-500">Sự kiện bạn đang phụ trách</p>
                </div>
                <button 
                  onClick={handleOpenCreate} 
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition"
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
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/30 border-indigo-300 shadow-md' 
                          : 'bg-white border-slate-200 hover:shadow-sm hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{e.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
                          e.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {e.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-slate-600 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{new Date(e.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{e.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 flex-shrink-0" />
                          <span>{(e.attendees || []).length} yêu cầu</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {(e.tags || []).slice(0, 2).map(t => (
                            <span key={t} className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{t}</span>
                          ))}
                        </div>
                        <button 
                          onClick={(ev) => { ev.stopPropagation(); handleEdit(e); }} 
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
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

          <section className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200">
            {selectedEvent ? (
              <EventDetails
                event={selectedEvent}
                onAttendeeRequestChange={handleAttendeeRequestChange}
                onAttendeeCompletionChange={handleAttendeeCompletionChange}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400">
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
    </div>
  );
}
