/** @format */

import React, { useState } from "react";
import { Star, ThumbsUp, Send } from "lucide-react";

// MOCK DATA
const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Trần Văn B",
    avatar: "https://ui-avatars.com/api/?name=Tran+Van+B&background=random",
    rating: 5,
    comment: "Sự kiện rất ý nghĩa, ban tổ chức nhiệt tình! Đồ ăn trưa cũng rất ngon.",
    date: "2 giờ trước",
    likes: 12,
  },
  {
    id: 2,
    user: "Lê Thị C",
    avatar: "https://ui-avatars.com/api/?name=Le+Thi+C&background=random",
    rating: 4,
    comment: "Mọi thứ đều tốt, công việc vừa sức. Tuy nhiên khâu di chuyển hơi lộn xộn.",
    date: "1 ngày trước",
    likes: 5,
  },
  {
    id: 3,
    user: "Nguyễn Gamer",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Gamer&background=random",
    rating: 5,
    comment: "Tuyệt vời! Sẽ rủ bạn bè tham gia lần sau.",
    date: "2 ngày trước",
    likes: 2,
  },
];

// Helper hiển thị sao
const StarRating = ({ rating, size = "w-4 h-4" }) => (
  <div className='flex gap-0.5'>
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

const EventReviews = ({ user }) => {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0); // Hiệu ứng hover sao
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý gửi đánh giá
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setIsSubmitting(true);
    setTimeout(() => {
      const newReview = {
        id: Date.now(),
        user: user?.name || "Bạn",
        avatar: user?.avatar || "https://ui-avatars.com/api/?name=Me",
        rating: newRating,
        comment: newComment,
        date: "Vừa xong",
        likes: 0,
      };
      setReviews([newReview, ...reviews]);
      setNewComment("");
      setNewRating(5);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className='space-y-8 pb-10'>
      {/* 1. TỔNG QUAN ĐÁNH GIÁ (HEADER ĐẸP) */}
      <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden'>
        {/* Hiệu ứng nền mờ màu vàng */}
        <div className='absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70'></div>

        {/* Cột trái: Điểm số to */}
        <div className='relative z-10 text-center md:text-left'>
          <div className='flex items-baseline justify-center md:justify-start gap-2'>
            <span className='text-6xl font-black text-gray-900 leading-none'>
              4.8
            </span>
            <span className='text-gray-500 font-medium'>/ 5.0</span>
          </div>
          <div className='flex justify-center md:justify-start my-3'>
            <StarRating rating={5} size='w-6 h-6' />
          </div>
          <p className='text-sm font-medium text-gray-500'>
            {reviews.length} đánh giá
          </p>
        </div>

        <div className='h-px w-full md:w-px md:h-24 bg-gray-200 shrink-0'></div>

        {/* Cột phải: Thanh tiến độ (Progress Bars) */}
        <div className='flex-1 w-full space-y-2 relative z-10'>
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className='flex items-center gap-3 text-sm'>
              <span className='font-medium text-gray-700 w-3'>{s}</span>{" "}
              <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
              <div className='flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden'>
                {/* Giả lập độ dài thanh bar cho đẹp */}
                <div
                  className={`h-full rounded-full ${
                    s >= 4
                      ? "bg-yellow-400"
                      : s === 3
                      ? "bg-yellow-300"
                      : "bg-gray-300"
                  }`}
                  style={{
                    width: s === 5 ? "70%" : s === 4 ? "20%" : "5%",
                  }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. BỐ CỤC 2 CỘT: FORM VÀ DANH SÁCH */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Cột trái: Form Viết Đánh Giá (Sticky) */}
        <div className='md:col-span-1 order-2 md:order-1'>
          <div className='bg-white p-6 rounded-2xl shadow-lg shadow-primary-100/50 border border-primary-100 sticky top-24'>
            <h3 className='font-bold text-lg text-gray-900 mb-4 flex items-center gap-2'>
              <Star className='w-5 h-5 text-yellow-500 fill-yellow-500' /> Viết
              đánh giá
            </h3>
            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Chọn mức độ hài lòng
                </label>
                <div
                  className='flex items-center gap-1'
                  onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className='p-1 focus:outline-none transition-transform hover:scale-110'>
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || newRating)
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                            : "text-gray-300 fill-gray-50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nội dung
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className='w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors'
                  rows='4'
                  placeholder='Chia sẻ cảm nhận...'></textarea>
              </div>
              <button
                type='submit'
                disabled={isSubmitting}
                className='btn btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-primary-200'>
                {isSubmitting ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send className='w-4 h-4' /> Gửi đánh giá
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Cột phải: Danh sách Comment */}
        <div className='md:col-span-2 order-1 md:order-2 space-y-4'>
          <h3 className='font-bold text-lg text-gray-900 mb-2 px-2'>
            Đánh giá gần đây
          </h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md'>
              <div className='flex items-start gap-4'>
                <img
                  src={review.avatar}
                  alt={review.user}
                  className='w-11 h-11 rounded-full bg-gray-100 border-2 border-white shadow-sm object-cover'
                />
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <h4 className='font-bold text-gray-900'>{review.user}</h4>
                    <span className='text-xs font-medium text-gray-400'>
                      {review.date}
                    </span>
                  </div>
                  <div className='mb-2'>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className='text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl rounded-tl-none'>
                    {review.comment}
                  </p>
                  <div className='flex items-center gap-4 mt-3 ml-2'>
                    <button className='flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors group'>
                      <ThumbsUp className='w-4 h-4 group-hover:scale-110 transition-transform' />{" "}
                      Hữu ích ({review.likes})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventReviews;