/** @format */

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Send,
  ThumbsUp,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Smile,
} from "lucide-react";
import {
  fetchChannelByEventId,
  createPost,
  createComment,
  toggleReaction,
} from "../../features/channel/channelSlice";

const EventChannel = ({ eventId, user }) => {
  const dispatch = useDispatch();
  const { currentChannel: channel, loading } = useSelector(
    (state) => state.channel
  );

  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({}); // { postId: content }
  const [expandedComments, setExpandedComments] = useState({}); // { postId: true/false }

  const loadChannel = useCallback(() => {
    if (eventId) {
      dispatch(fetchChannelByEventId(eventId));
    }
  }, [dispatch, eventId]);

  useEffect(() => {
    loadChannel();
  }, [loadChannel]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    await dispatch(
      createPost({ channelId: channel._id, content: newPostContent })
    );
    setNewPostContent("");
  };

  const handleLike = async (postId) => {
    await dispatch(
      toggleReaction({ channelId: channel._id, postId, type: "like" })
    );
  };

  const handleCreateComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    await dispatch(createComment({ channelId: channel._id, postId, content }));
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='text-gray-500'>Đang tải kênh thảo luận...</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className='text-center py-16 bg-gray-50 rounded-xl border border-gray-200'>
        <MessageCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
        <p className='text-gray-600'>Chưa có kênh thảo luận cho sự kiện này.</p>
        <p className='text-sm text-gray-500 mt-2'>
          Hãy là người đầu tiên đăng bài!
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto space-y-6 pb-8'>
      {/* Form đăng bài mới */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
        <div className='flex gap-4'>
          <Avatar user={user} size='lg' />
          <form onSubmit={handleCreatePost} className='flex-1'>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder='Bạn đang nghĩ gì về sự kiện này? Chia sẻ cảm xúc, câu hỏi...'
              className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              rows={3}
            />
            <div className='flex justify-between items-center mt-3'>
              <button
                type='button'
                className='text-gray-500 hover:text-primary-600'>
                <Smile className='w-5 h-5' />
              </button>
              <button
                type='submit'
                disabled={!newPostContent.trim()}
                className='px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition'>
                <Send className='w-4 h-4' />
                Đăng bài
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danh sách bài viết */}
      <div className='space-y-6'>
        {channel.posts.length === 0 ? (
          <div className='text-center py-16 text-gray-500'>
            <MessageCircle className='w-16 h-16 mx-auto mb-4 text-gray-300' />
            <p className='text-lg'>Chưa có bài viết nào</p>
            <p className='text-sm mt-2'>Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          channel.posts.map((post) => (
            <div
              key={post._id || post.id}
              className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              {/* Header bài viết */}
              <div className='p-5 flex justify-between items-start'>
                <div className='flex gap-3'>
                  <Avatar user={post.author} />
                  <div>
                    <p className='font-semibold text-gray-900'>
                      {post.author.name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {new Date(post.createdAt).toLocaleString("vi-VN", {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <button className='text-gray-400 hover:text-gray-600'>
                  <MoreHorizontal className='w-5 h-5' />
                </button>
              </div>

              {/* Nội dung */}
              <div className='px-5 pb-3'>
                <p className='text-gray-800 whitespace-pre-wrap'>
                  {post.content}
                </p>
              </div>

              {/* Thống kê */}
              <div className='px-5 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600'>
                <span>{post.likes?.length || 0} lượt thích</span>
                <span>{post.comments?.length || 0} bình luận</span>
              </div>

              {/* Hành động */}
              <div className='px-3 py-2 border-t border-gray-100 flex'>
                <ActionButton
                  icon={ThumbsUp}
                  label='Thích'
                  active={post.likes?.includes(user?._id)}
                  onClick={() => handleLike(post.id || post._id)}
                />
                <ActionButton
                  icon={MessageCircle}
                  label='Bình luận'
                  onClick={() => toggleComments(post.id || post._id)}
                />
                <ActionButton icon={Share2} label='Chia sẻ' />
              </div>

              {/* Khu vực bình luận */}
              {expandedComments[post.id || post._id] && (
                <div className='border-t border-gray-100 bg-gray-50 p-5 space-y-4'>
                  {/* Danh sách bình luận */}
                  {post.comments?.map((comment) => (
                    <div key={comment._id || comment.id} className='flex gap-3'>
                      <Avatar user={comment.author} size='sm' />
                      <div className='flex-1'>
                        <div className='bg-white rounded-2xl px-4 py-2 shadow-sm inline-block'>
                          <p className='font-semibold text-sm text-gray-900'>
                            {comment.author.name}
                          </p>
                          <p className='text-gray-800'>{comment.content}</p>
                        </div>
                        <p className='text-xs text-gray-500 mt-1 ml-1'>
                          {new Date(comment.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Form bình luận */}
                  <div className='flex gap-3 items-start'>
                    <Avatar user={user} size='sm' />
                    <div className='flex-1 flex items-center gap-2'>
                      <input
                        type='text'
                        value={commentInputs[post.id || post._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id || post._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleCreateComment(post.id || post._id)
                        }
                        placeholder='Viết bình luận...'
                        className='flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                      />
                      <button
                        onClick={() => handleCreateComment(post.id || post._id)}
                        className='text-primary-600 hover:text-primary-700'>
                        <Send className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Sub-components
const Avatar = ({ user, size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0`}>
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.userName}
          className='w-full h-full object-cover'
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold'>
          {user?.userName?.[0]?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ icon, label, active = false, onClick }) => {
  const LucideIcon = icon;

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition hover:bg-gray-100 ${
        active ? "text-primary-600 font-semibold" : "text-gray-600"
      }`}>
      <LucideIcon className='w-5 h-5 flex-shrink-0' />
      <span>{label}</span>
    </button>
  );
};

export default EventChannel;
