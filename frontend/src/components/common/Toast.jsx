import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ id, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);

  const variants = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }
  };

  const styles = {
    success: { bg: 'bg-emerald-500', icon: <CheckCircle className="w-5 h-5" /> },
    error: { bg: 'bg-red-500', icon: <XCircle className="w-5 h-5" /> },
    info: { bg: 'bg-blue-500', icon: <Info className="w-5 h-5" /> },
    warning: { bg: 'bg-amber-500', icon: <AlertTriangle className="w-5 h-5" /> }
  };

  const style = styles[type] || styles.success;

  return (
    <motion.div
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md pointer-events-auto`}
    >
      <div className="flex-shrink-0 text-white/90">{style.icon}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onClose={removeToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
