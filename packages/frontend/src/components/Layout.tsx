import { useState, type ReactNode, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './layout/Sidebar';
import { 
  ChevronRightIcon, 
  BellIcon, 
  UserCircleIcon, 
  ArrowLeftOnRectangleIcon as LogoutIcon, // Renamed for v2
  Bars3Icon as MenuIcon // Renamed for v2
} from '@heroicons/react/24/outline'; // Updated import path for v2 outline icons

// --- Breadcrumb Generation (Keep the existing logic, ensure hash routing) ---
const generateBreadcrumbs = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== '#');
  const breadcrumbs = [{ name: 'Dashboard', path: '/#/dashboard' }];

  let currentPath = '/#';
  pathSegments.forEach((segment) => {
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    currentPath += `/${segment}`;
    if (segment.toLowerCase() !== 'dashboard') {
       breadcrumbs.push({ name, path: currentPath });
    }
  });

  if (breadcrumbs.length > 1 && breadcrumbs[0].name === breadcrumbs[1].name) {
    breadcrumbs.shift();
  }
  if (pathSegments.length === 0 && breadcrumbs.length > 0 && breadcrumbs[0].name === 'Dashboard') {
     // Keep dashboard
  } else if (pathSegments.length === 0) {
     breadcrumbs.splice(0, breadcrumbs.length, { name: 'Dashboard', path: '/#/dashboard' });
  }

  return breadcrumbs;
};
// --- End Breadcrumb Generation ---

const Layout = ({ children }: { children?: ReactNode }) => {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.hash || location.pathname);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Example breakpoint

  // Effect to handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Automatically close sidebar on switch to desktop if it was open on mobile
      // Or set default state based on screen size
      if (!mobile) {
        setIsSidebarOpen(true); // Default open on desktop
      } else {
        setIsSidebarOpen(false); // Default closed on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If no token (not logged in), render only the Outlet (for LoginPage)
  if (!token) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-background-subtle font-sans overflow-hidden">
      {/* Mobile Overlay for Sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {/* Top Bar */}
         <header className="bg-background shadow-sm p-lg h-16 flex items-center justify-between flex-shrink-0 z-20 border-b border-background-muted">
           <div className="flex items-center">
             {/* Mobile Sidebar Toggle */} 
             {isMobile && (
               <button
                 onClick={() => setIsSidebarOpen(true)}
                 className="mr-md p-sm rounded-md text-text-secondary hover:bg-background-subtle hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                 aria-label="Open sidebar"
               >
                 <MenuIcon className="h-6 w-6" />
               </button>
             )}
             {/* Breadcrumbs */}
             <nav className="hidden md:flex items-center text-sm text-text-secondary">
               {breadcrumbs.map((crumb, index) => (
                 <span key={crumb.path} className="flex items-center">
                   {index > 0 && <ChevronRightIcon className="w-4 h-4 mx-xs text-text-muted" />}
                   {index === breadcrumbs.length - 1 ? (
                     <span className="font-medium text-text">{crumb.name}</span>
                   ) : (
                     <Link to={crumb.path} className="hover:text-primary">{crumb.name}</Link>
                   )}
                 </span>
               ))}
             </nav>
           </div>

           {/* Right Side: Notifications & User Menu */}
           <div className="flex items-center space-x-lg">
             <button className="text-text-secondary hover:text-text">
               <BellIcon className="w-6 h-6" />
             </button>
             <div className="relative">
               <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-sm text-sm text-text hover:text-primary">
                 <UserCircleIcon className="w-8 h-8 text-text-muted" />
                 <span className='hidden sm:inline'>{user?.name ?? user?.email ?? 'Admin'}</span>
               </button>
               {isUserMenuOpen && (
                 <div className="absolute right-0 mt-xs w-48 bg-background rounded-md shadow-lg py-xs z-30 border border-background-muted">
                   <button
                     onClick={() => { logout(); setIsUserMenuOpen(false); }}
                     className="w-full flex items-center px-md py-sm text-sm text-text hover:bg-background-subtle text-left"
                   >
                     <LogoutIcon className="w-5 h-5 mr-sm text-error" />
                     Logout
                   </button>
                 </div>
               )}
             </div>
           </div>
         </header>
         {/* End Top Bar */}

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-subtle p-lg">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;

