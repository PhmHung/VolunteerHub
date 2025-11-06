import { motion } from "framer-motion";

export default function CoreValuesSection({ coreValues }) {
  return (
    <motion.section
  className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/60 bg-white/80 p-8 text-center shadow-lg shadow-blue-200/30 sm:p-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Giá trị cốt lõi</h2>
      <p className="mt-3 text-base text-slate-600">
        Năm nguyên tắc dẫn lối cho mỗi quyết định và chương trình của VolunteerHub.
      </p>

  <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {coreValues.map(({ icon, title, description }) => {
          const IconComponent = icon;
          return (
            <motion.div
              key={title}
              className="flex h-full flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white/90 p-5 text-left shadow-md shadow-blue-100/40 sm:p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35 }}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A8D0E6]/30 to-[#005A9C]/10 text-[#005A9C]">
                <IconComponent className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
