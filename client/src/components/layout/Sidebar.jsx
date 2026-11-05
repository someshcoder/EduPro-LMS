import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Shield, Wallet, BarChart3, LogOut,
  GraduationCap, ChevronLeft, Video, CreditCard, AlertTriangle, UserCheck,
  Receipt, Award, Gift, MessageSquare
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

const userNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/forum', icon: MessageSquare, label: 'Forum' },
  { to: '/affiliate', icon: Users, label: 'Affiliate' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/invoices', icon: Receipt, label: 'Invoices & Receipts' },
  { to: '/profile', icon: UserCheck, label: 'Profile & KYC' },
];

const adminNavItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/forum', icon: MessageSquare, label: 'Forum Management' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics & Profit' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/kyc', icon: UserCheck, label: 'KYC Review' },
  { to: '/admin/packages', icon: BookOpen, label: 'Packages' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/payouts', icon: CreditCard, label: 'Payouts' },
  { to: '/admin/invoice-settings', icon: Receipt, label: 'GST & Invoices' },
  { to: '/admin/certificate-settings', icon: Award, label: 'Certificate Manager' },
  { to: '/admin/sessions', icon: Shield, label: 'Sessions' },
  { to: '/admin/fraud-alerts', icon: AlertTriangle, label: 'Fraud Alerts' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-full bg-white border-r border-[#E2E8F0] z-30 flex flex-col overflow-hidden shadow-xs"
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-3 px-4 py-4 border-b border-[#F1F5F9] min-h-[72px] hover:bg-slate-50/70 transition-colors group cursor-pointer"
        title="CourseEarn - Go to Home"
      >
        <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5 group-hover:scale-105 transition-transform">
          <img src="/logo.jpg" alt="CourseEarn Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="font-bold text-[#1E293B] text-sm leading-none">CourseEarn</p>
            <p className="text-xs text-[#06B6D4] font-semibold leading-none mt-1">Learning Platform</p>
          </motion.div>
        )}
      </Link>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#64748B] hover:text-[#06B6D4] transition-colors z-10 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform duration-300', collapsed && 'rotate-180')} />
      </button>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-widest px-3 mb-2">
            {user?.role === 'admin' ? 'Admin Controls' : 'Navigation'}
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold',
                isActive
                  ? 'bg-gradient-to-r from-cyan-50 to-purple-50 text-[#06B6D4] border border-cyan-200/60 shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#06B6D4]' : 'text-[#64748B]')} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-[#F1F5F9]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-[#E2E8F0] mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1E293B] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#06B6D4] font-semibold truncate capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
