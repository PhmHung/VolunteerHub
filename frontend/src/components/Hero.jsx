// src/components/Hero.jsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import defaultHeroImage from "../assets/hd1.png";

const Hero = ({
  user,
  openAuth,
  heroImage = defaultHeroImage,       // fallback image
  title = "Hãy tham gia cùng chúng tôi để tạo nên những đổi thay.",
  subtitle = "Nơi mỗi đóng góp nhỏ đều được trân trọng và tạo ra tác động lớn lao cho cộng đồng.",
  primaryLabel = user ? "Go to dashboard" : "Join now",
  secondaryLabel = "I already volunteer",
  primaryAction,
  secondaryAction,
  showSecondary = true,
  contentAlign = "center",
}) => {
  const contentVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const handlePrimaryClick = () => {
    if (primaryAction) return primaryAction();
    if (user) return;                   // link button handles it
    openAuth?.("register");
  };

  const handleSecondaryClick = () => {
    if (secondaryAction) return secondaryAction();
    openAuth?.("login");
  };

  const alignmentMap = {
    left: {
      section: "md:justify-start",
      content: "md:items-start md:text-left md:ml-0 md:mr-auto",
      buttons: "md:justify-start",
    },
    right: {
      section: "md:justify-end",
      content: "md:items-end md:text-right md:ml-auto md:mr-0",
      buttons: "md:justify-end",
    },
    center: {
      section: "md:justify-center",
      content: "md:items-center md:text-center md:mx-auto",
      buttons: "md:justify-center",
    },
  };

  const alignment = alignmentMap[contentAlign] || alignmentMap.center;

  return (
    <section
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${alignment.section}`}
    >
      <img
        src={heroImage}
        alt="Volunteer hero background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      <motion.div
        className={`relative z-10 flex w-full max-w-4xl flex-col items-center text-center px-6 ${alignment.content}`}
        variants={contentVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
          {title}
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-4 text-lg text-gray-200 max-w-2xl">
          {subtitle}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className={`mt-8 flex flex-wrap justify-center gap-4 ${alignment.buttons}`}
        >
          {user ? (
            <Link
              to="/information"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#FFC107] hover:from-[#E08B3E] hover:to-[#FFB300] text-white px-6 py-3 text-base font-semibold transition-all shadow-lg hover:shadow-2xl hover:shadow-orange-300/50 active:scale-95"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={handlePrimaryClick}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#FFC107] hover:from-[#E08B3E] hover:to-[#FFB300] text-white px-6 py-3 text-base font-semibold transition-all shadow-lg hover:shadow-2xl hover:shadow-orange-300/50 active:scale-95"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {showSecondary && (
            <button
              onClick={handleSecondaryClick}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-transparent px-6 py-3 text-base font-semibold text-white hover:bg-white hover:text-slate-900 active:scale-95 transition-all"
            >
              {secondaryLabel}
            </button>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;