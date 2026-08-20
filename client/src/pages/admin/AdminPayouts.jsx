import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminPayouts = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'paid'
  const [adminNote, setAdminNote] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminPayouts', statusFilter, page],
    queryFn: async () => {
      const res = await adminService.getPayouts({ status: statusFilter, page, limit: 15 });
      return res.data;
    },
    keepPreviousData: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminService.updatePayoutStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPayouts']);
      queryClient.invalidateQueries(['adminDashboardStats']);
      toast.success('Payout status updated');
      setSelectedPayout(null);
      setActionType(null);
      setAdminNote('');
      setTransactionRef('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update payout'),
  });

  const bulkMutation = useMutation({
    mutationFn: (ids) => adminService.bulkApprovePayouts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPayouts']);
      toast.success(`${selected.length} payouts approved`);
      setSelected([]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Bulk approve failed'),
  });

  const handleExport = async () => {
    try {
      const res = await adminService.exportPayoutsCSV();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts-${Date.now()}.csv`;
      a.click();
    } catch { toast.error('Export failed'); }
  };

  const handleAction = () => {
    const statusMap = { approve: 'approved', reject: 'rejected', paid: 'paid' };
    updateMutation.mutate({
      id: selectedPayout._id,
      payload: { status: statusMap[actionType], adminNote, transactionRef },
    });
  };

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    return map[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 0;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Payout Requests</h1>
            <p className="text-slate-400 text-sm">{data?.total || 0} total requests</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-all"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters + Bulk */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700">
          {['pending', 'approved', 'paid', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); setSelected([]); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${statusFilter === s ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => bulkMutation.mutate(selected)}
            disabled={bulkMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all"
          >
            <CheckCircle className="w-4 h-4" /> Bulk Approve ({selected.length})
          </button>
        )}
      </div>

      <div className="glass rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {statusFilter === 'pending' && <th className="w-10"></th>}
                <th>User</th>
                <th>Amount</th>
                <th>Bank Details</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-800 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.payouts?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No {statusFilter} payouts
                  </td>
                </tr>
              ) : (
                data?.payouts?.map((payout) => (
                  <tr key={payout._id}>
                    {statusFilter === 'pending' && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(payout._id)}
                          onChange={() => toggleSelect(payout._id)}
                          className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />
                      </td>
                    )}
                    <td>
                      <div>
                        <p className="text-white font-medium text-sm">{payout.user?.name || '—'}</p>
                        <p className="text-slate-500 text-xs">{payout.user?.email || '—'}</p>
                      </div>
                    </td>
                    <td className="text-emerald-400 font-bold">₹{payout.amount?.toLocaleString()}</td>
                    <td>
                      <div className="text-xs text-slate-400">
                        <p>{payout.bankDetails?.bankName || '—'}</p>
                        <p className="text-slate-500">A/C: {payout.bankDetails?.accountNumber || '—'}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusBadge(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {payout.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelectedPayout(payout); setActionType('approve'); }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => { setSelectedPayout(payout); setActionType('reject'); }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {payout.status === 'approved' && (
                          <button
                            onClick={() => { setSelectedPayout(payout); setActionType('paid'); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                        {['paid', 'rejected'].includes(payout.status) && (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedPayout && actionType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-2 capitalize">{actionType === 'paid' ? 'Mark as Paid' : `${actionType} Payout`}</h3>
            <p className="text-slate-400 text-sm mb-4">
              ₹{selectedPayout.amount?.toLocaleString()} for <strong className="text-white">{selectedPayout.user?.name}</strong>
            </p>
            {actionType === 'paid' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Transaction Reference</label>
                <input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UTR / Transaction ID"
                  className="w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Note (optional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Add a note..."
                className="w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedPayout(null); setActionType(null); setAdminNote(''); setTransactionRef(''); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">Cancel</button>
              <button
                onClick={handleAction}
                disabled={updateMutation.isPending}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60 ${actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                {updateMutation.isPending ? 'Processing...' : actionType === 'paid' ? 'Mark as Paid' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
