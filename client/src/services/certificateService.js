import api from './api';

export const certificateService = {
  getMyCertificates: () => api.get('/certificates/my-certificates'),
  getPackageCertificate: (packageId) => api.get(`/certificates/package/${packageId}`),
  verifyCertificate: (certificateId) => api.get(`/certificates/verify/${certificateId}`),

  // Admin
  getAllCertificates: (params) => api.get('/certificates/admin/all', { params }),
  getCertificateSettings: () => api.get('/certificates/admin/settings'),
  updateCertificateSettings: (data) => api.put('/certificates/admin/settings', data),
};
