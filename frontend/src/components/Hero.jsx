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
      className={`relative flex min-h-screen w-full items-center justify-center ${alignment.section}`}
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <motion.div
        className={`relative z-10 flex w-full max-w-4xl flex-col items-center text-center px-6 ${alignment.content}`}
        variants={contentVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={itemVariants} className="font-heading text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-white">
          {title}
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg">
          {subtitle}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className={`mt-8 flex flex-wrap justify-center gap-4 ${alignment.buttons}`}
        >
          {user ? (
            <Link
              to="/information"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-secondary via-brand-secondary to-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-brand-secondary/90 hover:to-brand-accent/90 hover:shadow-brand-secondary/40 active:scale-95 sm:text-base"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              onClick={handlePrimaryClick}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-secondary via-brand-secondary to-brand-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-brand-secondary/90 hover:to-brand-accent/90 hover:shadow-brand-secondary/40 active:scale-95 sm:text-base"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {showSecondary && (
            <button
              onClick={handleSecondaryClick}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-brand-primary active:scale-95 sm:text-base"
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