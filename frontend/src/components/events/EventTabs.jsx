/** @format */

import React from "react";
import { MessageSquare, Info, Users, ImageIcon, Star } from "lucide-react";

const TABS_CONFIG = [
  {
    id: "discussion",
    label: "Thảo luận",
    icon: MessageSquare,
    badge: null,
  },
  // Tab Mới
  {
    id: "reviews",
    label: "Đánh giá",
    icon: Star,
    badge: null,
  },
  {
    id: "about",
    label: "Giới thiệu",
    icon: Info,
    badge: null,
  },
  {
    id: "members",
    label: "Thành viên",
    icon: Users,
    badge: null,
  },
  {
    id: "media",
    label: "Ảnh & File",
    icon: ImageIcon,
    badge: null,
  },
];

const EventTabs = ({ activeTab, setActiveTab, badgeCounts = {} }) => {
  return (
    <div className='bg-gray-50 border-b border-gray-200 sticky top-0 z-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <nav className='flex items-center gap-1 py-2 overflow-x-auto no-scrollbar'>
          {TABS_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = badgeCounts[tab.id] || tab.badge;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap relative
                  ${
                    isActive
                      ? "bg-white text-primary-600 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                  }`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary-600" : "text-gray-500"}`} />
                <span>{tab.label}</span>

                {count > 0 && (
                  <span className='absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full'>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default EventTabs;