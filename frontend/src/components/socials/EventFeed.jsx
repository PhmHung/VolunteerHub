import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Post from './Post';
import CreatePost from './CreatePost';
import { fetchChannelByEventId, createPost, createComment, toggleReaction } from '../../features/channel/channelSlice';
import { Filter, TrendingUp, Clock } from 'lucide-react';

const EventFeed = ({ user, event }) => {
  const dispatch = useDispatch();
  const { currentChannel } = useSelector((state) => state.channel || {});
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

  // Load channel data
  useEffect(() => {
    if (!event) return;
    const eventId = event._id || event.id;
    dispatch(fetchChannelByEventId(eventId));
  }, [event, dispatch]);

  const posts = useMemo(() => {
    if (!currentChannel?.posts) return [];
    return currentChannel.posts.map(p => ({
      ...p,
      id: p._id,
      time: new Date(p.createdAt).toLocaleString('vi-VN'),
      isLiked: p.reactions?.some(r => r.user === user?._id && r.type === 'like'),
      likes: p.reactions?.filter(r => r.type === 'like').length || 0,
      comments: (p.comments || []).map(c => ({
        ...c,
        id: c._id,
        time: new Date(c.createdAt).toLocaleString('vi-VN')
      }))
    }));
  }, [currentChannel, user]);

  const sortedPosts = useMemo(() => {
    if (!posts.length) return [];
    const isManager = user?.role === 'manager' || user?.role === 'admin';
    const visiblePosts = posts.filter(p => 
        p.status === 'approved' || 
        !p.status || 
        isManager || 
        p.author?._id === user?._id
    );

    let sorted = [...visiblePosts];
    if (sortBy === "popular") {
      sorted.sort((a, b) => b.likes - a.likes);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [posts, sortBy, user]);

  const handleCreatePost = async (postData) => {
    if (!currentChannel?._id) return;
    await dispatch(createPost({
      channelId: currentChannel._id,
      content: postData.text,
      image: postData.attachment
    }));
    dispatch(fetchChannelByEventId(event._id || event.id));
  };

  const handleApprove = (postId) => {
    console.log('Approve post:', postId);
    // TODO: Implement approve post API
  };

  const handleReject = (postId) => {
    console.log('Reject post:', postId);
    // TODO: Implement reject post API
  };

  const handleLike = async (postId) => {
    if (!user) return;
    await dispatch(toggleReaction({
      targetId: postId,
      type: 'like',
      targetType: 'post'
    }));
    dispatch(fetchChannelByEventId(event._id || event.id));
  };

  const handleComment = async (postId, content) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    await dispatch(createComment({ post, content }));
    dispatch(fetchChannelByEventId(event._id || event.id));
  };

  const handleDeletePost = (postId) => {
    console.log('Delete post:', postId);
    // TODO: Implement delete post API
  };

  const handleEditPost = (postId, newContent) => {
    console.log('Edit post:', postId, newContent);
    // TODO: Implement edit post API
  };

  const handleDeleteComment = (postId, commentId) => {
    console.log('Delete comment:', postId, commentId);
    // TODO: Implement delete comment API
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
