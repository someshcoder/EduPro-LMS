import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Trash2, ChevronLeft, ChevronRight, AlertCircle, Monitor, Smartphone } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminSessions = () => {
  const [page, setPage] = useState(1);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminSessions', page],
    queryFn: async () => {
      const res = await adminService.getSessions({ page, limit: 15 });
      return res.data;
    },
    keepPreviousData: true,
    refetchInterval: 30000, // refresh every 30s
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.revokeSession(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminSessions']);
      toast.success('Session revoked');
      setRevokeTarget(null);
      setRevokeReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to revoke session'),
  });

  const totalPages = data ? Math.ceil(data.total / 15) : 0;

  const isMobile = (ua) => /mobile|android|iphone|ipad/i.test(ua || '');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-200">
          <Shield className="w-6 h-6 text-[#8B5CF6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Active Sessions</h1>
          <p className="text-[#64748B] text-sm">{data?.total || 0} active sessions · Auto-refreshes every 30s</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Device</th>
                <th>IP Address</th>
                <th>Last Activity</th>
                <th>Started</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.sessions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#94A3B8]">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No active sessions
                  </td>
                </tr>
              ) : (
                data?.sessions?.map((session) => (
                  <tr key={session._id}>
                    <td>
                      <div>
                        <p className="text-[#1E293B] font-medium text-sm">{session.user?.name || '—'}</p>
                        <p className="text-[#94A3B8] text-xs">{session.user?.email || '—'}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {isMobile(session.userAgent) ? (
                          <Smartphone className="w-4 h-4 text-[#64748B]" />
                        ) : (
                          <Monitor className="w-4 h-4 text-[#64748B]" />
                        )}
                        <span className="text-[#64748B] text-xs max-w-[180px] truncate">{session.userAgent || '—'}</span>
                      </div>
                    </td>
                    <td className="text-[#64748B] text-sm font-mono">{session.ipAddress || '—'}</td>
                    <td className="text-[#64748B] text-xs">
                      {session.lastActivity ? new Date(session.lastActivity).toLocaleString() : '—'}
                    </td>
                    <td className="text-[#64748B] text-xs">
                      {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => setRevokeTarget(session)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#94A3B8]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Revoke Session</h3>
            <p className="text-[#64748B] text-sm mb-4">
              Revoke session for <strong className="text-[#1E293B]">{revokeTarget.user?.name}</strong>. They will be logged out immediately.
            </p>
            <textarea
              id="session-revoke-reason"
              name="revokeReason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation (optional)"
              rows={2}
              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none mb-4"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
              <button onClick={() => { setRevokeTarget(null); setRevokeReason(''); }} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors text-sm font-medium">Cancel</button>
              <button
                onClick={() => revokeMutation.mutate({ id: revokeTarget._id, reason: revokeReason })}
                disabled={revokeMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {revokeMutation.isPending ? 'Revoking...' : 'Revoke Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
