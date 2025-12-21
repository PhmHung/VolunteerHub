/** @format */

import React from "react";
import { Users, AlertCircle } from "lucide-react";
import VolunteersCard from "./VolunteersCard";

const VolunteersList = ({
  registrations = [],
  users = [],
  compact = false,
  canView = true,
  onUserClick,
  userRole,
  addToast,
}) => {
  // Logic tạo volunteers (populate user vào reg object)
  const volunteers = registrations.map((reg) => {
    const user =
      users.find(
        (u) => u._id === (reg.userId?._id || reg.userId || reg.volunteer?._id)
      ) ||
      reg.userId ||
      {};

    return {
      ...reg,
      user: user,
    };
  });

  // Kiểm tra quyền xem
  if (!canView && !compact) {
    return (
      <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center'>
        <AlertCircle className='w-12 h-12 text-amber-500 mx-auto mb-3' />
        <h3 className='text-lg font-medium'>Chưa thể xem danh sách</h3>
        <p className='text-gray-500'>
          Bạn cần tham gia sự kiện để xem danh sách thành viên.
        </p>
      </div>
    );
  }

  // Danh sách rỗng
  if (volunteers.length === 0) {
    return (
      <div className='bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center'>
        <Users className='w-12 h-12 text-gray-300 mx-auto mb-3' />
        <p className='text-gray-500'>Chưa có thành viên nào.</p>
      </div>
    );
  }

  // Logic rendering
  return (
    <div>
      {!compact && (
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold text-gray-900'>
            Danh sách tham gia ({volunteers.length})
          </h2>
        </div>
      )}

      <div className='space-y-3 max-h-96 overflow-y-auto'>
        {volunteers.map((volunteer) => (
          <VolunteersCard
            key={volunteer._id}
            volunteer={volunteer}
            compact={compact}
            onUserClick={onUserClick}
            userRole={userRole}
            addToast={addToast}
          />
        ))}
      </div>
    </div>
  );
};

export default VolunteersList;
