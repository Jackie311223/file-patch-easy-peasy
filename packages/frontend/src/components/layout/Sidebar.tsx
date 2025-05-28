import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  BuildingOffice2Icon as OfficeBuildingIcon, // Renamed for v2
  CreditCardIcon, 
  DocumentChartBarIcon as DocumentReportIcon, // Renamed for v2
  InboxIcon, 
  Cog6ToothIcon as CogIcon, // Renamed for v2
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon, 
  XMarkIcon as XIcon // Renamed for v2
} from '@heroicons/react/24/outline'; // Updated import path for v2 outline icons

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isMobile }) => {
  // Navigation items with icons according to design spec
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Bookings', path: '/bookings', icon: BookOpenIcon },
    { name: 'Properties', path: '/properties', icon: OfficeBuildingIcon },
    { name: 'Payments', path: '/payments', icon: CreditCardIcon },
    { name: 'Reports', path: '/reports', icon: DocumentReportIcon },
    { name: 'Inbox', path: '/inbox', icon: InboxIcon },
    { name: 'Settings', path: '/settings', icon: CogIcon },
  ];

  // Classes for active and inactive states based on design tokens
  const activeClassName = "bg-primary/10 text-primary font-medium";
  const inactiveClassName = "text-text-secondary hover:bg-background-subtle hover:text-text transition-colors duration-200";
  const baseLinkClasses = "flex items-center text-body-md rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30";

  // Dynamic classes based on open/closed state and mobile/desktop
  const sidebarWidthClass = isOpen ? (isMobile ? 'w-64' : 'w-64') : (isMobile ? 'w-0' : 'w-20');
  const sidebarVisibilityClass = isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : '';
  const sidebarPositionClass = isMobile ? 'fixed inset-y-0 left-0 z-40 shadow-lg' : 'relative';

  return (
    <aside
      className={`flex flex-col h-screen bg-background border-r border-background-muted transition-all duration-300 ease-in-out ${sidebarWidthClass} ${sidebarPositionClass} ${sidebarVisibilityClass}`}
      aria-label="Main Navigation"
    >
      {/* Header Area with Logo and Toggle */}
      <div className={`flex items-center justify-between h-16 border-b border-background-muted flex-shrink-0 ${!isOpen && !isMobile ? 'px-md' : 'px-lg'}`}>
        {isOpen && (
          <div className="flex items-center">
            <span className="text-h3 font-bold text-primary">Roomrise</span>
          </div>
        )}
        
        {/* Toggle Button - different for mobile/desktop */} 
        {isMobile ? (
          // Close button for mobile overlay
          <button
            onClick={() => setIsOpen(false)}
            className="p-sm rounded-md text-text-secondary hover:bg-background-subtle hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <XIcon className="h-6 w-6" />
          </button>
        ) : (
          // Collapse/Expand button for desktop
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-sm rounded-md text-text-secondary hover:bg-background-subtle hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow mt-xl space-y-sm px-md overflow-y-auto scrollbar-thin scrollbar-thumb-background-muted" aria-label="Sidebar Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if (isMobile) setIsOpen(false); }}
              className={({ isActive }) =>
                `${baseLinkClasses} ${!isOpen && !isMobile ? 'justify-center h-12 w-12 mx-auto' : 'px-lg py-md'} ${isActive ? activeClassName : inactiveClassName}`
              }
              title={!isOpen ? item.name : undefined}
            >
              <Icon className={`flex-shrink-0 h-5 w-5 ${isOpen ? 'mr-md' : ''}`} aria-hidden="true" />
              {isOpen && <span className="flex-1 whitespace-nowrap">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area with User Profile Info */}
      <div className="mt-auto border-t border-background-muted py-md px-lg">
        {isOpen && (
          <div className="flex items-center text-body-sm text-text-secondary">
            <span>Roomrise PMS v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

