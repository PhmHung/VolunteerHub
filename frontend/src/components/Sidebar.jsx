import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import React from "react";

export default function Sidebar({ PAGES, active }) {
  return (
    <motion.aside
      key="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: "tween", duration: 0, ease: "easeOut" }}
      className="md:sticky md:top-24 h-max"
    >
      <div className={`w-full text-base md:w-56 rounded-3xl border border-primary-200/60 bg-surface-50/70 backdrop-blur-xl shadow-xl shadow-primary-200/20`}>
        <div className="p-3 sm:p-4">
          <nav className="mt-3 sm:mt-4 flex flex-col gap-2">
            {PAGES.map((p) => {
              const { key, icon: Icon, path } = p;
              const selected = key === active;
              return (
                <Link key={key} to={path}>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={[
                      "group w-full text-left rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 border transition",
                      selected
                        ? "border-primary-600/60 bg-gradient-to-r from-primary-200/70 via-primary-200/80 to-primary-200/70 shadow-lg shadow-primary-300/20"
                        : "border-white/50 bg-surface-white/60 hover:border-primary-200/60 hover:bg-surface-white/80",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "grid place-content-center rounded-2xl p-2 border",
                          selected
                            ? "border-primary-600/60 bg-surface-white/70 text-primary-600"
                            : "border-border bg-surface-white/60 group-hover:border-primary-200/60 text-text-secondary",
                        ].join(" ")}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold tracking-wide text-text-main">{key}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </motion.aside>
  );
}
