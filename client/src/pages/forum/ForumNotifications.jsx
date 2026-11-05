import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, MessageSquare, Star, Coins, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { forumService } from '../../services/forumService';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import ForumNavHeader from '../../components/forum/ForumNavHeader';
import { cn } from '../../utils/cn';
import useAuthStore from '../../store/authStore';

const formatRelTime = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const TYPE_CONFIG = {
  new_answer: { icon: MessageSquare, color: 'text-[#06B6D4]', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  best_answer: { icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  coins_credited: { icon: Coins, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  question_status: { icon: AlertCircle, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-100' },
};

const ForumNotifications = () => {
  const { user } = useAuthStore();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await forumService.getNotifications({ limit: 30 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await forumService.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await forumService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <ForumNavHeader />
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#06B6D4]" />
            Forum Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-[#06B6D4] text-white rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">Stay updated on answers, best answer selections, and rewards.</p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleMarkAllRead}
            isLoading={isMarkingAll}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all read
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button size="sm" variant="danger" onClick={load} leftIcon={<RefreshCw className="w-4 h-4" />}>Retry</Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
          <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">No forum notifications yet.</p>
          <p className="text-[11px] text-[#94A3B8] mt-1">You'll be notified when someone answers your questions or your answer is selected as best.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.question_status;
            const Icon = config.icon;
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'group flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer',
                  n.isRead
                    ? 'bg-white border-[#E2E8F0] hover:border-cyan-200'
                    : 'bg-cyan-50/50 border-cyan-200 hover:border-[#06B6D4]'
                )}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg, 'border', config.border)}>
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', n.isRead ? 'text-[#64748B]' : 'text-[#1E293B] font-medium')}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-[#94A3B8]">{formatRelTime(n.createdAt)}</span>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="text-[11px] font-medium text-[#06B6D4] hover:text-cyan-700 flex items-center gap-0.5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[#06B6D4] flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ForumNotifications;

