import { Bell, Search, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user } = useAuthStore();

  return (
    <header
      className="fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50"
      style={{ paddingLeft: `${sidebarCollapsed ? 72 : 260}px` }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Wallet balance */}
        {user?.role !== 'admin' && (
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400">Balance:</span>
            <span className="text-sm font-bold text-emerald-400">
              ₹{(user?.walletBalance || 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-lg shadow-indigo-500/20">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
