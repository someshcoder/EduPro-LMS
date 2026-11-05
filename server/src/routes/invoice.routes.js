const express = require('express');
const router = express.Router();
const {
  getMyInvoices,
  getInvoiceById,
  purchasePackage,
  getAllInvoices,
  getGstSettings,
  updateGstSettings,
} = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

router.use(protect);

// User invoice routes
router.get('/my-invoices', getMyInvoices);
router.post('/purchase', purchasePackage);
router.get('/:id', getInvoiceById);

// Admin invoice & GST settings routes
router.get('/admin/all', adminOnly, getAllInvoices);
router.get('/admin/settings', adminOnly, getGstSettings);
router.put('/admin/settings', adminOnly, updateGstSettings);

module.exports = router;
