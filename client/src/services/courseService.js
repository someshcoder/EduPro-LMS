import api from './api';

export const courseService = {
  getPackages: (params) => api.get('/courses', { params }),
  getPackage: (id) => api.get(`/courses/${id}`),
  getVideo: (packageId, videoId) => api.get(`/courses/${packageId}/videos/${videoId}`),
  updateProgress: (packageId, data) => api.post(`/courses/${packageId}/progress`, data),
  getMyCourses: () => api.get('/courses/my-courses'),
};
