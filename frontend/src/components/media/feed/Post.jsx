import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, XCircle, FileText, Download, Edit2, Trash2, Flag } from 'lucide-react';
import Comment from './Comment';

const Post = ({ post, onLike, onComment, onApprove, onReject, onEdit, onDelete, onDeleteComment, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const isManager = ['manager', 'admin'].includes(currentUser?.role);
  const isAuthor = currentUser?.userName === post.author.name;
  const canModerate = isManager;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isManager;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
  };

  const startEdit = () => {
    // Extract text content from React element if possible, or just use empty string
    // This is a simplification since content is a React node in the mock data
    let initialText = "";
    if (typeof post.content === 'string') {
        initialText = post.content;
    } else if (post.content?.props?.children) {
        // Try to grab text from simple p tag structure
        initialText = post.content.props.children;
        if (Array.isArray(initialText)) initialText = initialText.join(" ");
    }
    
    setEditContent(initialText);
    setIsEditing(true);
    setShowMenu(false);
  };

  const saveEdit = () => {
    onEdit(post.id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
            <img 
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} 
              alt={post.author.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{post.author.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{post.time}</span>
              {post.status === 'pending' && (
                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                  Chờ duyệt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu / Moderation */}
        <div className="flex items-center gap-2">
          {post.status === 'pending' && canModerate && (
            <div className="flex gap-1 mr-2">
              <button 
                onClick={() => onApprove(post.id)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition"
                title="Duyệt bài"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onReject(post.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition"
                title="Từ chối"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
                {canEdit && (
                  <button 
                    onClick={startEdit}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={() => { onDelete(post.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa bài viết
                  </button>
                )}
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { alert("Đã báo cáo bài viết!"); setShowMenu(false); }}
                >
                  <Flag className="w-4 h-4" /> Báo cáo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button 
                onClick={saveEdit}
                className="px-3 py-1.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
              >
                Lưu
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-800 whitespace-pre-wrap">
            {post.content}
          </div>
        )}
      </div>

      {/* Attachments */}
      {post.image && (
        <div className="w-full h-64 sm:h-80 bg-gray-100 cursor-pointer overflow-hidden">
          <img src={post.image} alt="Post attachment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      
      {post.file && (
        <div className="px-4 pb-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.file.name}</p>
                    <p className="text-xs text-gray-500">{(post.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <a 
                    href={post.file.url} 
                    download={post.file.name}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                    title="Tải xuống"
                >
                    <Download className="w-5 h-5" />
                </a>
            </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${
              post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
            {post.likes > 0 && <span>{post.likes}</span>}
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            {post.comments.length > 0 && <span>{post.comments.length}</span>}
          </button>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50/50 border-t border-gray-100 p-4">
          {/* Comment List */}
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
            {post.comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-2">Chưa có bình luận nào.</p>
            ) : (
                post.comments.map(comment => (
                    <Comment 
                        key={comment.id} 
                        comment={comment} 
                        currentUser={currentUser}
                        onDelete={(commentId) => onDeleteComment(post.id, commentId)}
                    />
                ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
                <img 
                    src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.userName || 'User'}&background=random`} 
                    alt="My Avatar" 
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                />
                <button 
                    type="submit"
                    disabled={!commentText.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-brand-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition"
                >
                    <svg className="w-3 h-3 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;
