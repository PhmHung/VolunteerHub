import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AboutPillars({ pillars }) {
  return (
  <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
      {pillars.map(({ icon, title, tagline, description, highlights, accent }) => {
        const IconComponent = icon;
        return (
          <motion.article
            key={title}
            className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-blue-200/40 backdrop-blur sm:p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} aria-hidden />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/80 to-transparent shadow-inner">
                  <IconComponent className="h-6 w-6 text-[#005A9C]" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#005A9C]/60">
                    VolunteerHub Pillars
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
                </div>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#F4A261]">{tagline}</p>
              <p className="text-base leading-relaxed text-slate-600">{description}</p>

              <ul className="flex flex-col gap-3 rounded-2xl bg-[#F7FAFC]/80 p-4 text-sm text-slate-700">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F4A261]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.4em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>#TogetherWeGrow</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
