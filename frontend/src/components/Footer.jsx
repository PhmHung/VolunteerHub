import React from 'react';
// Import các icon bạn cần từ lucide-react
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        
        {/* === PHẦN NỘI DUNG CHÍNH (GRID) === */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Cột 1: Logo và Giới thiệu */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">VolunteerHub</h3>
            <p className="text-slate-400 max-w-sm">
              Kết nối những trái tim nhân ái với các tổ chức uy tín, cùng nhau tạo nên sự thay đổi tích cực cho cộng đồng.
            </p>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div>
            <h4 className="font-semibold text-white mb-4">Về chúng tôi</h4>
            <ul className="space-y-3">
              <li><a href="/about" className="hover:text-white transition-colors">Sứ mệnh</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Tin tức & Blog</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Cột 3: Dành cho Tình nguyện viên */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tình nguyện viên</h4>
            <ul className="space-y-3">
              <li><a href="/search" className="hover:text-white transition-colors">Tìm cơ hội</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Đăng nhập</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Đăng ký</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Hồ sơ của tôi</a></li>
            </ul>
          </div>

          {/* Cột 4: Dành cho Tổ chức */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tổ chức</h4>
            <ul className="space-y-3">
              <li><a href="/organizations/new" className="hover:text-white transition-colors">Đăng tin tuyển</a></li>
              <li><a href="/organizations/guide" className="hover:text-white transition-colors">Hướng dẫn</a></li>
              <li><a href="/partners" className="hover:text-white transition-colors">Đối tác</a></li>
            </ul>
          </div>

        </div>

        {/* === PHẦN CUỐI CÙNG (BẢN QUYỀN & MẠNG XÃ HỘI) === */}
        {/* Thêm pt-8 (padding-top) để thay thế khoảng đệm của phần newsletter đã bị xóa */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          
          {/* Bản quyền */}
          <p className="text-slate-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} VolunteerHub. Mọi quyền được bảo lưu.
          </p>
          
          {/* Mạng xã hội */}
          <div className="flex space-x-5">
            <a href="https://www.facebook.com/primo.ghostsoul.7" className="text-slate-500 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;