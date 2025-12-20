import React from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface-50 text-text-secondary py-5 text-xs">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-12">
          
          {/* PHẦN 1: THÔNG TIN & SOCIAL (Bên trái) */}
          <div className="md:w-1/3 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-text-main mb-2">VolunteerHub</h3>
              <p className="text-text-muted leading-relaxed mb-4 max-w-xs">
                Kết nối trái tim nhân ái, tạo nên thay đổi tích cực cho cộng đồng.
              </p>
            </div>
            
            {/* Đưa icon lên đây để tiết kiệm chiều cao footer */}
            <div className="flex gap-3">
              <SocialLink icon={<Facebook size={16} />} />
              <SocialLink icon={<Instagram size={16} />} />
              <SocialLink icon={<Linkedin size={16} />} />
              <SocialLink icon={<Youtube size={16} />} />
            </div>
          </div>

          {/* PHẦN 2: DANH SÁCH LINK (Bên phải - Gom gọn lại) */}
          <div className="md:w-2/3 grid grid-cols-3 gap-4">
            {/* Cột 1 */}
            <div>
              <h4 className="font-semibold text-text-main mb-2">Về chúng tôi</h4>
              <ul className="space-y-1">
                <FooterLink href="/about">Sứ mệnh</FooterLink>
                <FooterLink href="/blog">Tin tức</FooterLink>
                <FooterLink href="/contact">Liên hệ</FooterLink>
              </ul>
            </div>

            {/* Cột 2 */}
            <div>
              <h4 className="font-semibold text-text-main mb-2">Tình nguyện</h4>
              <ul className="space-y-1">
                <FooterLink href="/search">Tìm cơ hội</FooterLink>
                <FooterLink href="/login">Đăng nhập</FooterLink>
                <FooterLink href="/register">Đăng ký</FooterLink>
              </ul>
            </div>

            {/* Cột 3 */}
            <div>
              <h4 className="font-semibold text-text-main mb-2">Tổ chức</h4>
              <ul className="space-y-1">
                <FooterLink href="/org/new">Đăng tin</FooterLink>
                <FooterLink href="/org/guide">Hướng dẫn</FooterLink>
                <FooterLink href="/partners">Đối tác</FooterLink>
              </ul>
            </div>
          </div>
        </div>

        {/* PHẦN 3: COPYRIGHT (Chỉ 1 dòng mỏng ở dưới) */}
        <div className="mt-6 pt-3 border-t border-border text-center text-text-muted text-[10px] uppercase tracking-wide">
          © {new Date().getFullYear()} VolunteerHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// Component phụ để code gọn hơn
const FooterLink = ({ href, children }) => (
  <li>
    <a href={href} className="hover:text-primary-600 transition-colors block py-0.5">
      {children}
    </a>
  </li>
);

const SocialLink = ({ icon }) => (
  <a href="#" className="text-text-muted hover:text-primary-600 transition-colors bg-white p-1.5 rounded-full border border-border hover:border-primary-600">
    {icon}
  </a>
);

export default Footer;