/** @format */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Tag as TagIcon, Fish } from "lucide-react";

// Component con: Con cá bơi nền (Trang trí)
const SwimmingFish = ({ direction = "right", delay = 0, top }) => {
  return (
    <motion.div
      initial={{ x: direction === "right" ? -100 : "100vw", opacity: 0 }}
      animate={{
        x: direction === "right" ? "100vw" : -100,
        opacity: [0, 0.4, 0.4, 0],
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
      className={`absolute pointer-events-none text-blue-200 ${top}`}
      style={{ scaleX: direction === "right" ? -1 : 1 }} // Lật cá
    >
      <Fish size={24 + Math.random() * 20} />
    </motion.div>
  );
};

const TagBubbleModal = ({
  isOpen,
  onClose,
  tags,
  selectedTag,
  onSelectTag,
}) => {
  const [localSelected, setLocalSelected] = useState(selectedTag);

  useEffect(() => {
    if (isOpen) setLocalSelected(selectedTag);
  }, [isOpen, selectedTag]);

  const handleConfirm = () => {
    onSelectTag(localSelected);
    onClose();
  };

  // Logic random vị trí và chuyển động cho bong bóng
  const getFloatingAnimation = (index) => ({
    y: [0, -10 - Math.random() * 10, 0],
    x: [0, Math.random() * 5 - 2.5, 0],
    transition: {
      duration: 3 + Math.random() * 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.1,
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className='bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden relative border border-blue-100'>
            {/* --- NỀN BỂ CÁ --- */}
            <div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
              <SwimmingFish direction='right' top='top-20' delay={0} />
              <SwimmingFish direction='left' top='top-40' delay={5} />
              <SwimmingFish direction='right' top='top-60' delay={2} />
              {/* Bọt khí */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute w-2 h-2 bg-white/40 rounded-full'
                  style={{ left: `${Math.random() * 100}%`, bottom: -10 }}
                  animate={{ y: -600, opacity: 0 }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>

            {/* Header */}
            <div className='p-5 border-b border-blue-100 flex justify-between items-center bg-white/50 backdrop-blur-md z-10'>
              <h3 className='text-xl font-bold text-blue-900 flex items-center gap-2'>
                <Search className='w-5 h-5 text-blue-500' />
                Khám phá chủ đề
              </h3>
              <button
                onClick={onClose}
                className='p-2 hover:bg-blue-100 rounded-full text-blue-600 transition'>
                <X size={20} />
              </button>
            </div>

            {/* Content: Bể Tag trôi nổi */}
            <div className='flex-1 p-6 overflow-y-auto z-10 min-h-[300px]'>
              <div className='flex flex-wrap justify-center gap-4 content-center h-full'>
                {/* Nút Tất cả */}
                <motion.button
                  onClick={() => setLocalSelected("all")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full font-bold shadow-md transition-all ${
                    localSelected === "all"
                      ? "bg-blue-600 text-white ring-4 ring-blue-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}>
                  Tất cả chủ đề
                </motion.button>

                {tags.map((tag, index) => {
                  const isSelected = localSelected === tag.id;
                  const sizeClass =
                    tag.count > 10
                      ? "text-lg px-6 py-3"
                      : tag.count > 5
                      ? "text-base px-5 py-2"
                      : "text-sm px-4 py-1.5";

                  return (
                    <motion.button
                      key={tag.id}
                      onClick={() => setLocalSelected(tag.id)}
                      animate={getFloatingAnimation(index)}
                      whileHover={{ scale: 1.1, zIndex: 50 }}
                      whileTap={{ scale: 0.9 }}
                      className={`rounded-full shadow-sm backdrop-blur-sm border transition-all flex items-center gap-2 ${sizeClass} ${
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-200 ring-4 ring-emerald-100"
                          : "bg-white/80 text-blue-800 border-blue-100 hover:bg-white hover:border-blue-300"
                      }`}>
                      {isSelected && <Check size={14} />}
                      {tag.text}
                      <span
                        className={`ml-1 text-[0.7em] px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20"
                            : "bg-blue-100 text-blue-600"
                        }`}>
                        {tag.count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className='p-5 border-t border-blue-100 bg-white/80 backdrop-blur-md z-10 flex justify-end gap-3'>
              <button
                onClick={onClose}
                className='px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition'>
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className='px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2'>
                <Check size={18} />
                Áp dụng bộ lọc
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TagBubbleModal;
