import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
// Landing navbar for unauthenticated users
import LandingNavbar from '../landing/Navbar';

/**
 * ForumLayout — wraps the Forum pages.
 * - Authenticated users get the full MainLayout (sidebar + top navbar).
 * - Guest users get a lightweight landing-style header.
 */
const ForumLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
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
  }

  // Guest view — simple header with landing-style navbar
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <LandingNavbar
        onOpenAuth={(tab) => navigate(`/${tab || 'login'}`)}
        onSearchClick={() => {}}
      />
      <main className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ForumLayout;

