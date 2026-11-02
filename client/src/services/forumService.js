import api from './api';

const BASE = '/forum';

export const forumService = {
  // Questions
  getQuestions: (params) => api.get(`${BASE}/questions`, { params }),
  getQuestion: (id) => api.get(`${BASE}/questions/${id}`),
  createQuestion: (formData) =>
    api.post(`${BASE}/questions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  editQuestion: (id, data) => api.put(`${BASE}/questions/${id}`, data),
  archiveQuestion: (id) => api.delete(`${BASE}/questions/${id}`),
  toggleUpvote: (id) => api.post(`${BASE}/questions/${id}/upvote`),

  // Answers
  getAnswers: (questionId, params) =>
    api.get(`${BASE}/questions/${questionId}/answers`, { params }),
  createAnswer: (questionId, data) =>
    api.post(`${BASE}/questions/${questionId}/answers`, data),
  editAnswer: (answerId, data) => api.put(`${BASE}/answers/${answerId}`, data),

  // My activity
  getMyQuestions: (params) => api.get(`${BASE}/my/questions`, { params }),
  getMyAnswers: (params) => api.get(`${BASE}/my/answers`, { params }),

  // Forum wallet
  getForumWallet: () => api.get(`${BASE}/wallet`),

  // Tags
  getPopularTags: () => api.get(`${BASE}/tags`),

  // Notifications
  getNotifications: (params) => api.get(`${BASE}/notifications`, { params }),
  markAllRead: () => api.patch(`${BASE}/notifications/read-all`),
  markRead: (id) => api.patch(`${BASE}/notifications/${id}/read`),

  // Reports
  createReport: (data) => api.post(`${BASE}/reports`, data),
};

