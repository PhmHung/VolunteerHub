import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-surface-muted text-slate-600 pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-10 mb-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="font-heading text-2xl font-bold text-slate-950 mb-3">VolunteerHub</h3>
            <p className="text-slate-600 max-w-sm">
              Kết nối những trái tim nhân ái với các tổ chức uy tín, cùng nhau tạo nên sự thay đổi tích cực cho cộng đồng.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Về chúng tôi</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/about" className="transition-colors hover:text-brand-primary">Sứ mệnh</a></li>
              <li><a href="/blog" className="transition-colors hover:text-brand-primary">Tin tức &amp; Blog</a></li>
              <li><a href="/contact" className="transition-colors hover:text-brand-primary">Liên hệ</a></li>
              <li><a href="/faq" className="transition-colors hover:text-brand-primary">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Tình nguyện viên</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/search" className="transition-colors hover:text-brand-primary">Tìm cơ hội</a></li>
              <li><a href="/login" className="transition-colors hover:text-brand-primary">Đăng nhập</a></li>
              <li><a href="/register" className="transition-colors hover:text-brand-primary">Đăng ký</a></li>
              <li><a href="/profile" className="transition-colors hover:text-brand-primary">Hồ sơ của tôi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Tổ chức</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/organizations/new" className="transition-colors hover:text-brand-primary">Đăng tin tuyển</a></li>
              <li><a href="/organizations/guide" className="transition-colors hover:text-brand-primary">Hướng dẫn</a></li>
              <li><a href="/partners" className="transition-colors hover:text-brand-primary">Đối tác</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm md:flex-row">
          <p className="text-slate-500">© {new Date().getFullYear()} VolunteerHub. Mọi quyền được bảo lưu.</p>

          <div className="flex space-x-5 text-slate-500">
            <a href="https://www.facebook.com/primo.ghostsoul.7" className="transition-colors hover:text-brand-primary" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="transition-colors hover:text-brand-primary" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="transition-colors hover:text-brand-primary" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="transition-colors hover:text-brand-primary" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;