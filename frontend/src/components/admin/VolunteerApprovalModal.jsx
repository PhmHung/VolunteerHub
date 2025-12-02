import React from 'react';
import { X, Mail, Phone, Award, Calendar, CheckCircle, XCircle, User } from 'lucide-react';

const VolunteerApprovalModal = ({ registration, onClose, onApprove, onReject }) => {
  if (!registration) return null;

  const { volunteer, event } = registration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white">
              {volunteer.profilePicture ? (
                <img src={volunteer.profilePicture} alt={volunteer.userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-2xl font-bold">
                  {volunteer.userName?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{volunteer.userName}</h2>
              <p className="text-emerald-100 flex items-center gap-2 text-sm mt-1">
                <Mail className="w-4 h-4" /> {volunteer.userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          
          {/* Application Context */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-1 uppercase tracking-wide">Đăng ký tham gia sự kiện</h3>
            <p className="text-lg font-medium text-gray-900">{event.title}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.startDate).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Volunteer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Thông tin liên hệ</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </div>
                  <span>{volunteer.phoneNumber || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="capitalize">{volunteer.role || "Tình nguyện viên"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills && volunteer.skills.length > 0 ? (
                  volunteer.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Chưa cập nhật kỹ năng</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio / Note */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Giới thiệu bản thân</h3>
            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed border border-gray-100">
              {volunteer.biography || "Người dùng chưa cập nhật phần giới thiệu."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={() => onReject(registration)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
          >
            <XCircle className="w-5 h-5" />
            Từ chối
          </button>
          <button 
            onClick={() => onApprove(registration)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200 transition"
          >
            <CheckCircle className="w-5 h-5" />
            Chấp nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerApprovalModal;
