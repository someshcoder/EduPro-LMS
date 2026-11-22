import api from './api';

export const parentPackageService = {
  getParentPackages: () => api.get('/parent-packages'),
  getParentPackage: (idOrSlug) => api.get(`/parent-packages/${idOrSlug}`),
  purchaseParentPackage: (data) => api.post('/parent-packages/purchase', data),
  getMyPurchasedPackages: () => api.get('/parent-packages/my-purchased'),
  getPurchaseHistory: () => api.get('/parent-packages/purchase-history'),
};
