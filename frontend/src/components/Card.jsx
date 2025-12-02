import { motion } from "framer-motion";
import { createElement } from "react";

export default function Card({ icon, title, description, src }) {
  return (
    <motion.div
      className="card h-full p-6 hover:shadow-lg transition-all duration-300 border-primary-100"
      whileHover={{ translateY: -4 }}
      transition={{ type: "tween", duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-content-center rounded-2xl bg-primary-50 text-primary-600">
          {createElement(icon, { className: "h-5 w-5" })}
        </div>
        <h2 className="heading-3">{title}</h2>
      </div>
      {src ? (
        <img src={src} alt={title} className="mt-4 h-48 w-full rounded-2xl object-cover" />
      ) : null}
      <p className="mt-4 text-body">{description}</p>
    </motion.div>
  );
}
