/** @format */

import React, { useState, useMemo, useEffect } from "react";
import Post from "./feed/Post";
import CreatePost from "./feed/CreatePost";
import {
  getChannelByEventId,
  addPostToChannel,
  toggleLikePost,
  hasUserLikedPost,
  addCommentToPost,
  approvePost,
  rejectPost,
  deletePost,
  editPost,
  deleteComment,
} from "../../data/mockChannels";
import { Filter, TrendingUp, Clock } from "lucide-react";

const EventFeed = ({ user, event }) => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'popular'
  const [channelId, setChannelId] = useState(null);

  // Load channel data
  useEffect(() => {
    if (!event || !user) return;
    const eventId = event.id || event._id;
    const userId = user._id || user.id;
    const channel = getChannelByEventId(eventId);

    if (channel) {
      setChannelId(channel.id);
      const formattedPosts = channel.posts.map((p) => ({
        ...p,
        time: new Date(p.createdAt).toLocaleString("vi-VN"),
        isLiked: hasUserLikedPost(channel.id, p.id, userId),
        comments: p.comments.map((c) => ({
          ...c,
          time: new Date(c.createdAt).toLocaleString("vi-VN"),
        })),
      }));
      setPosts(formattedPosts);
    } else {
      setPosts([]);
      setChannelId(null);
    }
  }, [event, user]);

  const refreshPosts = () => {
    if (!event || !user) return;
    const eventId = event.id || event._id;
    const userId = user._id || user.id;
    const channel = getChannelByEventId(eventId);
    if (channel) {
      const formattedPosts = channel.posts.map((p) => ({
        ...p,
        time: new Date(p.createdAt).toLocaleString("vi-VN"),
        isLiked: hasUserLikedPost(channel.id, p.id, userId),
        comments: p.comments.map((c) => ({
          ...c,
          time: new Date(c.createdAt).toLocaleString("vi-VN"),
        })),
      }));
      setPosts(formattedPosts);
    }
  };

  const sortedPosts = useMemo(() => {
    const isManager = user?.role === "manager" || user?.role === "admin";
    const visiblePosts = posts.filter(
      (p) =>
        p.status === "approved" ||
        !p.status ||
        isManager ||
        p.author.id === (user._id || user.id)
    );

    let sorted = [...visiblePosts];
    if (sortBy === "popular") {
      sorted.sort((a, b) => b.likes - a.likes);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [posts, sortBy, user]);

  const handleCreatePost = (postData) => {
    if (!channelId) return;
    addPostToChannel(channelId, postData.text, user, postData.attachment);
    refreshPosts();
  };

  const handleApprove = (postId) => {
    if (!channelId) return;
    approvePost(channelId, postId);
    refreshPosts();
  };

  const handleReject = (postId) => {
    if (!channelId) return;
    rejectPost(channelId, postId);
    refreshPosts();
  };

  const handleLike = (postId) => {
    if (!channelId || !user) return;
    const userId = user._id || user.id;
    toggleLikePost(channelId, postId, userId);
    refreshPosts();
  };

  const handleComment = (postId, content) => {
    if (!channelId) return;
    addCommentToPost(channelId, postId, content, user);
    refreshPosts();
  };

  const handleDeletePost = (postId) => {
    if (!channelId) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      deletePost(channelId, postId);
      refreshPosts();
    }
  };

  const handleEditPost = (postId, newContent) => {
    if (!channelId) return;
    editPost(channelId, postId, newContent);
    refreshPosts();
  };

  const handleDeleteComment = (postId, commentId) => {
    if (!channelId) return;
    deleteComment(channelId, postId, commentId);
    refreshPosts();
  };

  return (
    <div className='space-y-6 pb-10'>
      {/* Create Post Section */}
      <CreatePost user={user} onSubmit={handleCreatePost} />

      {/* Filter/Sort Bar */}
      <div className='flex items-center justify-between px-2'>
        <h3 className='font-bold text-gray-900 text-lg'>Bảng tin</h3>
        <div className='flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200'>
          <button
            onClick={() => setSortBy("newest")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === "newest"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}>
            <Clock className='w-4 h-4' />
            Mới nhất
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === "popular"
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}>
            <TrendingUp className='w-4 h-4' />
            Phổ biến
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className='space-y-4'>
        {sortedPosts.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed'>
            <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Filter className='w-8 h-8 text-gray-300' />
            </div>
            <h3 className='text-gray-900 font-medium mb-1'>
              Chưa có bài viết nào
            </h3>
            <p className='text-gray-500 text-sm'>
              Hãy là người đầu tiên chia sẻ về sự kiện này!
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              currentUser={user}
              onLike={handleLike}
              onComment={handleComment}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              onDeleteComment={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EventFeed;
