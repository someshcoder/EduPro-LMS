import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { forumService } from '../../services/forumService';

const Navbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      forumService.getNotifications({ limit: 1 })
        .then((res) => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-3 sm:px-6 py-3 bg-white/90 backdrop-blur-xl border-b border-[#E2E8F0] shadow-xs transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[276px]'
      } pl-3 sm:pl-4`}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 w-48 lg:w-64 focus-within:border-[#06B6D4] focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
          <Search className="w-4 h-4 text-[#64748B]" />
          <input
            id="navbar-search"
            name="q"
            type="text"
            placeholder="Search courses..."
            className="bg-transparent text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Wallet balance */}
        {user?.role !== 'admin' && (
          <div
            onClick={() => navigate('/wallet')}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#D1FAE5] border border-emerald-200/80 rounded-xl px-2 sm:px-3.5 py-1 sm:py-1.5 shadow-xs cursor-pointer hover:bg-emerald-100/60 transition-colors"
            title="View Wallet & Forum Coins"
          >
            <span className="hidden sm:inline text-xs text-[#065F46] font-medium">Balance:</span>
            <span className="text-xs sm:text-sm font-bold text-[#065F46]">
              ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Notifications (Users only) */}
        {user?.role !== 'admin' && (
          <button
            onClick={() => navigate('/forum/notifications')}
            className="relative p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Forum Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#06B6D4] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Avatar */}
        {user?.role === 'admin' ? (
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-cyan-500/20 select-none cursor-default"
            title={user?.name || 'Admin'}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        ) : (
          <div
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform"
            title="My Profile"
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
