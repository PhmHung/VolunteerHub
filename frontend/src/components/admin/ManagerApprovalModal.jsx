import React from 'react';
import { X, Check, User, Briefcase, Linkedin, FileText, Building, Calendar } from 'lucide-react';

const ManagerApprovalModal = ({ request, onClose, onApprove, onReject }) => {
  if (!request) return null;

  const { candidate, appliedAt, experience, currentRole, organization, linkedIn, motivation, cvUrl } = request;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Duyệt Hồ Sơ Quản Lý
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Candidate Info */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
              {candidate.profilePicture ? (
                <img src={candidate.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">{candidate.userName?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{candidate.userName}</h2>
              <p className="text-gray-500">{candidate.userEmail}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {candidate.age || 'N/A'} tuổi
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 
                  Apply: {new Date(appliedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                Công việc hiện tại
              </h4>
              <div className="space-y-2">
                <p className="text-sm"><span className="text-gray-500">Vị trí:</span> <span className="font-medium">{currentRole}</span></p>
                <p className="text-sm"><span className="text-gray-500">Tổ chức:</span> <span className="font-medium">{organization}</span></p>
                <p className="text-sm"><span className="text-gray-500">Kinh nghiệm:</span> <span className="font-medium">{experience} năm</span></p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Hồ sơ đính kèm
              </h4>
              <div className="space-y-3">
                {linkedIn && (
                  <a href={linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Linkedin className="w-4 h-4" /> LinkedIn Profile
                  </a>
                )}
                {cvUrl && (
                  <a href={cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <FileText className="w-4 h-4" /> Xem CV (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Lý do ứng tuyển</h4>
            <div className="bg-blue-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-blue-100">
              "{motivation}"
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={() => onReject(request)}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Từ chối
          </button>
          <button 
            onClick={() => onApprove(request)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Duyệt làm Manager
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovalModal;