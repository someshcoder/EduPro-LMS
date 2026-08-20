import api from './api';

export const affiliateService = {
  getReferralInfo: () => api.get('/affiliate/link'),
  getTeam: (level) => api.get('/affiliate/team', { params: { level } }),
  getCommissions: (params) => api.get('/affiliate/commissions', { params }),
};
