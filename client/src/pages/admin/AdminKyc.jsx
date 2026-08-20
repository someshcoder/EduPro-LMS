import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, CheckCircle, XCircle, Eye, AlertCircle, Clock } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminKyc = () => {
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminKyc', statusFilter],
    queryFn: async () => {
      const res = await adminService.getKycList(statusFilter);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, reason }) => adminService.updateKycStatus(id, { status, reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['adminKyc']);
      queryClient.invalidateQueries(['adminDashboardStats']);
      toast.success(`KYC ${vars.status} successfully`);
      setSelectedUser(null);
      setRejectReason('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update KYC'),
  });

  const tabs = [
    { label: 'Pending', value: 'submitted', color: 'text-amber-400' },
    { label: 'Approved', value: 'approved', color: 'text-emerald-400' },
    { label: 'Rejected', value: 'rejected', color: 'text-rose-400' },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <UserCheck className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Review</h1>
          <p className="text-slate-400 text-sm">Verify and manage user identity documents</p>
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-800/50 rounded-xl border border-slate-700 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === tab.value ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Submitted</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-800 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No {statusFilter} KYC requests
                  </td>
                </tr>
              ) : (
                data?.users?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{user.name}</p>
                          <p className="text-slate-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-400">{user.phone || '—'}</td>
                    <td className="text-slate-400 text-xs">
                      {user.kycSubmittedAt ? new Date(user.kycSubmittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {user.kycDocuments && Object.entries(user.kycDocuments).filter(([, val]) => val).length > 0
                          ? Object.entries({
                              aadharFront: 'Aadhar Front',
                              aadharBack: 'Aadhar Back',
                              panCard: 'PAN Card',
                            }).map(([key, label]) =>
                              user.kycDocuments[key] ? (
                                <a
                                  key={key}
                                  href={`http://localhost:5000/${user.kycDocuments[key]}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  <Eye className="w-3 h-3" /> {label}
                                </a>
                              ) : null
                            )
                          : <span className="text-slate-500 text-xs">No documents</span>
                        }
                      </div>
                    </td>
                    <td>
                      {statusFilter === 'submitted' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMutation.mutate({ id: user._id, status: 'approved' })}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                          {statusFilter}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl border border-slate-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Reject KYC</h3>
            <p className="text-slate-400 text-sm mb-4">Rejecting KYC for <strong className="text-white">{selectedUser.name}</strong>. Please provide a reason.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedUser(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate({ id: selectedUser._id, status: 'rejected', reason: rejectReason })}
                disabled={updateMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKyc;
