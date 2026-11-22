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
  toggleVideoWatermark: (id, watermarkEnabled) =>
    api.patch(`/admin/videos/${id}/watermark`, { watermarkEnabled }),
  updateVideo: (id, data) => api.patch(`/admin/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/admin/videos/${id}`),
  // Payouts
  getPayouts: (params) => api.get('/admin/payouts', { params }),
  updatePayoutStatus: (id, data) => api.patch(`/admin/payouts/${id}`, data),
  bulkApprovePayouts: (payoutIds) => api.patch('/admin/payouts/bulk-approve', { payoutIds }),
  exportPayoutsCSV: (params) => api.get('/admin/payouts/export', { params, responseType: 'blob' }),
  // Sessions
  getSessions: (params) => api.get('/admin/sessions', { params }),
  revokeSession: (id, reason) => api.delete(`/admin/sessions/${id}`, { data: { reason } }),
  // Fraud alerts
  getFraudAlerts: (params) => api.get('/admin/fraud-alerts', { params }),
  resolveFraudAlert: (id, note) => api.patch(`/admin/fraud-alerts/${id}/resolve`, { note }),
  // Parent Packages Management (Part 2)
  getParentPackages: () => api.get('/admin/parent-packages'),
  createParentPackage: (formData) =>
    api.post('/admin/parent-packages', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateParentPackage: (id, formData) =>
    api.put(`/admin/parent-packages/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  togglePublishParentPackage: (id) => api.patch(`/admin/parent-packages/${id}/publish`),
  updatePackageCourses: (id, data) => api.patch(`/admin/parent-packages/${id}/courses`, data),
  syncUltimatePackage: () => api.post('/admin/parent-packages/sync-ultimate'),
  deleteParentPackage: (id) => api.delete(`/admin/parent-packages/${id}`),
  // Purchases & Refunds Management (Part 2)
  getAllPurchases: (params) => api.get('/admin/purchases', { params }),
  refundOrCancelPurchase: (id, data) => api.post(`/admin/purchases/${id}/refund`, data),
  getUserAccessOverview: (userId) => api.get(`/admin/users/${userId}/access-overview`),
};
