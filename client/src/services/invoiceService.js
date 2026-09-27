import api from './api';

export const invoiceService = {
  getMyInvoices: () => api.get('/invoices/my-invoices'),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  purchasePackage: (data) => api.post('/invoices/purchase', data),
  
  // Admin
  getAllInvoices: (params) => api.get('/invoices/admin/all', { params }),
  getGstSettings: () => api.get('/invoices/admin/settings'),
  updateGstSettings: (data) => api.put('/invoices/admin/settings', data),
};
