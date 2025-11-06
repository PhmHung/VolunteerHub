import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function ContactSection({ contactMethods, user, openAuth }) {
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-lg shadow-blue-200/20 sm:p-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
    >
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Liên hệ với chúng tôi</h2>
          <p className="mt-3 text-base text-slate-600">
            Đội ngũ Volunteer Hub luôn sẵn sàng đồng hành cùng bạn trong mọi sáng kiến dành cho cộng đồng.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {contactMethods.map(({ icon, label, value, href }) => {
              const IconComponent = icon;
              const content = (
                <div className="flex h-full items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FCE38A]/40 to-[#F38181]/20 text-[#005A9C]">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900 break-words">{value}</p>
                  </div>
                </div>
              );

              return href ? (
                <a
                  key={label}
                  href={href}
                  className="block h-full transition-transform hover:-translate-y-1"
                  target="_blank"
                  rel="noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div key={label} className="h-full transition-transform hover:-translate-y-1">
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-[#A8D0E6]/60 bg-[#F7FAFC]/90 p-6 shadow-md shadow-blue-100/30">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#005A9C]/10 text-[#005A9C]">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Kết nối cùng chuyên gia của chúng tôi</h3>
              <p className="text-sm text-slate-600">
                Đăng ký buổi tư vấn 1-1 để cùng xây dựng chương trình tình nguyện phù hợp.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Chia sẻ mong muốn của bạn, chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc với kế hoạch gợi ý và tài liệu cần thiết.
            </p>
            <p>
              Nếu đã có tài khoản, bạn có thể gửi yêu cầu trực tiếp tại trang hồ sơ cá nhân.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hello@volunteerhub.org"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-[#004A82] hover:to-[#0066B3] hover:shadow-2xl hover:shadow-blue-400/40"
            >
              Gửi email ngay
              <ArrowRight className="h-4 w-4" />
            </a>
            {!user && (
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#005A9C]/20 bg-white px-5 py-3 text-sm font-semibold text-[#005A9C] shadow-sm transition-all hover:border-[#005A9C]/40 hover:shadow-lg"
              >
                Tạo tài khoản
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
