/** @format */

import React from "react";
import { MessageSquare, Info, Users, Image } from "lucide-react";

const EventTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "discussion", label: "Thảo luận", icon: MessageSquare },
    { id: "about", label: "Giới thiệu", icon: Info },
    { id: "members", label: "Thành viên", icon: Users },
    { id: "media", label: "Ảnh/File", icon: Image },
  ];

  return (
    <div className='bg-gray-50 border-b border-gray-200 sticky top-0 z-20'>
      <div className='max-w-6xl mx-auto px-4 lg:px-8'>
        <div className='flex items-center gap-2 py-2 overflow-x-auto no-scrollbar'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                }`}>
                <Icon className='w-4 h-4' />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventTabs;
