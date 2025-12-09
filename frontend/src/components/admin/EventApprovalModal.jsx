/**
 * @file EventApprovalModal.jsx
 * @description Modal for admin to approve/reject events
 * @pattern Presentational Component Pattern
 */

import React from 'react';
import { X, Calendar, MapPin, User, Tag, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * EventApprovalModal Component
 * Displays event details and provides approve/reject actions for admins
 * 
 * @param {Object} props - Component props
 * @param {Object} props.event - Event object to display
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onApprove - Callback when event is approved
 * @param {Function} props.onReject - Callback when event is rejected
 * @returns {JSX.Element|null} Modal component or null if no event
 */
const EventApprovalModal = ({ event, onClose, onApprove, onReject }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header with Image */}
        <div className="relative h-48 sm:h-64 bg-gray-100">
          <img 
            src={event.imageUrl || "https://via.placeholder.com/800x400?text=No+Image"} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
              {event.category || "Sự kiện"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight shadow-sm">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sự kiện</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Yêu cầu tình nguyện viên</h3>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800">
                  {event.requirements || "Không có yêu cầu đặc biệt."}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags?.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-100">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Thời gian</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(event.endDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Địa điểm</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <p className="text-xs text-gray-500">{event.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tổ chức bởi</p>
                    <p className="text-sm text-gray-600">{event.organizer}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Số lượng</p>
                    <p className="text-sm text-gray-600">{event.maxParticipants} người</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={() => onReject(event)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
          >
            <XCircle className="w-5 h-5" />
            Từ chối
          </button>
          <button 
            onClick={() => onApprove(event)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200 transition"
          >
            <CheckCircle className="w-5 h-5" />
            Duyệt sự kiện
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventApprovalModal;
