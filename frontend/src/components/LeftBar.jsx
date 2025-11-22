import React from 'react';
import { 
    FriendsIcon, GroupsIcon, MarketplaceIcon, WatchIcon, MemoriesIcon, AppLogoIcon
} from './Icons';

const mainNavItems = [
  { icon: <FriendsIcon />, label: 'Friends' },
  { icon: <GroupsIcon />, label: 'Groups' },
  { icon: <MarketplaceIcon />, label: 'Marketplace' },
  { icon: <WatchIcon />, label: 'Watch' },
  { icon: <MemoriesIcon />, label: 'Memories' },
];

const NavItem = ({ icon, label }) => (
  <a href="#" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
    <span className="w-8 h-8 flex items-center justify-center">{icon}</span>
    <span className="ml-4 font-semibold text-sm">{label}</span>
  </a>
);

const Section = ({ title, items }) => (
  <div>
    {title && <h3 className="px-2 pt-4 pb-2 text-lg font-bold text-gray-600">{title}</h3>}
    <nav className="flex flex-col space-y-1">
      {items.map((item) => (
        <NavItem key={item.label} {...item} />
      ))}
    </nav>
  </div>
);

const AppLogo = () => (
    <div className="flex items-center p-2 mb-5">
        <AppLogoIcon />
        <span className="ml-3 font-bold text-xl text-blue-700">SociaLite</span>
    </div>
);


const LeftSidebar = () => {
  return (
    <aside className="w-64 lg:w-80 bg-white h-screen shadow-lg hidden md:block">
      <div className="p-4 h-full">
        <AppLogo />
        <Section items={mainNavItems} />
      </div>
    </aside>
  );
};

export default LeftSidebar;