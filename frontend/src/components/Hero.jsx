import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hd1.png'; // Đảm bảo bạn có ảnh nền phù hợp

const Hero = ({ user, openAuth }) => {
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      className="relative flex items-center justify-center h-svh w-full"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Container này giữ cho content không bị quá rộng */}
      <motion.div
        className="w-full max-w-4xl text-center flex flex-col items-center"
        variants={contentVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight"
          transition={{ delay: 0.5, duration: 1 }} 
        >
          Hãy tham gia cùng chúng tôi để tạo nên những đổi thay.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-4 text-lg text-gray-200 max-w-2xl"
        >
          Nơi mỗi đóng góp nhỏ đều được trân trọng và tạo ra tác động lớn lao cho cộng đồng.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-4">
          {user ? (
            <Link
              to="/information"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#FFC107] hover:from-[#E08B3E] hover:to-[#FFB300] hover:shadow-2xl hover:shadow-orange-300/50 active:scale-95 text-white px-6 py-3 text-base font-semibold transition-all shadow-lg"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={() => openAuth('register')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#FFC107] hover:from-[#E08B3E] hover:to-[#FFB300] hover:shadow-2xl hover:shadow-orange-300/50 active:scale-95 text-white px-6 py-3 text-base font-semibold transition-all shadow-lg"
              >
                Join now
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => openAuth('login')}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-transparent px-6 py-3 text-base font-semibold text-white hover:bg-white hover:text-slate-900 active:scale-95 transition-all"
              >
                I already volunteer
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;