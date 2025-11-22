import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, MoreHorizontal } from 'lucide-react';

const EventHeader = ({ event }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-4 relative">
      {/* Cover Image */}
      <div className="h-[350px] w-full relative group">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white max-w-6xl mx-auto w-full">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">{event.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-200 mb-6">
            <span className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-md text-green-400 border border-green-500/30 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4" /> Đã duyệt
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> 
              {new Date(event.startDate).toLocaleDateString('vi-VN')} - {new Date(event.endDate).toLocaleDateString('vi-VN')}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {event.city}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white text-lg">{event.registered || 0} thành viên</span>
              <span className="text-gray-500 hidden sm:inline">•</span>
              <span className="text-gray-300 text-sm">Tổ chức bởi <span className="font-bold text-white hover:underline cursor-pointer">{event.organizer}</span></span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg shadow-green-900/20">
                <Users className="w-5 h-5" />
                Đã tham gia
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-lg backdrop-blur-md transition border border-white/10">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;