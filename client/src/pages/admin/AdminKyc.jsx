import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
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
    { label: 'Pending Review', value: 'submitted', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Approved', value: 'approved', color: 'text-emerald-600', bg: 'bg-[#D1FAE5]', border: 'border-emerald-200' },
    { label: 'Rejected', value: 'rejected', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
          <UserCheck className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">KYC Review</h1>
          <p className="text-[#64748B] text-sm">Verify and manage user identity documents</p>
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 mb-6 p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? `${tab.bg} ${tab.color} ${tab.border} border shadow-xs`
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
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
                      <td key={j}><div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#64748B]">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No {statusFilter} KYC requests
                  </td>
                </tr>
              ) : (
                data?.users?.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[#1E293B] text-xs font-bold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[#1E293B] font-medium text-sm">{user.name}</p>
                          <p className="text-[#64748B] text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[#64748B]">{user.phone || '—'}</td>
                    <td className="text-[#64748B] text-xs">
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
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#06B6D4] hover:text-[#0891B2] hover:border-[#06B6D4] transition-colors"
                                >
                                  <Eye className="w-3 h-3" /> {label}
                                </a>
                              ) : null
                            )
                          : <span className="text-[#64748B] text-xs">No documents</span>
                        }
                      </div>
                    </td>
                    <td>
                      {statusFilter === 'submitted' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMutation.mutate({ id: user._id, status: 'approved' })}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D1FAE5] text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          statusFilter === 'approved'
                            ? 'bg-[#D1FAE5] text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">Reject KYC</h3>
            <p className="text-[#64748B] text-sm mb-4">
              Rejecting KYC for <strong className="text-[#1E293B]">{selectedUser.name}</strong>. Please provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedUser(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate({ id: selectedUser._id, status: 'rejected', reason: rejectReason })}
                disabled={updateMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[#1E293B] text-sm font-medium transition-colors disabled:opacity-60"
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
