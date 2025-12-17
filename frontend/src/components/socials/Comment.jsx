/** @format */
import React, { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
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
    <div>
      {/* COMMENT */}
      <div className="flex gap-2">
        <img
          src={`https://ui-avatars.com/api/?name=${comment.author.userName}`}
          className="w-8 h-8 rounded-full"
        />

        <div className="flex-1">
          <div className="bg-gray-100 rounded-2xl px-3 py-2">
            <p className="font-semibold text-sm">
              {comment.author.userName}
            </p>
            <p className="text-sm">{comment.content}</p>
          </div>

          {/* ACTION */}
          <div className="flex gap-3 ml-3 mt-1 text-xs text-gray-500">
            <button
              onClick={handleLike}
              className={myReaction ? "text-blue-600" : ""}
            >
              Thích ({likeCount})
            </button>
            <button onClick={() => setShowReply(!showReply)}>
              Phản hồi
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(comment._id)}
                className="hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* REPLY INPUT */}
          {showReply && (
            <div className="ml-6 mt-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi..."
                className="w-full text-sm border rounded-full px-3 py-1"
              />
              <div className="flex gap-2 mt-1 text-xs">
                <button
                  onClick={handleReply}
                  className="text-blue-600 font-semibold"
                >
                  Gửi
                </button>
                <button
                  onClick={() => setShowReply(false)}
                  className="text-gray-400"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* REPLIES */}
          {comment.replies?.length > 0 && (
            <div className="ml-6 mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  eventId={eventId}
                  currentUser={currentUser}
                  onDelete={onDelete}
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
