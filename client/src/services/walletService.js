import api from './api';

export const walletService = {
  getStats: () => api.get('/wallet/stats'),
  requestPayout: (data) => api.post('/wallet/payout', data),
  getPayoutHistory: () => api.get('/wallet/payouts'),
};
