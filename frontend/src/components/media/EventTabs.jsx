import React from 'react';
import { MessageSquare, Info, Users, Image } from 'lucide-react';

const EventTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'discussion', label: 'Thảo luận', icon: MessageSquare },
    { id: 'about', label: 'Giới thiệu', icon: Info },
    { id: 'members', label: 'Thành viên', icon: Users },
    { id: 'media', label: 'Ảnh/File', icon: Image },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 sm:px-0 text-sm font-medium border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-brand-primary text-brand-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
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