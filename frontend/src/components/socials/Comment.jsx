/** @format */
import React, { useMemo, useState } from "react";
import { Trash2, CornerDownRight } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  toggleCommentReaction,
  createComment,
  fetchChannelByEventId,
} from "../../features/channelSlice";

const Comment = ({
  comment,
  postId,
  eventId,
  currentUser,
  onDelete,
  isReply = false, // Thêm prop để nhận diện nếu đây là bình luận con
}) => {
  const dispatch = useDispatch();
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);

  const isAuthor = currentUser?._id === comment.author?._id;
  const isManager = ["manager", "admin"].includes(currentUser?.role);
  const canDelete = isAuthor || isManager;

  const reactions = comment.reactions || [];
  const likeCount = reactions.filter((r) => r.type === "like").length;

  const myReaction = useMemo(
    () => reactions.find((r) => r.user?._id === currentUser?._id),
    [reactions, currentUser]
  );

  const handleLike = async () => {
    await dispatch(
      toggleCommentReaction({
        commentId: comment._id,
        type: "like",
      })
    );
    dispatch(fetchChannelByEventId(eventId));
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await dispatch(
      createComment({
        content: replyText,
        postId,
        parentCommentId: comment._id,
      })
    );
    setReplyText("");
    setShowReply(false);
    dispatch(fetchChannelByEventId(eventId));
  };

  return (
    <div className={`group ${isReply ? "mt-2" : "mt-4"}`}>
      <div className="flex gap-2">
        {/* Avatar nhỏ hơn cho reply */}
        <img
          src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.userName}&background=random`}
          className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full flex-shrink-0 mt-1`}
          alt="avatar"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 group/bubble">
            {/* Khối nội dung Bo tròn kiểu Facebook */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-[18px] px-3 py-2 inline-block max-w-full">
              <p className="font-bold text-[13px] text-gray-900 dark:text-gray-100 leading-tight hover:underline cursor-pointer">
                {comment.author.userName}
              </p>
              <p className="text-[14px] text-gray-800 dark:text-gray-200 leading-snug break-words">
                {comment.content}
              </p>
            </div>

            {/* Nút xóa ẩn, chỉ hiện khi hover vào bubble bình luận */}
            {canDelete && (
              <button
                onClick={() => onDelete(comment._id)}
                className="opacity-0 group-hover/bubble:opacity-100 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Action Buttons (Like, Reply, Time) */}
          <div className="flex items-center gap-3 ml-2 mt-0.5 text-[12px] font-bold text-gray-500">
            <button
              onClick={handleLike}
              className={`hover:underline cursor-pointer ${myReaction ? "text-blue-600" : ""}`}
            >
              Thích {likeCount > 0 && `(${likeCount})`}
            </button>
            <button 
              onClick={() => setShowReply(!showReply)}
              className="hover:underline cursor-pointer"
            >
              Phản hồi
            </button>
            <span className="font-normal text-gray-400">
                {/* Giả sử bạn có trường createdAt */}
                {comment.time || "Vừa xong"}
            </span>
          </div>

          {/* Ô nhập phản hồi */}
          {showReply && (
            <div className="flex gap-2 mt-2 items-start mr-4">
               <img
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.userName}&background=random`}
                className="w-6 h-6 rounded-full flex-shrink-0"
                alt="my-avatar"
              />
              <div className="flex-1">
                <input
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  placeholder={`Phản hồi ${comment.author.userName}...`}
                  className="w-full bg-gray-100 border-none rounded-2xl py-1.5 px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-2">Nhấn Enter để gửi</p>
              </div>
            </div>
          )}

          {/* Danh sách phản hồi con (Đệ quy) */}
          {comment.replies?.length > 0 && (
            <div className="border-l-2 border-gray-100 ml-1 pl-2 mt-1">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  eventId={eventId}
                  currentUser={currentUser}
                  onDelete={onDelete}
                  isReply={true} // Đánh dấu là reply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;