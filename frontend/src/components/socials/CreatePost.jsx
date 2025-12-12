import React, { useState, useRef } from 'react';
import { Send, Image, Paperclip, X, FileText, Smile } from 'lucide-react';

const CreatePost = ({ user, onSubmit }) => {
  const [newPostText, setNewPostText] = useState("");
  const [attachment, setAttachment] = useState(null); // { type: 'image' | 'file', url: string, name: string, fileObject: File }
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAttachment({
      type,
      url,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      fileObject: file
    });
    
    // Reset input so same file can be selected again if needed
    e.target.value = null;
  };

  const handleSubmit = () => {
    if (!newPostText.trim() && !attachment) return;
    
    onSubmit({
      text: newPostText,
      attachment
    });

    setNewPostText("");
    setAttachment(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-100">
           <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.userName || 'User'}&background=random`} alt="User" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
            <textarea 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                placeholder={`${user?.userName || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary-100 focus:bg-white transition placeholder-gray-500 resize-none min-h-[80px]"
            />
        </div>
      </div>

      {/* Attachment Preview */}
      {attachment && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-surface-50 rounded-xl border border-gray-200 w-full animate-in fade-in zoom-in duration-200 relative group">
              {attachment.type === 'image' ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 border border-gray-300">
                    <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{attachment.name}</span>
                {attachment.type === 'file' && <span className="text-xs text-gray-500">{attachment.size}</span>}
              </div>
              <button 
                onClick={() => setAttachment(null)} 
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                  <X className="w-4 h-4" />
              </button>
          </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
            <button 
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
                <Image className="w-5 h-5 text-green-500" />
                <span className="hidden sm:inline">Ảnh/Video</span>
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
                <Paperclip className="w-5 h-5 text-blue-500" />
                <span className="hidden sm:inline">Tệp đính kèm</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium">
                <Smile className="w-5 h-5 text-yellow-500" />
                <span className="hidden sm:inline">Cảm xúc</span>
            </button>
        </div>

        <button 
            onClick={handleSubmit}
            disabled={!newPostText.trim() && !attachment}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
            <Send className="w-4 h-4" />
            Đăng
        </button>
      </div>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={imageInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => handleFileSelect(e, 'image')}
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => handleFileSelect(e, 'file')}
      />
    </div>
  );
};

export default CreatePost;