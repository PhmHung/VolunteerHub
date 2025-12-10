/** @format */

import React from "react";
import { Globe, ShieldCheck, Tag, ChevronRight } from "lucide-react";

const EventSidebar = ({ event }) => {
  return (
    <div className='space-y-4'>
      {/* About Card */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <h3 className='font-bold text-gray-900 mb-3 text-lg'>Giới thiệu</h3>
        <p className='text-sm text-gray-600 mb-4 line-clamp-4 leading-relaxed'>
          {event.description}
        </p>

        <div className='space-y-4 border-t border-gray-100 pt-4'>
          <div className='flex items-start gap-3'>
            <Globe className='w-5 h-5 text-gray-800 mt-0.5' />
            <div>
              <p className='text-sm font-bold text-gray-900'>Công khai</p>
              <p className='text-xs text-gray-500'>
                Bất kỳ ai cũng có thể tìm thấy nhóm này.
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <ShieldCheck className='w-5 h-5 text-gray-800 mt-0.5' />
            <div>
              <p className='text-sm font-bold text-gray-900'>
                Sự kiện đã được xác thực
              </p>
              <p className='text-xs text-gray-500'>Bởi VolunteerHub Admin.</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <Tag className='w-5 h-5 text-gray-800 mt-0.5' />
            <div>
              <p className='text-sm font-bold text-gray-900 mb-2'>
                Hiển thị trên bảng tin Cộng đồng.
              </p>
              <div className='flex flex-wrap gap-2'>
                {event.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Preview Card */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-bold text-gray-900 text-lg'>File & Ảnh</h3>
          <button className='text-sm text-brand-primary hover:underline font-medium'>
            Xem tất cả
          </button>
        </div>
        <div className='grid grid-cols-3 gap-2 rounded-lg overflow-hidden'>
          {/* Mock images */}
          <div className='aspect-square bg-gray-100 overflow-hidden'>
            <img
              src='https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200'
              className='w-full h-full object-cover hover:scale-110 transition duration-300 cursor-pointer'
              alt=''
            />
          </div>
          <div className='aspect-square bg-gray-100 overflow-hidden'>
            <img
              src='https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200'
              className='w-full h-full object-cover hover:scale-110 transition duration-300 cursor-pointer'
              alt=''
            />
          </div>
          <div className='aspect-square bg-gray-100 overflow-hidden relative group cursor-pointer'>
            <img
              src='https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=200'
              className='w-full h-full object-cover group-hover:scale-110 transition duration-300'
              alt=''
            />
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-bold backdrop-blur-[1px] group-hover:bg-black/50 transition'>
              +12
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSidebar;
