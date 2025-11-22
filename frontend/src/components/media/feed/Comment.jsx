import React from 'react';
import { Trash2 } from 'lucide-react';

const Comment = ({ comment, currentUser, onDelete }) => {
  const isAuthor = currentUser?.userName === comment.author.name;
  const canDelete = isAuthor || ['manager', 'admin'].includes(currentUser?.role);

  return (
    <div className="flex gap-3 mt-3 group">
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
        <img 
          src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`} 
          alt={comment.author.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-2xl px-4 py-2 relative">
          <div className="flex items-center justify-between mb-1">
            <h5 className="font-bold text-xs text-gray-900">{comment.author.name}</h5>
            <span className="text-xs text-gray-500">{comment.time}</span>
          </div>
          <p className="text-sm text-gray-700 break-words">{comment.content}</p>
          
          {canDelete && (
            <button 
              onClick={() => onDelete(comment.id)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xóa bình luận"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;