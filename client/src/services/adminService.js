import api from './api';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBlockUser: (id, reason) => api.patch(`/admin/users/${id}/block`, { reason }),
  // KYC
  getKycList: (status) => api.get('/admin/kyc', { params: { status } }),
  updateKycStatus: (id, data) => api.patch(`/admin/kyc/${id}`, data),
  // Packages
  getPackages: () => api.get('/admin/packages'),
  createPackage: (formData) =>
    api.post('/admin/packages', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePackage: (id, formData) =>
    api.put(`/admin/packages/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),
  setCommissionRules: (id, data) => api.patch(`/admin/packages/${id}/commission`, data),
  // Videos
  uploadVideo: (formData) =>
    api.post('/admin/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteVideo: (id) => api.delete(`/admin/videos/${id}`),
  // Payouts
  getPayouts: (params) => api.get('/admin/payouts', { params }),
  updatePayoutStatus: (id, data) => api.patch(`/admin/payouts/${id}`, data),
  bulkApprovePayouts: (payoutIds) => api.patch('/admin/payouts/bulk-approve', { payoutIds }),
  exportPayoutsCSV: () => api.get('/admin/payouts/export', { responseType: 'blob' }),
  // Sessions
  getSessions: (params) => api.get('/admin/sessions', { params }),
  revokeSession: (id, reason) => api.delete(`/admin/sessions/${id}`, { data: { reason } }),
  // Fraud alerts
  getFraudAlerts: (params) => api.get('/admin/fraud-alerts', { params }),
  resolveFraudAlert: (id, note) => api.patch(`/admin/fraud-alerts/${id}/resolve`, { note }),
};
