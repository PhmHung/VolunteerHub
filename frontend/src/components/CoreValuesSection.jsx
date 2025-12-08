import { motion } from "framer-motion";

export default function CoreValuesSection({ coreValues }) {
  return (
    <motion.section
  className="mx-auto w-full max-w-6xl rounded-3xl border border-border/60 bg-surface-white/80 p-8 text-center shadow-lg shadow-primary-200/30 sm:p-10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-text-main sm:text-4xl">Giá trị cốt lõi</h2>
      <p className="mt-3 text-base text-text-secondary">
        Năm nguyên tắc dẫn lối cho mỗi quyết định và chương trình của VolunteerHub.
      </p>

  <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {coreValues.map(({ icon, title, description }) => {
          const IconComponent = icon;
          return (
            <motion.div
              key={title}
              className="flex h-full flex-col items-start gap-4 rounded-2xl border border-border bg-surface-white/90 p-5 text-left shadow-md shadow-primary-100/40 sm:p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35 }}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200/30 to-primary-600/10 text-primary-600">
                <IconComponent className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-text-main">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
