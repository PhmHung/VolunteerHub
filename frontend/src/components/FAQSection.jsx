import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

export default function FAQSection({ faqs }) {
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl rounded-3xl border border-border/70 bg-surface-white/90 p-8 shadow-lg shadow-primary-200/20 sm:p-10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl">Câu hỏi thường gặp</h2>
          <p className="mt-2 text-base text-text-secondary">
            Tìm hiểu nhanh các thắc mắc phổ biến trước khi bạn bắt đầu hành trình tình nguyện.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 text-warning-600">
          <HelpCircle className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-8 space-y-4">
        {faqs.map(({ question, answer }) => (
          <motion.div
            key={question}
            className="rounded-3xl border border-border bg-surface-white/95 p-6 shadow-sm shadow-primary-100/30"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-text-main">{question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{answer}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
