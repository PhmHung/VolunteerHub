import { motion } from "framer-motion";
import { createElement } from "react";

export default function Card({ icon, title, description, src }) {
  return (
    <motion.div
      className="h-full rounded-3xl border border-[#A8D0E6]/70 bg-white/60 p-6 shadow-md shadow-blue-200/40 hover:shadow-lg hover:shadow-blue-300/50"
      whileHover={{ translateY: -4 }}
      transition={{ type: "tween", duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-content-center rounded-2xl bg-[#A8D0E6] text-[#005A9C]">
          {createElement(icon, { className: "h-5 w-5" })}
        </div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      </div>
      {src ? (
        <img src={src} alt={title} className="mt-4 h-45  w-full rounded-2xl object-cover" />
      ) : null}
      <p className="mt-4 text-base text-slate-600">{description}</p>
    </motion.div>
  );
}
