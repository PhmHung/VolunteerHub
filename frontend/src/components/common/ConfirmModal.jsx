import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, HelpCircle } from 'lucide-react';

const icons = {
  danger: <AlertTriangle className="w-12 h-12 text-red-500" />,
  success: <CheckCircle className="w-12 h-12 text-emerald-500" />,
  info: <Info className="w-12 h-12 text-blue-500" />,
  question: <HelpCircle className="w-12 h-12 text-amber-500" />
};

const colors = {
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-300',
  success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300',
  info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300',
  question: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-300'
};

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Xác nhận", 
  cancelText = "Hủy",
  type = "question" 
}) => {
  // Remove early return to allow AnimatePresence to work correctly
  // if (!isOpen) return null; 

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
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-100' : type === 'success' ? 'bg-emerald-100' : type === 'info' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                  {icons[type]}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 mb-6">{message}</p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition focus:outline-none focus:ring-2 ${colors[type]}`}
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

export default ConfirmModal;
