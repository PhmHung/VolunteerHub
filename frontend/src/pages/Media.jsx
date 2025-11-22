import React, { useState, useMemo } from 'react';
import LeftBar from '../components/LeftBar';
import { MOCK_EVENTS } from '../data/mockEvents';
import { MOCK_REGISTRATIONS } from '../data/mockRegistrations';
import { MOCK_USER } from '../utils/mockUser';
import { Calendar, MapPin, Clock, XCircle, MessageSquare, ArrowLeft, Users, Image } from 'lucide-react';
import { motion } from 'framer-motion';

// Import new components
import EventHeader from '../components/media/EventHeader';
import EventTabs from '../components/media/EventTabs';
import EventSidebar from '../components/media/EventSidebar';
import EventFeed from '../components/media/EventFeed';

const EventDetailView = ({ event, user, onBack }) => {
  const [activeTab, setActiveTab] = useState('discussion');

  return (
    <div className="flex-1 bg-gray-50 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto pb-10">
        {/* Back Button */}
        <div className="p-4 sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium px-3 py-1.5 rounded-lg hover:bg-gray-200/50"
            >
                <ArrowLeft className="w-5 h-5" />
                Quay lại danh sách
            </button>
        </div>

        {/* Header Section */}
        <EventHeader event={event} />

        {/* Tabs Navigation */}
        <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-8 mt-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
                <EventSidebar event={event} />
            </div>

            {/* Right Feed/Content */}
            <div className="lg:col-span-2">
                {activeTab === 'discussion' && <EventFeed user={user} event={event} />}
                {activeTab === 'about' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Giới thiệu chi tiết</h2>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.description}</p>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-bold mb-2 text-gray-900">Yêu cầu</h3>
                            <p className="text-gray-600">{event.requirements}</p>
                        </div>
                    </div>
                )}
                {activeTab === 'members' && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Danh sách thành viên</h3>
                        <p className="text-gray-500 mt-1">Tính năng đang được cập nhật...</p>
                    </div>
                )}
                {activeTab === 'media' && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Image className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Thư viện ảnh</h3>
                        <p className="text-gray-500 mt-1">Chưa có hình ảnh nào được tải lên.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const Media = ({ user }) => {
  const [registeredEventIds, setRegisteredEventIds] = useState(() => {
    const saved = localStorage.getItem("registeredEvents");
    // Merge with mock registrations if local storage is empty (first run)
    if (!saved) {
        const initial = MOCK_REGISTRATIONS
            .filter(reg => reg.userId === (user?._id || MOCK_USER._id))
            .map(reg => reg.eventId);
        localStorage.setItem("registeredEvents", JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(saved);
  });
  
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get event details for each registration
  const myEvents = useMemo(() => {
    return registeredEventIds.map(id => {
      return MOCK_EVENTS.find(e => e._id === id || e.id === id);
    }).filter(Boolean);
  }, [registeredEventIds]);

  const handleCancelRegistration = (eventId) => {
    const event = MOCK_EVENTS.find(e => e._id === eventId || e.id === eventId);
    if (!event) return;

    const eventDate = new Date(event.startDate);
    const now = new Date();

    if (eventDate <= now) {
      alert("Không thể hủy đăng ký sự kiện đã diễn ra hoặc đang diễn ra.");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn hủy đăng ký sự kiện "${event.title}" không?`)) {
      const newIds = registeredEventIds.filter(id => id !== eventId);
      setRegisteredEventIds(newIds);
      localStorage.setItem("registeredEvents", JSON.stringify(newIds));
      if (selectedEvent && (selectedEvent.id === eventId || selectedEvent._id === eventId)) {
        setSelectedEvent(null);
      }
    }
  };

  if (selectedEvent) {
    return (
      <div className='w-full md:flex h-screen overflow-hidden bg-gray-50'>
        <LeftBar />
        <EventDetailView 
          event={selectedEvent} 
          user={user || MOCK_USER} 
          onBack={() => setSelectedEvent(null)} 
        />
      </div>
    );
  }

  return (
    <div className='w-full md:flex h-screen overflow-hidden bg-gray-50'>
      <LeftBar />
      
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="max-w-5xl mx-auto p-6 lg:p-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vé tham gia sự kiện</h1>
            <p className="text-gray-500">Quản lý vé và truy cập vào không gian thảo luận của sự kiện</p>
          </div>

          {myEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có vé nào</h3>
              <p className="text-gray-500 max-w-md mx-auto">Bạn chưa đăng ký tham gia sự kiện nào. Hãy khám phá các sự kiện mới và tham gia ngay!</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {myEvents.map(event => {
                const isUpcoming = new Date(event.startDate) > new Date();
                
                return (
                  <motion.div 
                    key={event._id || event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row">
                        {/* Left: Image & Date */}
                        <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                            <img 
                                src={event.imageUrl} 
                                alt={event.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/50" />
                            
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Tháng {new Date(event.startDate).getMonth() + 1}</p>
                                <p className="text-2xl font-black text-gray-900 leading-none">{new Date(event.startDate).getDate()}</p>
                            </div>

                            <div className="absolute bottom-4 left-4 text-white md:hidden">
                                <span className="px-3 py-1 bg-brand-primary rounded-full text-xs font-bold shadow-lg">
                                    {event.category}
                                </span>
                            </div>
                        </div>

                        {/* Middle: Divider (Visual) */}
                        <div className="hidden md:flex flex-col justify-between py-4 relative w-8 bg-gray-50 border-l border-r border-dashed border-gray-300">
                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 absolute -top-4 -left-4 z-10"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 absolute -bottom-4 -left-4 z-10"></div>
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white relative">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="hidden md:inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {event.category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Đã xác nhận</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-brand-primary transition-colors">
                                    {event.title}
                                </h3>
                                
                                <div className="space-y-3 text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{event.startTime} - {event.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium line-clamp-1">{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                                <button 
                                    onClick={() => setSelectedEvent(event)}
                                    className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-primary transition-all shadow-lg hover:shadow-brand-primary/30 flex items-center justify-center gap-2 group/btn"
                                >
                                    <MessageSquare className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                    Vào khu vực thảo luận
                                </button>
                                
                                {isUpcoming && (
                                    <button 
                                        onClick={() => handleCancelRegistration(event._id || event.id)}
                                        className="px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                                        title="Hủy đăng ký"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Media