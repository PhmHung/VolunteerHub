import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, MoreHorizontal } from 'lucide-react';

const EventHeader = ({ event }) => {
  return (
    <div className="bg-white shadow-md mb-4">
      {/* Cover Image */}
      <div className="h-[200px] md:h-[280px] w-full relative overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 bg-white">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{event.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                <CheckCircle className="w-4 h-4" /> Đã tham gia
              </span>
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4" /> 
                {new Date(event.startDate).toLocaleDateString('vi-VN')} - {new Date(event.endDate).toLocaleDateString('vi-VN')}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" /> {event.city}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-5 mt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                <Users className="w-5 h-5" />
                <span className="font-bold">{event.registered || 0}</span>
                <span className="text-blue-600">thành viên</span>
              </div>
              <span className="text-gray-500 text-sm">Tổ chức bởi <span className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">{event.organizer}</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-md">
                <CheckCircle className="w-5 h-5" />
                Đã tham gia
              </button>
              <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHeader;