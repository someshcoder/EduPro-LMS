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
  const navigate = useNavigate();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Navbar onMenuToggle={() => setCollapsed(!collapsed)} sidebarCollapsed={collapsed} />
        <main
          className="pt-20 min-h-screen transition-all duration-300 bg-[#F8FAFC]"
          style={{ paddingLeft: collapsed ? 72 : 260 }}
        >
          <div className="p-6 max-w-7xl mx-auto">
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

