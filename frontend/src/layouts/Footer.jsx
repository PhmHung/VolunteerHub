/** @format */

import React from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    // Giảm padding trên dưới xuống còn py-8
    <footer className='border-t border-border bg-surface-50 text-text-secondary py-8'>
      <div className='mx-auto max-w-7xl px-4'>
        {/* Giảm khoảng cách các cột (gap-8) và margin bottom (mb-8) */}
        <div className='grid grid-cols-1 gap-8 mb-8 md:grid-cols-4 lg:grid-cols-5'>
          <div className='lg:col-span-2'>
            {/* Font chữ tiêu đề nhỏ hơn (text-lg) */}
            <h3 className='text-lg font-bold text-text-main mb-2'>
              VolunteerHub
            </h3>
            {/* Font chữ mô tả nhỏ hơn (text-xs) */}
            <p className='text-xs text-text-secondary max-w-xs leading-relaxed'>
              Kết nối những trái tim nhân ái với các tổ chức uy tín, cùng nhau
              tạo nên sự thay đổi tích cực cho cộng đồng.
            </p>
          </div>

          {/* Các cột link */}
          <div>
            <h4 className='font-semibold text-text-main text-sm mb-2'>
              Về chúng tôi
            </h4>
            {/* Giảm khoảng cách giữa các dòng (space-y-1.5) và dùng font text-xs */}
            <ul className='space-y-1.5 text-xs'>
              <li>
                <a
                  href='/about'
                  className='hover:text-primary-600 transition-colors'>
                  Sứ mệnh
                </a>
              </li>
              <li>
                <a
                  href='/blog'
                  className='hover:text-primary-600 transition-colors'>
                  Tin tức &amp; Blog
                </a>
              </li>
              <li>
                <a
                  href='/contact'
                  className='hover:text-primary-600 transition-colors'>
                  Liên hệ
                </a>
              </li>
              <li>
                <a
                  href='/faq'
                  className='hover:text-primary-600 transition-colors'>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-text-main text-sm mb-2'>
              Tình nguyện viên
            </h4>
            <ul className='space-y-1.5 text-xs'>
              <li>
                <a
                  href='/search'
                  className='hover:text-primary-600 transition-colors'>
                  Tìm cơ hội
                </a>
              </li>
              <li>
                <a
                  href='/login'
                  className='hover:text-primary-600 transition-colors'>
                  Đăng nhập
                </a>
              </li>
              <li>
                <a
                  href='/register'
                  className='hover:text-primary-600 transition-colors'>
                  Đăng ký
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-text-main text-sm mb-2'>
              Tổ chức
            </h4>
            <ul className='space-y-1.5 text-xs'>
              <li>
                <a
                  href='/organizations/new'
                  className='hover:text-primary-600 transition-colors'>
                  Đăng tin tuyển
                </a>
              </li>
              <li>
                <a
                  href='/organizations/guide'
                  className='hover:text-primary-600 transition-colors'>
                  Hướng dẫn
                </a>
              </li>
              <li>
                <a
                  href='/partners'
                  className='hover:text-primary-600 transition-colors'>
                  Đối tác
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom gọn hơn */}
        <div className='flex flex-col items-center justify-between gap-3 border-t border-border pt-4 text-xs md:flex-row'>
          <p className='text-text-muted'>
            © {new Date().getFullYear()} VolunteerHub. All rights reserved.
          </p>

          <div className='flex space-x-4 text-text-muted'>
            <a
              href='https://www.facebook.com/primo.ghostsoul.7'
              className='hover:text-primary-600 transition-colors'>
              <Facebook size={16} /> {/* Icon nhỏ hơn size 16 */}
            </a>
            <a href='#' className='hover:text-primary-600 transition-colors'>
              <Instagram size={16} />
            </a>
            <a href='#' className='hover:text-primary-600 transition-colors'>
              <Linkedin size={16} />
            </a>
            <a href='#' className='hover:text-primary-600 transition-colors'>
              <Youtube size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
