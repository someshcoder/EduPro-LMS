import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminPayouts = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null);
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
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-blue-50 text-blue-700 border-blue-200',
      paid: 'bg-[#D1FAE5] text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return map[status] || 'bg-slate-100 text-[#64748B] border-slate-200';
  };

  const totalPages = data ? Math.ceil(data.total / 15) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Payout Requests</h1>
            <p className="text-[#64748B] text-sm">{data?.total || 0} total requests</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] text-sm font-medium transition-all shadow-xs w-full sm:w-auto"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters + Bulk */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] w-full sm:w-fit">
          {['pending', 'approved', 'paid', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); setSelected([]); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-white text-[#1E293B] shadow-sm border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <button
            onClick={() => bulkMutation.mutate(selected)}
            disabled={bulkMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#1E293B] text-sm font-medium transition-all"
          >
            <CheckCircle className="w-4 h-4" /> Bulk Approve ({selected.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
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
                      <td key={j}><div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.payouts?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#64748B]">
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
                          id={`payout-select-${payout._id}`}
                          name={`payout-select-${payout._id}`}
                          type="checkbox"
                          checked={selected.includes(payout._id)}
                          onChange={() => toggleSelect(payout._id)}
                          className="w-4 h-4 rounded border-[#E2E8F0] text-[#06B6D4] focus:ring-cyan-300 accent-[#06B6D4]"
                        />
                      </td>
                    )}
                    <td>
                      <div>
                        <p className="text-[#1E293B] font-medium text-sm">{payout.user?.name || '—'}</p>
                        <p className="text-[#64748B] text-xs">{payout.user?.email || '—'}</p>
                      </div>
                    </td>
                    <td className="text-emerald-600 font-bold">₹{payout.amount?.toLocaleString()}</td>
                    <td>
                      <div className="text-xs text-[#64748B]">
                        <p>{payout.bankDetails?.bankName || '—'}</p>
                        <p className="text-[#94A3B8]">A/C: {payout.bankDetails?.accountNumber || '—'}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusBadge(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="text-[#64748B] text-xs">{new Date(payout.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {payout.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelectedPayout(payout); setActionType('approve'); }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#D1FAE5] text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => { setSelectedPayout(payout); setActionType('reject'); }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {payout.status === 'approved' && (
                          <button
                            onClick={() => { setSelectedPayout(payout); setActionType('paid'); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                        {['paid', 'rejected'].includes(payout.status) && (
                          <span className="text-xs text-[#94A3B8]">—</span>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F1F5F9]">
            <p className="text-xs text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:border-[#06B6D4] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:border-[#06B6D4] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedPayout && actionType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2 capitalize">
              {actionType === 'paid' ? 'Mark as Paid' : `${actionType} Payout`}
            </h3>
            <p className="text-[#64748B] text-sm mb-4">
              ₹{selectedPayout.amount?.toLocaleString()} for <strong className="text-[#1E293B]">{selectedPayout.user?.name}</strong>
            </p>
            {actionType === 'paid' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Transaction Reference</label>
                <input
                  id="payout-transaction-ref"
                  name="transactionRef"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="UTR / Transaction ID"
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-100 transition-all"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Admin Note (optional)</label>
              <textarea
                id="payout-admin-note"
                name="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Add a note..."
                className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-cyan-100 transition-all resize-none"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={() => { setSelectedPayout(null); setActionType(null); setAdminNote(''); setTransactionRef(''); }}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors text-sm font-medium"
              >
                Cancel
              </button>
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
