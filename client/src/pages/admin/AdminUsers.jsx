import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, ShieldOff, ChevronLeft, ChevronRight, Filter, AlertCircle, BookOpen, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [kycStatus, setKycStatus] = useState('');
  const [isBlocked, setIsBlocked] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, kycStatus, isBlocked, page],
    queryFn: async () => {
      const res = await adminService.getUsers({ search, kycStatus, isBlocked, page, limit: 15 });
      return res.data;
    },
    keepPreviousData: true,
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.toggleBlockUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
      toast.success('User status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update user'),
  });

  const kycBadge = (status) => {
    const map = {
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      submitted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      not_submitted: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return map[status] || map.pending;
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 0;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <Users className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm">{data?.total || 0} total registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or referral code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={kycStatus}
          onChange={(e) => { setKycStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All KYC Status</option>
          <option value="approved">Approved</option>
          <option value="submitted">In Review</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={isBlocked}
          onChange={(e) => { setIsBlocked(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">All Users</option>
          <option value="false">Active Only</option>
          <option value="true">Blocked Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Referrals (L1)</th>
                <th>Courses</th>
                <th>Total Earnings</th>
                <th>Wallet Balance</th>
                <th>KYC Status</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-800 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.users?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.users?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{user.name}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              {user.referralCode}
                            </span>
                            {user.phone && <span className="text-[11px] text-slate-500">{user.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-white text-xs bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                        {user.referralsCount || 0} Direct
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        {user.enrolledCount || 0} Enrolled
                      </span>
                    </td>
                    <td className="font-bold text-purple-400 text-xs">
                      ₹{(user.totalEarnings || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="font-bold text-emerald-400 text-xs">
                      ₹{(user.walletBalance || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${kycBadge(user.kycStatus)}`}>
                        {user.kycStatus === 'approved' ? 'Verified' : user.kycStatus === 'submitted' ? 'In Review' : user.kycStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${user.isBlocked ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => blockMutation.mutate({ id: user._id, reason: user.isBlocked ? '' : 'Blocked by admin' })}
                        disabled={blockMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          user.isBlocked
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                        }`}
                      >
                        {user.isBlocked ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
