import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Navbar
        onMenuToggle={() => {
          if (window.innerWidth < 1024) {
            setMobileOpen(!mobileOpen);
          } else {
            setCollapsed(!collapsed);
          }
        }}
        sidebarCollapsed={collapsed}
      />
      <main
        className={`pt-16 sm:pt-20 min-h-screen transition-all duration-300 bg-[#F8FAFC] ${
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        } pl-0`}
      >
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
