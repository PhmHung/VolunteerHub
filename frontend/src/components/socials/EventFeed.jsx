/** @format */
import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Post from "./Post";
import CreatePost from "./CreatePost";
import PostDetailModal from "./PostDetailModal"; // Thêm dòng này
import {
  fetchChannelByEventId,
  createPost,
  createComment,
  togglePostReaction,
} from "../../features/channelSlice";
import { Filter, TrendingUp, Clock } from "lucide-react";

const EventFeed = ({ user, event }) => {
  const dispatch = useDispatch();
  const currentChannel = useSelector((state) => state.channel.current);
  const [sortBy, setSortBy] = useState("newest");
  
  // CHỈ THÊM DÒNG NÀY: Quản lý modal
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!event) return;
    const eventId = event._id || event.id;
    dispatch(fetchChannelByEventId(eventId));
  }, [event, dispatch]);

  const posts = useMemo(() => {
    if (!currentChannel?.posts) return [];
    return currentChannel.posts.map((p) => ({
      ...p,
      id: p._id,
      time: new Date(p.createdAt).toLocaleString("vi-VN"),
      isLiked: p.reactions?.some((r) => r.user === user?._id && r.type === "like"),
      likes: p.reactions?.filter((r) => r.type === "like").length || 0,
      comments: (p.comments || []).map((c) => ({
        ...c,
        id: c._id,
        time: new Date(c.createdAt).toLocaleString("vi-VN"),
      })),
    }));
  }, [currentChannel, user]);

  const sortedPosts = useMemo(() => {
    if (!posts.length) return [];
    const isManager = user?.role === "manager" || user?.role === "admin";
    const visiblePosts = posts.filter(
      (p) => p.status === "approved" || !p.status || isManager || p.author?._id === user?._id
    );
    let sorted = [...visiblePosts];
    if (sortBy === "popular") sorted.sort((a, b) => b.likes - a.likes);
    else sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted;
  }, [posts, sortBy, user]);

  const handleCreatePost = async (postData) => {
    if (!currentChannel?._id) return;
    await dispatch(createPost({ channelId: currentChannel._id, content: postData.text, attachment: postData.attachment }));
    dispatch(fetchChannelByEventId(event._id || event.id));
  };

  const handleLike = async (postId) => {
    if (!user) return;
    await dispatch(togglePostReaction({ postId, type: "like" }));
    dispatch(fetchChannelByEventId(event._id || event.id));
  };

  const handleComment = async (postId, content) => {
    await dispatch(createComment({ postId, content }));
    dispatch(fetchChannelByEventId(event._id || event.id));
  };

  return (
    <div className='space-y-6 pb-10'>
      <CreatePost user={user} onSubmit={handleCreatePost} />

      {/* Filter/Sort Bar giữ nguyên */}
      <div className='flex items-center justify-between px-2'>
        <h3 className='font-bold text-gray-900 text-lg'>Bảng tin</h3>
        <div className='flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200'>
          <button onClick={() => setSortBy("newest")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${sortBy === "newest" ? "bg-primary-50 text-primary-700" : "text-gray-600"}`}><Clock className='w-4 h-4' /> Mới nhất</button>
          <button onClick={() => setSortBy("popular")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${sortBy === "popular" ? "bg-primary-50 text-primary-700" : "text-gray-600"}`}><TrendingUp className='w-4 h-4' /> Phổ biến</button>
        </div>
      </div>

      {/* Posts List: THÊM onClick để mở Modal */}
      <div className='space-y-4'>
        {sortedPosts.map((post) => (
          <div key={post.id} onClick={() => setSelectedPost(post)}>
            <Post
              post={post}
              eventId={event._id || event.id}
              currentUser={user}
              onLike={handleLike}
              onComment={handleComment}
            />
          </div>
        ))}
      </div>

      {/* CHỈ THÊM DÒNG NÀY: Render Modal khi có selectedPost */}
      {selectedPost && (
        <PostDetailModal 
          post={selectedPost}
          currentUser={user}
          eventId={event._id || event.id}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

export default EventFeed;