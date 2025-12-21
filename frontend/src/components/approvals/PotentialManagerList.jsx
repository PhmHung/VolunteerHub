/** @format */

import React, { useEffect } from "react";
import {
  Briefcase,
  User,
  Star,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const PotentialManagerList = ({
  suggestedUsers,
  onRecommend,
  highlightedId,
}) => {
  useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(
        `suggestion-card-${highlightedId}`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedId]);
  if (!suggestedUsers || suggestedUsers.length === 0) {
    return (
      <div className='text-center py-12 bg-white rounded-xl border border-gray-200'>
        <Briefcase className='w-10 h-10 text-gray-400 mx-auto mb-3' />
        <p className='text-gray-500 font-medium'>
          Hiện tại không có ứng viên tiềm năng nào thỏa mãn tiêu chí tự động.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='text-sm text-gray-600 font-medium px-4'>
        Danh sách này gợi ý các Tình nguyện viên đã hoạt động tích cực nhưng{" "}
        <span className='font-bold text-green-700'>chưa gửi yêu cầu</span> thăng
        cấp Manager.
      </div>
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <User className='w-4 h-4 inline mr-1' /> Ứng viên
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <TrendingUp className='w-4 h-4 inline mr-1' /> Sự kiện Hoàn
                thành
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <Clock className='w-4 h-4 inline mr-1' /> Tổng giờ tham gia
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                <Star className='w-4 h-4 inline mr-1' /> Rating TB
              </th>
              <th scope='col' className='relative px-6 py-3'>
                <span className='sr-only'>Action</span>
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {suggestedUsers.map((user) => {
              // 1. Xác định xem hàng này có đang được highlight hay không
              const isHighlighted = user._id === highlightedId;

              return (
                <tr
                  key={user._id}
                  // 2. Gán ID để useEffect trong component có thể tìm và cuộn đến đúng dòng này
                  id={`suggestion-card-${user._id}`}
                  // 3. Cập nhật ClassName: Thêm viền (ring) và nền màu xanh lá khi được highlight
                  className={`transition-all duration-500 group ${
                    isHighlighted
                      ? "bg-green-100 ring-2 ring-green-500 ring-inset z-10 relative shadow-sm"
                      : "hover:bg-green-50/50"
                  }`}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 w-10 h-10'>
                        {/* Thay đổi màu sắc Avatar dựa trên trạng thái highlight */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            isHighlighted
                              ? "bg-green-600 text-white"
                              : "bg-green-100 text-green-700"
                          }`}>
                          {user.userName?.charAt(0) || "U"}
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div
                          className={`text-sm font-bold transition-colors ${
                            isHighlighted ? "text-green-800" : "text-gray-900"
                          }`}>
                          {user.userName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {user.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {user.promotionData?.eventsCompleted || "N/A"}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {user.promotionData?.totalAttendanceHours?.toFixed(1) ||
                      "N/A"}{" "}
                    giờ
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                    {user.promotionData?.averageRating?.toFixed(1) || "N/A"} / 5
                  </td>

                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={() => onRecommend(user)}
                      className={`flex items-center gap-1 transition-all ${
                        isHighlighted
                          ? "text-green-800 font-bold scale-105"
                          : "text-green-600 hover:text-green-900"
                      }`}>
                      {isHighlighted ? "Đề cử ngay" : "Đề cử ngay"}
                      <ArrowRight className='w-4 h-4' />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PotentialManagerList;
