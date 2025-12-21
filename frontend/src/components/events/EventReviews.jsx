/** @format */

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, MessageSquare, User, BarChart3 } from "lucide-react";
import { fetchEventFeedbacks } from "../../features/attendanceSlice";
import WriteReview from "./WriteReview";

const EventReviews = ({ eventId }) => {
  const dispatch = useDispatch();

  const { reviews, loading } = useSelector((state) => state.attendance);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventFeedbacks(eventId));
    }
  }, [dispatch, eventId]);

  const currentChannel = useSelector((state) => state.channel.current);
  
  const { profile: user } = useSelector(
    (state) => state.user
  );
  
    const myAttendance = currentChannel.attendances.find(
      (a) => a.regId.userId === user._id
    );
  
  // --- TÍNH TOÁN SỐ LIỆU THỐNG KÊ (Memoized) ---
  const stats = useMemo(() => {
    // Giá trị mặc định nếu chưa có reviews
    if (!reviews || reviews.length === 0)
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };

    const total = reviews.length;
    // Tính tổng điểm
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    // Tính trung bình (làm tròn 1 chữ số thập phân)
    const average = (sum / total).toFixed(1);

    // Tính phân bố sao (Index 0 = 1 sao, ..., Index 4 = 5 sao)
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      // Đảm bảo rating hợp lệ từ 1-5
      const rating = Math.min(Math.max(Math.round(r.rating), 1), 5);
      distribution[rating - 1]++;
    });

    // Trả về distribution đã đảo ngược (để hiển thị 5 sao lên đầu danh sách)
    return { average, total, distribution: distribution.reverse() };
  }, [reviews]);

  // --- HÀM RENDER NGÔI SAO ---
  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className='flex text-yellow-400 gap-0.5'>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? "fill-current" : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-6 pb-10'>
      {myAttendance && <WriteReview attendance={myAttendance} eventId={currentChannel.event._id} />}

      {/* 1. REVIEW SUMMARY BOARD (BẢNG THỐNG KÊ) */}
      <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
        <div className='flex flex-col md:flex-row gap-8 items-center'>
          {/* Cột Trái: Điểm số tổng quan */}
          <div className='text-center md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 w-full'>
            <div className='text-6xl font-extrabold text-gray-900 mb-2 tracking-tighter'>
              {stats.average}
            </div>
            <div className='mb-2 scale-110'>
              {renderStars(Math.round(stats.average), "w-6 h-6")}
            </div>
            <p className='text-gray-500 font-medium'>
              {stats.total} lượt đánh giá
            </p>
          </div>

          {/* Cột Phải: Thanh phân bố (Progress Bars) */}
          <div className='flex-1 w-full space-y-3'>
            {stats.distribution.map((count, index) => {
              const starNum = 5 - index; // Vì mảng đã reverse: 5, 4, 3, 2, 1
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;

              return (
                <div key={starNum} className='flex items-center gap-3 text-sm'>
                  <div className='w-12 font-semibold text-gray-700 flex items-center gap-1'>
                    {starNum} <Star className='w-3 h-3 text-gray-400' />
                  </div>
                  <div className='flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out'
                      style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className='w-10 text-right text-gray-500 font-medium'>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. REVIEWS LIST (DANH SÁCH CHI TIẾT) */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-2'>
          <MessageSquare className='w-5 h-5 text-primary-600' />
          <h3 className='font-bold text-lg text-gray-900'>Chi tiết đánh giá</h3>
        </div>

        {loading ? (
          // Loading Skeleton
          <div className='animate-pulse space-y-4'>
            {[1, 2].map((i) => (
              <div key={i} className='h-32 bg-gray-100 rounded-xl w-full'></div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          // Empty State
          <div className='text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
            <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
              <BarChart3 className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-gray-900 font-medium mb-1'>
              Chưa có đánh giá nào
            </h3>
            <p className='text-gray-500 text-sm'>
              Sự kiện này chưa nhận được phản hồi từ tình nguyện viên.
            </p>
          </div>
        ) : (
          // List Items
          <div className='grid gap-4'>
            {reviews.map((review) => (
              <div
                key={review._id}
                className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200'>
                <div className='flex items-start justify-between mb-3'>
                  {/* User Info */}
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200'>
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center bg-gray-50 text-gray-400'>
                          <User className='w-5 h-5' />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900 text-sm'>
                        {review.user?.name || "Người dùng ẩn"}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {review.submittedAt
                          ? new Date(review.submittedAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Vừa xong"}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars Small */}
                  <div className='flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100'>
                    <span className='text-sm font-bold text-yellow-700 mr-1'>
                      {review.rating}.0
                    </span>
                    <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
                  </div>
                </div>

                {/* Comment Content */}
                <div className='pl-[52px]'>
                  {review.comment ? (
                    <p className='text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg rounded-tl-none'>
                      "{review.comment}"
                    </p>
                  ) : (
                    <p className='text-gray-400 text-sm italic'>
                      Người dùng không để lại bình luận.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventReviews;
