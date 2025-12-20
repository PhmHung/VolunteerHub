import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, XCircle, FileText, Download, Edit2, Trash2, Flag, ThumbsUp } from 'lucide-react';
import Comment from './Comment';

const Post = ({ post, eventId, onLike, onComment, onApprove, onReject, onEdit, onDelete, onDeleteComment, currentUser, onOpenDetail }) => {
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

    const isLiked = post.reactions?.some(
      (r) => r.user?._id === currentUser._id
    );

  // Hàm helper để ngăn chặn sự kiện nổi bọt khi click vào các nút chức năng
  const handleAction = (e, callback) => {
    e.stopPropagation();
    callback();
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
    setShowComments(true);
  };

  const startEdit = () => {
    let initialText = "";
    if (typeof post.content === 'string') {
        initialText = post.content;
    } else if (post.content?.props?.children) {
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
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
      onClick={() => onOpenDetail(post)} // Mở modal khi click vào vùng trống bài viết
    >
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
            <h4 className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">{post.author.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="hover:underline cursor-pointer">{post.time}</span>
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
                onClick={(e) => handleAction(e, () => onApprove(post.id))}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition"
                title="Duyệt bài"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => handleAction(e, () => onReject(post.id))}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition"
                title="Từ chối"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={(e) => handleAction(e, () => setShowMenu(!showMenu))}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
                <>
                    <div className="fixed inset-0 z-10" onClick={(e) => handleAction(e, () => setShowMenu(false))}></div>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in duration-100">
                        {canEdit && (
                            <button 
                                onClick={(e) => handleAction(e, startEdit)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" /> Chỉnh sửa bài viết
                            </button>
                        )}
                        {canDelete && (
                            <button 
                                onClick={(e) => handleAction(e, () => { onDelete(post.id); setShowMenu(false); })}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Xóa bài viết
                            </button>
                        )}
                        {!isAuthor && (
                            <button 
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Flag className="w-4 h-4" /> Báo cáo bài viết
                            </button>
                        )}
                    </div>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {isEditing ? (
            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={saveEdit}
                        className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        ) : (
            <div className="text-gray-800 whitespace-pre-wrap mb-3 text-[15px] leading-relaxed">
                {typeof post.content === 'object' && post.content !== null ? post.content.text || JSON.stringify(post.content) : post.content}
            </div>
        )}
      </div>

      {/* Attachments - Image */}
      {post.image && (
        <div className="mb-3">
            <div className="w-full bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity">
                <img src={post.image} alt="" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
            </div>
        </div>
      )}

      {/* Attachments - File */}
      {post.file && (
        <div className="mb-3">
            <div className="mx-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between group hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{post.file.name}</p>
                        <p className="text-xs text-gray-500">{typeof post.file.size === 'number' ? (post.file.size / 1024).toFixed(2) + ' KB' : post.file.size}</p>
                    </div>
                </div>
                <a 
                    href={post.file.url} 
                    download={post.file.name}
                    onClick={(e) => e.stopPropagation()} // Chặn tải file không mở modal
                    className="p-2 text-gray-400 hover:text-gray-600 group-hover:bg-white rounded-full transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" />
                </a>
            </div>
        </div>
      )}

      {/* Stats - Facebook style */}
      {(post.likes > 0 || (post.comments?.length || 0) > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-[13px] text-gray-500">
          <div className="flex items-center gap-1.5">
              {post.likes > 0 && (
                  <>
                      <div className="flex -space-x-1">
                          <div className="w-[18px] h-[18px] bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                              <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                          </div>
                      </div>
                      <span className="hover:underline cursor-pointer">{post.likes}</span>
                  </>
              )}
          </div>
          <div className="flex gap-2">
              {(post.comments?.length || 0) > 0 && (
                  <span 
                      onClick={(e) => handleAction(e, () => setShowComments(!showComments))}
                      className="hover:underline cursor-pointer"
                  >
                      {post.comments.length} bình luận
                  </span>
              )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 border-t border-gray-200"></div>

      {/* Actions - Facebook style */}
      <div className="px-2 py-1 flex items-center">
<button
  onClick={(e) =>
    handleAction(e, () => onLike(post._id || post.id))
  }
  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
    isLiked || post.isLiked
      ? "text-blue-600"
      : "text-gray-600 hover:bg-gray-100"
  }`}
>
  <ThumbsUp
    className={`w-5 h-5 transition-transform duration-200 ${
      isLiked || post.isLiked
        ? "fill-current scale-110"
        : ""
    }`}
  />
  <span>Thích</span>
</button>

        <button 
            onClick={(e) => handleAction(e, () => setShowComments(!showComments))}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
            <MessageCircle className="w-5 h-5" />
            <span>Bình luận</span>
        </button>
      </div>

      {/* Comments Section - Facebook style */}
      {showComments && (
        <div className="px-4 pb-4 pt-2" onClick={(e) => e.stopPropagation()}>
            {/* Comment Input */}
            <div className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <img 
                        src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.userName || 'User'}&background=random`} 
                        alt={currentUser?.userName} 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <form onSubmit={handleCommentSubmit} className="flex-1 relative">
                    <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="w-full bg-gray-100 border-0 rounded-2xl py-2 pl-4 pr-10 text-sm focus:ring-0 focus:bg-gray-200 placeholder-gray-500 transition-colors"
                    />
                    {commentText.trim() && (
                        <button 
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors"
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    )}
                </form>
            </div>

            {/* Comment List */}
            {post.comments?.length > 0 && (
                <div className="space-y-3">
                    {post.comments.map(comment => (
  <Comment
    key={comment.id}
    comment={comment}
    postId={post.id}
    rootCommentId={comment._id}   // 👈 comment gốc
    eventId={eventId}
    currentUser={currentUser}
    onDelete={() => onDeleteComment(post.id, comment.id)}
  />
))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

const SendIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

export default Post;