import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, ThumbsUp, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import { fetchChannelByEventId, createPost, createComment, toggleReaction } from '../../features/channel/channelSlice';

const EventChannel = ({ eventId, user }) => {
  const dispatch = useDispatch();
  const { currentChannel: channel, } = useSelector((state) => state.channel);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentContent, setCommentContent] = useState({}); // Map postId -> content
  const [showComments, setShowComments] = useState({}); // Map postId -> boolean

  const loadChannel = useCallback(() => {
    if (eventId) {
      dispatch(fetchChannelByEventId(eventId));
    }
  }, [dispatch, eventId]);

  useEffect(() => {
    loadChannel();
  }, [loadChannel]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    await dispatch(createPost({ channelId: channel._id, content: newPostContent }));
    setNewPostContent('');
  };

  const handleLike = async (postId) => {
    await dispatch(toggleReaction({ channelId: channel._id, postId, type: 'like' }));
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentContent[postId];
    if (!content?.trim()) return;

    await dispatch(createComment({ channelId: channel._id, postId, content }));
    setCommentContent(prev => ({ ...prev, [postId]: '' }));
    setShowComments(prev => ({ ...prev, [postId]: true }));
  };

  if (!channel) {
    return (
      <div className="text-center py-10 bg-surface-muted rounded-xl border border-border">
        <p className="text-text-muted">Chưa có kênh thảo luận cho sự kiện này.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-surface-base rounded-xl shadow-soft border border-border p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-muted overflow-hidden flex-shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                {user?.userName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <form onSubmit={handlePostSubmit} className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì về sự kiện này?"
              className="w-full bg-surface-muted border-none rounded-xl p-3 focus:ring-2 focus:ring-primary-500/20 resize-none min-h-[80px]"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newPostContent.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Đăng bài
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {channel.posts.map((post) => (
          <div key={post.id} className="bg-surface-base rounded-xl shadow-soft border border-border overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-3">
                <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                <div>
                  <h4 className="font-semibold text-text-main">{post.author.name}</h4>
                  <p className="text-xs text-text-muted">
                    {new Date(post.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <button className="text-text-muted hover:text-text-secondary">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
              <p className="text-text-main whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-text-muted border-b border-surface-muted">
              <span>{post.likes} lượt thích</span>
              <span>{post.comments.length} bình luận</span>
            </div>

            {/* Post Actions */}
            <div className="px-2 py-1 flex items-center justify-between">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex-1 py-2 hover:bg-surface-muted rounded-lg flex items-center justify-center gap-2 text-text-secondary font-medium transition"
              >
                <ThumbsUp className="w-5 h-5" /> Thích
              </button>
              <button 
                onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                className="flex-1 py-2 hover:bg-surface-muted rounded-lg flex items-center justify-center gap-2 text-text-secondary font-medium transition"
              >
                <MessageCircle className="w-5 h-5" /> Bình luận
              </button>
              <button className="flex-1 py-2 hover:bg-surface-muted rounded-lg flex items-center justify-center gap-2 text-text-secondary font-medium transition">
                <Share2 className="w-5 h-5" /> Chia sẻ
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="bg-surface-muted p-4 border-t border-border space-y-4">
                {/* Comment List */}
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2">
                    <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="bg-surface-base p-3 rounded-2xl rounded-tl-none shadow-sm inline-block">
                        <p className="font-semibold text-xs text-text-main">{comment.author.name}</p>
                        <p className="text-sm text-text-main">{comment.content}</p>
                      </div>
                      <p className="text-xs text-text-muted mt-1 ml-1">
                        {new Date(comment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex gap-2 items-center mt-2">
                  <div className="w-8 h-8 rounded-full bg-surface-muted overflow-hidden flex-shrink-0">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-xs font-bold">
                        {user?.userName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentContent[post.id] || ''}
                      onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      placeholder="Viết bình luận..."
                      className="w-full rounded-full border-border pl-4 pr-10 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button 
                      onClick={() => handleCommentSubmit(post.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-700"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventChannel;