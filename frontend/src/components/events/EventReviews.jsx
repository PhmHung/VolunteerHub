/** @format */

import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Star, ThumbsUp, Send } from "lucide-react";

/* ======================
   Helper hiển thị sao
====================== */
const StarRating = ({ rating, size = "w-4 h-4" }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-200 fill-gray-100"
        }`}
      />
    ))}
  </div>
);

const EventReviews = () => {
  const channel = useSelector((state) => state.channel.current);

  /* ======================
     Lấy reviews từ backend
  ====================== */
  const reviews = useMemo(() => {
    if (!channel?.attendances) return [];

    return channel.attendances
      .filter(
        (a) => a.status === "completed" && a.feedback?.rating
      )
      .map((a) => ({
        id: a._id,
        user: a.regId.userId.userName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          a.regId.userId.userName
        )}&background=random`,
        rating: a.feedback.rating,
        comment: a.feedback.comment,
        date: new Date(a.feedback.submittedAt).toLocaleDateString("vi-VN"),
        likes: 0, // TODO: nếu sau này có like feedback
      }))
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [channel]);

  /* ======================
     Tổng hợp điểm
  ====================== */
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  /* ======================
     UI
  ====================== */
  return (
    <div className="space-y-8 pb-10">
      {/* ======================
          HEADER TỔNG QUAN
      ====================== */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-gray-900">
              {avgRating}
            </span>
            <span className="text-gray-500 font-medium">/ 5.0</span>
          </div>
          <div className="my-3">
            <StarRating rating={Math.round(avgRating)} size="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {reviews.length} đánh giá
          </p>
        </div>
      </div>

      {/* ======================
          DANH SÁCH REVIEWS
      ====================== */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-gray-900 px-2">
          Đánh giá từ người tham gia
        </h3>

        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 px-2">
            Chưa có đánh giá nào cho sự kiện này.
          </p>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex gap-4">
              <img
                src={review.avatar}
                alt={review.user}
                className="w-11 h-11 rounded-full"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-900">
                    {review.user}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {review.date}
                  </span>
                </div>

                <StarRating rating={review.rating} />

                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                  {review.comment}
                </p>

                <button className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
                  <ThumbsUp className="w-4 h-4" /> Hữu ích ({review.likes})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventReviews;
