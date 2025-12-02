import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';

const PromptModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  inputPlaceholder = "Nhập nội dung...",
  confirmText = "Gửi", 
  cancelText = "Hủy",
  defaultValue = ""
}) => {
  const [value, setValue] = useState(defaultValue);

  // Remove early return to allow AnimatePresence to work correctly
  // if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value);
      onClose();
      setValue(defaultValue); // Reset after confirm
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{message}</p>
              
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition min-h-[100px] text-sm mb-6 resize-none"
                autoFocus
              />
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!value.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromptModal;
