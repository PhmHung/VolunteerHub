import React, { useState, useMemo } from 'react';
import Post from './feed/Post';
import CreatePost from './feed/CreatePost';

const INITIAL_POSTS = [
  {
    id: 1,
    author: { name: "Tùng Họa Mi (Đội trưởng)", avatar: null },
    time: "2 giờ trước",
    status: "approved",
    content: (
        <div>
            <p className="font-bold text-brand-primary mb-2 flex items-center gap-2">
                📣 THÔNG BÁO HỌP ĐỘI LẦN 1
            </p>
            <p className="text-gray-700">Tối nay 20h00, mời tất cả các bạn TNV đã đăng ký thành công vào link Meet bên dưới để phổ biến quy chế hoạt động nhé.</p>
            <a href="#" className="text-blue-600 text-sm hover:underline mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                Link: meet.google.com/abc-xyz
            </a>
        </div>
    ),
    likes: 45,
    isLiked: false,
    comments: [
      { id: 101, author: { name: "Nguyễn Văn A", avatar: null }, content: "Đã nhận thông tin ạ!", time: "1 giờ trước" },
      { id: 102, author: { name: "Trần Thị B", avatar: null }, content: "Em xin phép vào muộn 5p nhé ạ.", time: "30 phút trước" }
    ]
  },
  {
    id: 2,
    author: { name: "Đoàn Thanh Niên ĐHQG", avatar: null },
    time: "5 giờ trước",
    status: "approved",
    content: <p className="text-gray-700">Danh sách các vật dụng cần chuẩn bị cho chuyến đi Hà Giang sắp tới. Mọi người lưu ý mục "Thuốc cá nhân" nhé! 🎒💊</p>,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    likes: 128,
    isLiked: true,
    comments: []
  }
];

const EventFeed = ({ user }) => {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'

  const sortedPosts = useMemo(() => {
    let sorted = [...posts];
    if (sortBy === 'popular') {
        sorted.sort((a, b) => b.likes - a.likes);
    } else {
        // Mock sort by ID (assuming higher ID = newer)
        sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
  }, [posts, sortBy]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleComment = (postId, content) => {
    const newComment = {
      id: Date.now(),
      author: { name: user?.userName || "Tôi", avatar: user?.profilePicture },
      content,
      time: "Vừa xong"
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleDeleteComment = (postId, commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: post.comments.filter(c => c.id !== commentId)
                };
            }
            return post;
        }));
    }
  };

  const handlePostSubmit = ({ text, attachment }) => {
    const isManager = ['manager', 'admin'].includes(user?.role);

    const newPost = {
      id: Date.now(),
      author: { name: user?.userName || "Tôi", avatar: user?.profilePicture },
      time: "Vừa xong",
      status: isManager ? 'approved' : 'pending',
      content: <p className="text-gray-700">{text}</p>,
      image: attachment?.type === 'image' ? attachment.url : null,
      file: attachment?.type === 'file' ? attachment : null,
      likes: 0,
      isLiked: false,
      comments: []
    };

    setPosts([newPost, ...posts]);
  };

  const handleApprove = (postId) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, status: 'approved' } : post));
  };

  const handleReject = (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối bài viết này?")) {
        setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleEdit = (postId, newContent) => {
    setPosts(posts.map(post => {
        if (post.id === postId) {
            return {
                ...post,
                content: <p className="text-gray-700">{newContent}</p>
            };
        }
        return post;
    }));
  };

  const handleDelete = (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        setPosts(posts.filter(post => post.id !== postId));
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Post Section */}
      <CreatePost user={user} onSubmit={handlePostSubmit} />

      {/* Filter Bar */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold text-gray-700">Bài viết ({posts.length})</h3>
        <div className="relative">
            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border-none bg-white text-gray-600 font-medium focus:ring-0 cursor-pointer py-1.5 pl-3 pr-8 rounded-lg shadow-sm hover:bg-gray-50 transition appearance-none"
            >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến nhất</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      {/* Posts List */}
      {sortedPosts.map(post => (
        <Post 
          key={post.id} 
          post={post} 
          onLike={handleLike} 
          onComment={handleComment} 
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteComment={handleDeleteComment}
          currentUser={user}
        />
      ))}
    </div>
  );
};

export default EventFeed;