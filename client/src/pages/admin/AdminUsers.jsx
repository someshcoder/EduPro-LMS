import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Shield, ShieldOff, ChevronLeft, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';
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
      approved: 'bg-[#D1FAE5] text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      submitted: 'bg-amber-50 text-amber-700 border-amber-200',
      pending: 'bg-slate-100 text-[#64748B] border-slate-200',
      not_submitted: 'bg-slate-100 text-[#64748B] border-slate-200',
    };
    return map[status] || map.pending;
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 0;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20">
          <Users className="w-6 h-6 text-[#06B6D4]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">User Management</h1>
          <p className="text-[#64748B] text-sm">{data?.total || 0} total registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by name, email, or referral code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-100 transition-all"
          />
        </div>
        <select
          value={kycStatus}
          onChange={(e) => { setKycStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-100 transition-all"
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
          className="px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-100 transition-all"
        >
          <option value="">All Users</option>
          <option value="false">Active Only</option>
          <option value="true">Blocked Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
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
                      <td key={j}><div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.users?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748B]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.users?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-[#1E293B] text-xs font-bold flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[#1E293B] font-semibold text-sm">{user.name}</p>
                          <p className="text-[#64748B] text-xs">{user.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-[#06B6D4] bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100">
                              {user.referralCode}
                            </span>
                            {user.phone && <span className="text-[11px] text-[#64748B]">{user.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-[#1E293B] text-xs bg-[#F8FAFC] px-2 py-1 rounded-md border border-[#E2E8F0]">
                        {user.referralsCount || 0} Direct
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                        <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
                        {user.enrolledCount || 0} Enrolled
                      </span>
                    </td>
                    <td className="font-bold text-[#8B5CF6] text-xs">
                      ₹{(user.totalEarnings || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="font-bold text-emerald-600 text-xs">
                      ₹{(user.walletBalance || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${kycBadge(user.kycStatus)}`}>
                        {user.kycStatus === 'approved' ? 'Verified' : user.kycStatus === 'submitted' ? 'In Review' : user.kycStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${user.isBlocked ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-[#D1FAE5] text-emerald-700 border-emerald-200'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => blockMutation.mutate({ id: user._id, reason: user.isBlocked ? '' : 'Blocked by admin' })}
                        disabled={blockMutation.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          user.isBlocked
                            ? 'bg-[#D1FAE5] text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F1F5F9]">
            <p className="text-xs text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:border-[#06B6D4] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:border-[#06B6D4] disabled:opacity-40 transition-colors"
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
