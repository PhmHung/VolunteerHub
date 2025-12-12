import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const Comment = ({ comment, currentUser, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  
  const isAuthor = currentUser?.userName === comment.author.name;
  const canDelete = isAuthor || ['manager', 'admin'].includes(currentUser?.role);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="flex gap-2 group">
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
        <img 
          src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`} 
          alt={comment.author.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1">
        <div className="inline-block relative">
          <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
            <h5 className="font-semibold text-[13px] text-gray-900 hover:underline cursor-pointer">{comment.author.name}</h5>
            <p className="text-[15px] text-gray-900 break-words leading-snug">{comment.content}</p>
          </div>
          {/* Like badge on comment */}
          {likeCount > 0 && (
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 bg-white rounded-full shadow-sm border border-gray-100 px-1.5 py-0.5">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M2 21h4V9H2v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium">{likeCount}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 ml-3">
            <button 
              onClick={handleLike}
              className={`text-xs font-bold hover:underline cursor-pointer ${isLiked ? 'text-blue-600' : 'text-gray-500'}`}
            >
              Thích
            </button>
            <span className="text-xs font-bold text-gray-500 hover:underline cursor-pointer">Phản hồi</span>
            <span className="text-xs text-gray-400">{comment.time}</span>
            {canDelete && (
                <button 
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa bình luận"
                >
                  Xóa
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Comment;