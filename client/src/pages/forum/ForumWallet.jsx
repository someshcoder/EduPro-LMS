import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Coins, HelpCircle, Star, ArrowUpRight, RefreshCw, Clock, ChevronDown
} from 'lucide-react';
import { forumService } from '../../services/forumService';
import { WalletSkeleton } from '../../components/forum/ForumSkeleton';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import ForumNavHeader from '../../components/forum/ForumNavHeader';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

const ForumWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await forumService.getForumWallet();
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions || []);
    } catch {
      setError('Failed to load Forum Wallet data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (isLoading) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E293B]">Forum Coins Wallet</h1>
        <p className="text-[#64748B] text-sm mt-1">Track your Forum Coins earned from questions and best answers.</p>
      </div>
      <WalletSkeleton />
    </div>
  );

  if (error) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-[#1E293B]">Forum Coins Wallet</h1>
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
        <p className="text-rose-600 text-sm mb-4">{error}</p>
        <Button size="sm" variant="danger" onClick={load} leftIcon={<RefreshCw className="w-4 h-4" />}>Retry</Button>
      </div>
    </div>
  );

  const stats = [
    {
      label: 'Total Forum Coins',
      value: wallet?.totalForumCoins || 0,
      icon: Coins,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hint: 'All-time coins earned via forum',
    },
    {
      label: 'From Questions',
      value: wallet?.questionCoins || 0,
      icon: HelpCircle,
      color: 'text-[#06B6D4]',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      hint: `${wallet?.questionCount || 0} question${wallet?.questionCount !== 1 ? 's' : ''} posted`,
    },
    {
      label: 'From Best Answers',
      value: wallet?.bestAnswerCoins || 0,
      icon: Star,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hint: `${wallet?.bestAnswerCount || 0} best answer${wallet?.bestAnswerCount !== 1 ? 's' : ''}`,
    },
  ];

  return (
    <div className="space-y-6">
      <ForumNavHeader />
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-[#1E293B]">Forum Coins Wallet 🪙</h1>
        <p className="text-[#64748B] text-sm mt-1">Track your Forum Coins earned from questions and best answers.</p>
      </motion.div>

      {/* How to Earn */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-cyan-50 to-violet-50 border border-cyan-200 rounded-2xl p-4"
      >
        <p className="text-sm font-semibold text-[#1E293B] mb-2">How to Earn Forum Coins</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-[#06B6D4]">+10</span>
            Post a question
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">+25</span>
            Get selected as a Top 3 best answer
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white border ${s.border} rounded-2xl p-5 shadow-xs`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#1E293B]">
              {s.value} <span className="text-sm font-normal text-[#64748B]">coins</span>
            </p>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">{s.label}</p>
            <p className="text-[11px] text-[#94A3B8] mt-1">{s.hint}</p>
          </motion.div>
        ))}
      </div>

      {/* Transaction history */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#F1F5F9]">
          <h2 className="text-base font-bold text-[#1E293B]">Recent Transactions</h2>
          <span className="text-xs text-[#94A3B8]">Last 20 records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <Coins className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No forum coin transactions yet.</p>
            <p className="text-[11px] text-[#94A3B8] mt-1">Post your first question to earn coins!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th className="text-right">Coins</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id}>
                    <td className="text-xs text-[#94A3B8] whitespace-nowrap">{formatDate(txn.createdAt)}</td>
                    <td className="text-sm text-[#1E293B] max-w-xs">
                      <span className="line-clamp-1">{txn.description}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        txn.type === 'forum_question'
                          ? 'bg-cyan-50 text-[#06B6D4] border border-cyan-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {txn.type === 'forum_question' ? '❓ Question' : '⭐ Best Answer'}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="font-bold text-emerald-500 text-sm">+{txn.amount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForumWallet;

