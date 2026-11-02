import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coins,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { adminForumService } from '../../../services/adminForumService';
import AdminForumNavHeader from '../../../components/admin/forum/AdminForumNavHeader';
import Card, { CardBody } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';

const AdminForumRewards = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminForumRewards', search, type, status, page],
    queryFn: async () => {
      const res = await adminForumService.getRewards({
        search,
        type,
        status,
        page,
        limit: 15,
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const retryMutation = useMutation({
    mutationFn: (txnId) => adminForumService.retryFailedReward(txnId),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Transaction retried successfully');
      queryClient.invalidateQueries(['adminForumRewards']);
      queryClient.invalidateQueries(['adminForumDashboardStats']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to retry transaction');
    },
  });

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      <AdminForumNavHeader
        title="Forum Reward Ledger & Coin Engine"
        subtitle="Monitor student coin disbursements for discussions (+10) and Top 3 Best Answers (+25)"
        badge="Reward Ledger"
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-[#E2E8F0]">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Question Rewards
              </p>
              <h3 className="text-2xl font-bold text-[#1E293B] mt-1">+10 Coins</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Credited per valid discussion</p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-50 text-[#06B6D4]">
              <Coins className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Top Best Answers
              </p>
              <h3 className="text-2xl font-bold text-[#1E293B] mt-1">+25 Coins</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Credited to admin-chosen answers</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-[#8B5CF6]">
              <Coins className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#E2E8F0]">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                System Health
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">100% Idempotent</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Zero double-crediting guaranteed</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-[#E2E8F0]">
        <CardBody className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rewards by student name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#06B6D4] bg-white text-[#1E293B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Type: All Rewards</option>
              <option value="forum_question">Question Creation (+10)</option>
              <option value="forum_best_answer">Top Best Answer (+25)</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Status: All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed (Needs Retry)</option>
            </select>

            <button
              onClick={() => refetch()}
              className="p-2 text-[#64748B] hover:text-[#06B6D4] rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Rewards Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError || !data?.success ? (
          <div className="p-12 text-center text-sm text-rose-500 font-semibold">
            Failed to load rewards ledger.
          </div>
        ) : data.transactions.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#64748B]">
            No reward transactions found matching the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Reward Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Description / Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {data.transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-[#1E293B] flex items-center justify-center font-bold text-xs uppercase">
                          {txn.user?.name ? txn.user.name[0] : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1E293B] text-xs">
                            {txn.user?.name || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-[#64748B]">{txn.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Reward Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {txn.type === 'forum_best_answer' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-[#8B5CF6] border border-purple-200">
                          Top Best Answer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-50 text-[#06B6D4] border border-cyan-200">
                          Discussion Created
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-[#1E293B] text-sm">
                        +{txn.amount} <span className="text-[10px] text-cyan-600 font-bold">Coins</span>
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-[#64748B]">
                      {txn.description || 'Forum Coin reward'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {txn.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#D1FAE5] text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                        </span>
                      ) : txn.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B] text-[11px]">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {txn.status === 'failed' ? (
                        <Button
                          variant="outline"
                          onClick={() => retryMutation.mutate(txn._id)}
                          loading={retryMutation.isPending}
                          className="px-2.5 py-1 text-xs text-rose-600 border-rose-300 hover:bg-rose-50 cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3 mr-1" /> Retry
                        </Button>
                      ) : (
                        <span className="text-[11px] text-[#64748B]">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {(page - 1) * 15 + 1} to{' '}
              {Math.min(page * 15, data.pagination.total)} of {data.pagination.total} transactions
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="font-semibold text-[#1E293B]">
                {page} / {data.pagination.totalPages}
              </span>

              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminForumRewards;