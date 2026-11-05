import api from './api';

const BASE = '/admin/forum';

export const adminForumService = {
  // Stats
  getDashboardStats: () => api.get(`${BASE}/stats`),

  // Questions
  getQuestions: (params) => api.get(`${BASE}/questions`, { params }),
  getQuestionDetail: (id) => api.get(`${BASE}/questions/${id}`),
  moderateQuestion: (id, data) => api.patch(`${BASE}/questions/${id}/moderate`, data),

  // Top 3 Best Answers publication
  publishBestAnswers: (id, selectedAnswers) =>
    api.post(`${BASE}/questions/${id}/publish-best-answers`, { selectedAnswers }),

  // Answers
  moderateAnswer: (id, data) => api.patch(`${BASE}/answers/${id}/moderate`, data),

  // Rewards
  getRewards: (params) => api.get(`${BASE}/rewards`, { params }),
  retryFailedReward: (txnId) => api.post(`${BASE}/rewards/${txnId}/retry`),

  // Reports
  getReports: (params) => api.get(`${BASE}/reports`, { params }),
  reviewReport: (id, data) => api.patch(`${BASE}/reports/${id}/review`, data),

  // Audit history
  getAuditLogs: (params) => api.get(`${BASE}/audit-logs`, { params }),
};
