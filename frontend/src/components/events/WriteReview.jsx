import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Star } from "lucide-react";
import { submitFeedback } from "../../features/attendanceSlice";
import { fetchEventFeedbacks } from "../../features/attendanceSlice";

const WriteReview = ({ attendance, eventId }) => {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);

  const canReview =
    attendance.status === "completed" &&
    attendance.checkOut &&
    !attendance.feedback;

  if (!canReview) return null;

  const submitHandler = () => {
    dispatch(
      submitFeedback({
        attendanceId: attendance._id,
        rating,
        comment,
        eventId,
      })
    );
    dispatch(fetchEventFeedbacks(eventId));
    // Reset form
    setRating(0);
    setComment("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
      <h3 className="font-bold text-gray-900">Viết đánh giá</h3>

      {/* ⭐ Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${
              star <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      {/* 💬 Comment */}
      <textarea
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Chia sẻ cảm nhận của bạn về sự kiện..."
        className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={submitHandler}
        disabled={!rating || !comment}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium disabled:opacity-50"
      >
        Gửi đánh giá
      </button>
    </div>
  );
};

export default WriteReview;
