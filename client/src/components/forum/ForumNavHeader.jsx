import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, HelpCircle, Coins, Bell, Plus, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { forumService } from '../../services/forumService';
import Button from '../common/Button';
import { cn } from '../../utils/cn';

const ForumNavHeader = ({ onAskClick }) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      forumService.getNotifications({ limit: 1 })
        .then((res) => {
          setUnreadCount(res.data.unreadCount || 0);
        })
        .catch(() => { });
    }
  }, [isAuthenticated, location.pathname]);

  const navItems = [
    { to: '/forum', label: 'All Discussions', icon: MessageSquare, exact: true },
    ...(isAuthenticated
      ? [
        { to: '/forum/my-activity', label: 'My Activity', icon: HelpCircle },
        { to: '/forum/wallet', label: 'Forum Coins', icon: Coins },
        {
          to: '/forum/notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
        },
      ]
      : []),
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 mb-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Navigation tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-xs'
                  : 'text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-none',
                  isActive ? 'bg-white text-[#06B6D4]' : 'bg-rose-500 text-white'
                )}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Right side: Coins badge & Ask Question button */}
      <div className="flex items-center gap-2.5 justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        {isAuthenticated && (
          <div
            onClick={() => navigate('/forum/wallet')}
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-amber-100/60 transition-colors"
            title="View Forum Coins"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">Forum Coins</span>
          </div>
        )}

        {isAuthenticated && onAskClick && (
          <Button
            size="sm"
            onClick={onAskClick}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-xs"
          >
            Ask Question
          </Button>
        )}
      </div>
    </div>
  );
};

export default ForumNavHeader;
