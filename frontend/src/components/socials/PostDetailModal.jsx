/** @format */
import React from "react";
import { X, ThumbsUp, MessageCircle, Share2, Download, FileText } from "lucide-react";
import Comment from "./Comment";

const PostDetailModal = ({ post, currentUser, onClose, onLike, onComment, eventId }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 transition-opacity">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-[1010]"
      >
        <X size={24} />
      </button>

      <div className="flex w-full h-full md:h-[95vh] md:max-w-[1400px] bg-white md:rounded-lg overflow-hidden shadow-2xl">
        
        {/* MEDIA SECTION */}
        <div className="hidden md:flex flex-[2.5] bg-black items-center justify-center relative border-r border-gray-800">
          {post.image ? (
            <img src={post.image} className="max-w-full max-h-full object-contain" alt="media" />
          ) : post.file ? (
            <div className="text-white text-center">
              <FileText size={80} className="text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-6 px-4">{post.file.name}</p>
              <a href={post.file.url} download className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-2.5 rounded-lg transition">
                <Download size={18} /> Tải xuống
              </a>
            </div>
          ) : (
            <div className="text-gray-500 italic">Nội dung văn bản</div>
          )}
        </div>

        {/* CONTENT & COMMENTS SECTION */}
        <div className="flex-1 flex flex-col min-w-[360px] max-w-[450px] bg-white h-full">
          {/* Header */}
          <div className="p-4 flex items-center border-b">
            <img 
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}`} 
              className="w-10 h-10 rounded-full border border-gray-100 mr-3" 
              alt="avt" 
            />
            <div>
              <h4 className="font-bold text-[15px]">{post.author.name}</h4>
              <p className="text-[12px] text-gray-500">{post.time}</p>
            </div>
          </div>

          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 text-[15px] text-gray-900 leading-normal whitespace-pre-wrap">
              {post.content}
            </div>

            <div className="px-4 py-2 flex items-center justify-between text-[14px] text-gray-500 border-t border-gray-50 mt-4">
              <div className="flex items-center gap-1 text-blue-600 font-medium">
                {post.likes > 0 && <><ThumbsUp size={14} fill="currentColor" /> {post.likes}</>}
              </div>
              <div className="hover:underline cursor-pointer">{post.comments?.length || 0} bình luận</div>
            </div>

            <div className="mx-4 py-1 border-y border-gray-100 flex justify-around">
              <button onClick={() => onLike(post.id)} className={`flex-1 py-2 font-semibold text-[14px] flex justify-center gap-2 rounded-md hover:bg-gray-100 ${post.isLiked ? 'text-blue-600' : 'text-gray-600'}`}>
                <ThumbsUp size={18} className={post.isLiked ? "fill-current" : ""} /> Thích
              </button>
              <button className="flex-1 py-2 font-semibold text-[14px] text-gray-600 flex justify-center gap-2 rounded-md hover:bg-gray-100">
                <MessageCircle size={18} /> Bình luận
              </button>
              <button className="flex-1 py-2 font-semibold text-[14px] text-gray-600 flex justify-center gap-2 rounded-md hover:bg-gray-100">
                <Share2 size={18} /> Chia sẻ
              </button>
            </div>

            {/* DANH SÁCH BÌNH LUẬN */}
            <div className="p-4 space-y-4">
              {post.comments?.map((c) => (
                <Comment 
                  key={c.id} 
                  comment={c} 
                  postId={post.id} 
                  eventId={eventId} 
                  currentUser={currentUser} // Thay đổi từ user thành currentUser
                />
              ))}
            </div>
          </div>

          {/* Input footer */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <img 
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.userName}`} 
                className="w-8 h-8 rounded-full" 
                alt="me" 
              />
              <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                <input 
                  placeholder={`Bình luận dưới tên ${currentUser?.userName || 'người dùng'}...`}
                  className="w-full bg-transparent border-none text-[14px] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      onComment(post.id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;