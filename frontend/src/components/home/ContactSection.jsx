import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function ContactSection({ contactMethods, user, openAuth }) {
  return (
    <motion.section
      className="mx-auto w-full max-w-6xl rounded-3xl border border-border/70 bg-surface-white/90 p-8 shadow-lg shadow-primary-200/20 sm:p-10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45 }}
    >
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-3xl font-bold text-text-main sm:text-4xl">Liên hệ với chúng tôi</h2>
          <p className="mt-3 text-base text-text-secondary">
            Đội ngũ Volunteer Hub luôn sẵn sàng đồng hành cùng bạn trong mọi sáng kiến dành cho cộng đồng.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {contactMethods.map(({ icon, label, value, href }) => {
              const IconComponent = icon;
              const content = (
                <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-surface-white/95 p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-warning-200/40 to-error-200/20 text-primary-600">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
                      {label}
                    </p>
                    <p className="mt-1 text-base font-medium text-text-main break-words">{value}</p>
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

        <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-primary-200/60 bg-surface-50/90 p-6 shadow-md shadow-primary-100/30">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-600/10 text-primary-600">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-text-main">Kết nối cùng chuyên gia của chúng tôi</h3>
              <p className="text-sm text-text-secondary">
                Đăng ký buổi tư vấn 1-1 để cùng xây dựng chương trình tình nguyện phù hợp.
              </p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
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
              className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:shadow-primary-400/40"
            >
              Gửi email ngay
              <ArrowRight className="h-4 w-4" />
            </a>
            {!user && (
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary-600/20 bg-surface-white px-5 py-3 text-sm font-semibold text-primary-600 shadow-sm transition-all hover:border-primary-600/40 hover:shadow-lg"
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
