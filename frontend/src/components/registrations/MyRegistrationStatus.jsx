import React from 'react';
import { useSelector } from 'react-redux';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { REGISTRATION_STATUS } from '../../utils/constants';

const MyRegistrationStatus = ({ eventId, userId }) => {
  const { myRegistrations } = useSelector((state) => state.registration);
  
  const myReg = myRegistrations.find(
    reg => (reg.eventId?._id || reg.eventId) === eventId && (reg.userId?._id || reg.userId) === userId
  );

  if (!myReg) {
    return null;
  }

  const statusConfig = REGISTRATION_STATUS[myReg.status] || { color: "gray" };;
  
  const icons = {
    pending: <Clock className="w-5 h-5" />,
    accepted: <CheckCircle className="w-5 h-5" />,
    rejected: <XCircle className="w-5 h-5" />,
    cancelled: <XCircle className="w-5 h-5" />,
    waitlisted: <Clock className="w-5 h-5" />,
  };

  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const messages = {
    pending: 'Đăng ký của bạn đang chờ ban tổ chức duyệt.',
    accepted: 'Bạn đã được chấp nhận tham gia sự kiện này!',
    rejected: 'Đăng ký của bạn đã bị từ chối.',
    cancelled: 'Bạn đã hủy đăng ký sự kiện này.',
    waitlisted: 'Bạn đang trong danh sách chờ.',
  };

  const bgColors = {
    amber: 'bg-amber-50 border-amber-300',
    emerald: 'bg-emerald-50 border-emerald-300',
    red: 'bg-red-50 border-red-300',
    gray: 'bg-gray-50 border-gray-300',
    blue: 'bg-blue-50 border-blue-300',
  };

  const iconBgColors = {
    amber: 'bg-amber-100',
    emerald: 'bg-emerald-100',
    red: 'bg-red-100',
    gray: 'bg-gray-100',
    blue: 'bg-blue-100',
  };

  return (
    <div className={`p-4 rounded-xl border-2 shadow-sm ${bgColors[statusConfig.color]}`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-2.5 rounded-full ${iconBgColors[statusConfig.color]}`}>
          {icons[myReg.status]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">Trạng thái đăng ký</h4>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${colors[statusConfig.color]}`}>{statusConfig.label}</span>
          </div>
          <p className="text-sm text-gray-700">{messages[myReg.status]}</p>
          {myReg.rejectReason && myReg.status === 'rejected' && (
            <p className="text-sm mt-2 italic text-gray-600">
              Lý do: {myReg.rejectReason}
            </p>
          )}
          <p className="text-xs mt-2 text-gray-500">
            Đăng ký lúc: {new Date(myReg.registeredAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyRegistrationStatus;
