import { motion } from "framer-motion";
import { createElement } from "react";

export default function Card({ icon, title, description, src }) {
  return (
    <motion.div
      className="h-full rounded-3xl border border-brand-primary/10 bg-surface-base/90 p-6 shadow-md shadow-brand-primary/10 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-primary/20"
      whileHover={{ translateY: -4 }}
      transition={{ type: "tween", duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-content-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          {createElement(icon, { className: "h-5 w-5" })}
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      {src ? (
        <img src={src} alt={title} className="mt-4 h-45  w-full rounded-2xl object-cover" />
      ) : null}
      <p className="mt-4 text-sm text-slate-600 sm:text-base">{description}</p>
    </motion.div>
  );
}
