import React, { useState, useRef } from 'react';
import { Send, Image, Paperclip, X, FileText } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Kênh thảo luận đang hoạt động
          </h3>
      </div>
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-100">
           <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.userName || 'User'}&background=random`} alt="User" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="relative mb-3">
              <input 
                type="text" 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={`Viết gì đó cho các thành viên trong nhóm, ${user?.userName || 'bạn'} ơi...`}
                className="w-full bg-gray-100 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition placeholder-gray-500"
              />
              <button 
                onClick={handleSubmit}
                disabled={!newPostText.trim() && !attachment}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-full transition disabled:opacity-50 disabled:hover:bg-transparent"
              >
                  <Send className="w-4 h-4" />
              </button>
          </div>

          {/* Attachment Preview */}
          {attachment && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100 w-fit animate-in fade-in zoom-in duration-200">
                  {attachment.type === 'image' ? (
                    <div className="w-8 h-8 rounded overflow-hidden">
                        <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-blue-700 max-w-[200px] truncate">{attachment.name}</span>
                    {attachment.type === 'file' && <span className="text-[10px] text-blue-500">{attachment.size}</span>}
                  </div>
                  <button onClick={() => setAttachment(null)} className="p-1 hover:bg-blue-100 rounded-full text-blue-500 ml-2">
                      <X className="w-3 h-3" />
                  </button>
              </div>
          )}

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
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" 
            className="hidden" 
            onChange={(e) => handleFileSelect(e, 'file')}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
              <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium transition"
              >
                  <Image className="w-4 h-4 text-green-600" />
                  <span>Ảnh/Video</span>
              </button>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium transition"
              >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span>Tệp đính kèm</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;