import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

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
};

export default MainLayout;
