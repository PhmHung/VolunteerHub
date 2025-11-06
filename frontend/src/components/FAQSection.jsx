import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

export default function FAQSection({ faqs }) {
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-lg shadow-blue-200/20 sm:p-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: 0.05 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Câu hỏi thường gặp</h2>
          <p className="mt-2 text-base text-slate-600">
            Tìm hiểu nhanh các thắc mắc phổ biến trước khi bạn bắt đầu hành trình tình nguyện.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F4A261]/20 text-[#F7770F]">
          <HelpCircle className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-8 space-y-4">
        {faqs.map(({ question, answer }) => (
          <motion.div
            key={question}
            className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-blue-100/30"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-slate-900">{question}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{answer}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
