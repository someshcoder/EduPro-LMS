import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const severityStyles = {
  low: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  critical: 'bg-red-700/30 text-red-400 border-red-600/40',
};

const AdminFraudAlerts = () => {
  const [showResolved, setShowResolved] = useState(false);
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminFraudAlerts', showResolved, severity, page],
    queryFn: async () => {
      const res = await adminService.getFraudAlerts({ isResolved: showResolved, severity: severity || undefined, page, limit: 15 });
      return res.data;
    },
    keepPreviousData: true,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, note }) => adminService.resolveFraudAlert(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminFraudAlerts']);
      queryClient.invalidateQueries(['adminDashboardStats']);
      toast.success('Alert resolved');
      setResolveTarget(null);
      setResolveNote('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resolve alert'),
  });

  const totalPages = data ? Math.ceil(data.total / 15) : 0;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Fraud Alerts</h1>
          <p className="text-[#64748B] text-sm">{data?.total || 0} {showResolved ? 'resolved' : 'unresolved'} alerts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => { setShowResolved(false); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!showResolved ? 'bg-[#E2E8F0] text-[#1E293B] shadow-sm' : 'text-[#64748B] hover:text-[#1E293B]'}`}
          >
            Unresolved
          </button>
          <button
            onClick={() => { setShowResolved(true); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${showResolved ? 'bg-[#E2E8F0] text-[#1E293B] shadow-sm' : 'text-[#64748B] hover:text-[#1E293B]'}`}
          >
            Resolved
          </button>
        </div>
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#06B6D4] transition-colors"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Alert Type</th>
                <th>Severity</th>
                <th>Details</th>
                <th>Detected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.alerts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#94A3B8]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No {showResolved ? 'resolved' : 'unresolved'} alerts
                  </td>
                </tr>
              ) : (
                data?.alerts?.map((alert) => (
                  <tr key={alert._id}>
                    <td>
                      <div>
                        <p className="text-[#1E293B] font-medium text-sm">{alert.user?.name || '—'}</p>
                        <p className="text-[#94A3B8] text-xs">{alert.user?.email || '—'}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-[#64748B] text-sm font-medium">{alert.alertType?.replace(/_/g, ' ') || '—'}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${severityStyles[alert.severity] || 'bg-slate-500/20 text-[#64748B] border-slate-500/30'}`}>
                        {alert.severity || '—'}
                      </span>
                    </td>
                    <td className="text-[#64748B] text-xs max-w-[200px] truncate">{alert.details || '—'}</td>
                    <td className="text-[#64748B] text-xs">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—'}
                    </td>
                    <td>
                      {!alert.isResolved ? (
                        <button
                          onClick={() => setResolveTarget(alert)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                      ) : (
                        <div className="text-xs text-[#94A3B8]">
                          <p className="text-emerald-600">Resolved</p>
                          {alert.resolvedAt && <p>{new Date(alert.resolvedAt).toLocaleDateString()}</p>}
                          {alert.resolvedNote && <p className="text-[#64748B] truncate max-w-[120px]">{alert.resolvedNote}</p>}
                        </div>
                      )}
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

      {/* Resolve Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Resolve Fraud Alert</h3>
            <p className="text-[#64748B] text-sm mb-1">
              Alert: <strong className="text-[#1E293B]">{resolveTarget.alertType?.replace(/_/g, ' ')}</strong>
            </p>
            <p className="text-[#64748B] text-sm mb-4">
              User: <strong className="text-[#1E293B]">{resolveTarget.user?.name}</strong>
            </p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Resolution note (e.g., investigated and cleared, action taken)..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setResolveTarget(null); setResolveNote(''); }} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors text-sm font-medium">Cancel</button>
              <button
                onClick={() => resolveMutation.mutate({ id: resolveTarget._id, note: resolveNote })}
                disabled={resolveMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#1E293B] text-sm font-medium transition-colors disabled:opacity-60"
              >
                {resolveMutation.isPending ? 'Resolving...' : 'Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFraudAlerts;
