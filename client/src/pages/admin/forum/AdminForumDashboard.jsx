import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  History,
  Check,
  FileQuestion,
  Users,
} from 'lucide-react';
import { adminForumService } from '../../../services/adminForumService';
import AdminForumNavHeader from '../../../components/admin/forum/AdminForumNavHeader';
import Card, { CardBody, CardHeader } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

const AdminForumDashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminForumDashboardStats'],
    queryFn: async () => {
      const res = await adminForumService.getDashboardStats();
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <AdminForumNavHeader
          title="Forum Administration Dashboard"
          subtitle="Overview of forum health, discussions, moderation, and rewards"
          badge="Admin Suite"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <AdminForumNavHeader title="Forum Administration Dashboard" />
        <Card className="text-center p-12">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1E293B]">Failed to load forum analytics</h2>
          <p className="text-sm text-[#64748B] mt-2 mb-6">Could not retrieve statistics from database.</p>
          <Button onClick={() => refetch()} variant="primary">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const { stats, recentQuestions = [], recentReports = [], recentAuditLogs = [] } = data;

  const kpis = [
    {
      title: 'Total Discussions',
      value: stats.totalQuestions || 0,
      sub: `${stats.activeQuestions || 0} active • ${stats.hiddenQuestions || 0} hidden`,
      icon: MessageSquare,
      color: 'from-[#06B6D4] to-cyan-500',
      textColor: 'text-[#06B6D4]',
      bgLight: 'bg-cyan-50',
      link: '/admin/forum/questions',
    },
    {
      title: 'Solved Discussions',
      value: stats.solvedQuestions || 0,
      sub: `${stats.totalBestAnswers || 0} best answers published`,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      link: '/admin/forum/questions?solved=true',
    },
    {
      title: 'Unsolved / Open',
      value: stats.unsolvedQuestions || 0,
      sub: 'Awaiting admin best answer review',
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
      link: '/admin/forum/questions?solved=false',
    },
    {
      title: 'Total Answers',
      value: stats.totalAnswers || 0,
      sub: `${stats.hiddenAnswers || 0} hidden by moderators`,
      icon: Award,
      color: 'from-[#8B5CF6] to-purple-600',
      textColor: 'text-[#8B5CF6]',
      bgLight: 'bg-purple-50',
      link: '/admin/forum/questions',
    },
    {
      title: 'Coins Awarded',
      value: `${stats.totalCoinsAwarded || 0}`,
      sub: `${stats.bestAnswerCoins || 0} best ans • ${stats.questionCoins || 0} questions`,
      icon: Coins,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-600',
      bgLight: 'bg-cyan-50',
      link: '/admin/forum/rewards',
    },
    {
      title: 'Pending Content Reports',
      value: stats.pendingReports || 0,
      sub: stats.pendingReports > 0 ? 'Requires immediate action' : 'All clear',
      icon: ShieldAlert,
      color: stats.pendingReports > 0 ? 'from-rose-500 to-red-600' : 'from-slate-400 to-slate-500',
      textColor: stats.pendingReports > 0 ? 'text-rose-600' : 'text-slate-500',
      bgLight: stats.pendingReports > 0 ? 'bg-rose-50' : 'bg-slate-50',
      link: '/admin/forum/reports',
    },
    {
      title: 'Reviewed Reports',
      value: stats.reviewedReports || 0,
      sub: 'Action recorded in audit',
      icon: Check,
      color: 'from-teal-500 to-emerald-600',
      textColor: 'text-teal-600',
      bgLight: 'bg-teal-50',
      link: '/admin/forum/reports?status=reviewed',
    },
    {
      title: 'Archived Discussions',
      value: stats.archivedQuestions || 0,
      sub: 'Closed from new answers',
      icon: FileQuestion,
      color: 'from-slate-500 to-slate-600',
      textColor: 'text-slate-600',
      bgLight: 'bg-slate-100',
      link: '/admin/forum/questions?status=archived',
    },
    {
      title: 'Forum Participants',
      value: stats.totalParticipants || 0,
      sub: 'Students active in discussions',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      link: '/admin/forum/questions',
    },
    {
      title: 'Failed / Pending Rewards',
      value: stats.pendingFailedRewards || 0,
      sub: stats.pendingFailedRewards > 0 ? 'Requires retry' : 'All rewards disbursed',
      icon: AlertCircle,
      color: stats.pendingFailedRewards > 0 ? 'from-amber-500 to-red-600' : 'from-emerald-500 to-teal-600',
      textColor: stats.pendingFailedRewards > 0 ? 'text-amber-600' : 'text-emerald-600',
      bgLight: stats.pendingFailedRewards > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      link: '/admin/forum/rewards?status=failed',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <AdminForumNavHeader
        title="Forum Administration Dashboard"
        subtitle="Complete control over questions, answer review, Top 3 Best Answers selection, rewards, and reports"
        badge="Admin Suite"
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link to={card.link}>
                <Card className="border border-[#E2E8F0] hover:border-cyan-300 transition-all shadow-xs group cursor-pointer">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                          {card.title}
                        </p>
                        <h3 className="text-2xl font-bold text-[#1E293B] mt-2 group-hover:text-[#06B6D4] transition-colors">
                          {card.value}
                        </h3>
                        <p className="text-xs text-[#64748B] mt-1 font-medium">{card.sub}</p>
                      </div>
                      <div className={`p-3 rounded-2xl ${card.bgLight} ${card.textColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Discussions for Review & Moderation Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Questions for Review */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1E293B] text-base">Recent Discussions</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Review student discussions and select Top 3 Best Answers
                </p>
              </div>
              <Link
                to="/admin/forum/questions"
                className="text-xs font-semibold text-[#06B6D4] hover:text-[#0891B2] flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <div className="divide-y divide-[#F1F5F9]">
              {recentQuestions.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">No discussions posted yet.</div>
              ) : (
                recentQuestions.map((q) => (
                  <div
                    key={q._id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {q.isSolved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" /> Solved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Needs Review
                          </span>
                        )}

                        {q.status === 'hidden' && (
                          <Badge variant="danger">Hidden</Badge>
                        )}

                        <span className="text-xs text-[#64748B]">
                          by <strong className="text-[#1E293B]">{q.author?.name || 'User'}</strong>
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-[#1E293B] truncate hover:text-[#06B6D4]">
                        <Link to={`/admin/forum/questions/${q._id}`}>{q.title}</Link>
                      </h4>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B]">
                        <span>{q.answerCount || 0} answers</span>
                        <span>•</span>
                        <span>{q.upvoteCount || 0} upvotes</span>
                        <span>•</span>
                        <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Link
                        to={`/admin/forum/questions/${q._id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-cyan-50 hover:text-[#06B6D4] text-[#1E293B] border border-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5 text-[#06B6D4]" />
                        Select Best Answers
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Pending Reports Card */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-[#1E293B] text-base">Flagged Reports Requiring Action</h3>
              </div>
              <Link
                to="/admin/forum/reports"
                className="text-xs font-semibold text-[#06B6D4] hover:text-[#0891B2] flex items-center gap-1"
              >
                All reports ({stats.pendingReports || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardBody className="p-4">
              {recentReports.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#64748B]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All reports addressed! No pending items.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((r) => (
                    <div
                      key={r._id}
                      className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-rose-700 capitalize">{r.reason}</span>
                          <span className="text-[#64748B]">•</span>
                          <span className="text-[#64748B]">Target: {r.targetType}</span>
                        </div>
                        <p className="text-[#1E293B] line-clamp-1">{r.details || 'No comment provided.'}</p>
                      </div>
                      <Link
                        to="/admin/forum/reports"
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 shrink-0"
                      >
                        Review Report
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Coin Ledger & Audit Trail */}
        <div className="space-y-6">
          {/* Economy summary */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-md">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-[#06B6D4] flex items-center justify-center">
                  <Coins className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  Automated Engine
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Total Forum Coins Distributed</p>
                <h4 className="text-3xl font-extrabold text-white mt-1">
                  {stats.totalCoinsAwarded || 0}{' '}
                  <span className="text-sm font-medium text-cyan-400">Coins</span>
                </h4>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Question Creation (+10 coins):</span>
                  <span className="font-bold text-white">{stats.questionCoins || 0}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Top Best Answers (+25 coins):</span>
                  <span className="font-bold text-cyan-300">{stats.bestAnswerCoins || 0}</span>
                </div>
              </div>

              <Link
                to="/admin/forum/rewards"
                className="mt-2 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
              >
                Inspect Reward Ledger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardBody>
          </Card>

          {/* Recent Audit events */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="font-bold text-[#1E293B] text-sm">Recent Admin Actions</h3>
              </div>
              <Link to="/admin/forum/audit" className="text-xs text-[#06B6D4] font-semibold">
                All Logs
              </Link>
            </CardHeader>
            <CardBody className="p-4">
              {recentAuditLogs.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-4">No audit logs recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentAuditLogs.map((log) => (
                    <div key={log._id} className="text-xs border-b border-[#F1F5F9] pb-2 last:border-0">
                      <div className="flex items-center justify-between text-[#64748B] mb-0.5">
                        <span className="font-medium text-[#1E293B]">{log.admin?.name || 'Admin'}</span>
                        <span className="text-[10px]">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[#64748B] line-clamp-1">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminForumDashboard;