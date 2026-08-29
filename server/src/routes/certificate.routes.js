const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getPackageCertificate,
  verifyCertificate,
  getAllCertificates,
  getCertificateSettings,
  updateCertificateSettings,
} = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

// Public verification
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.use(protect);

router.get('/my-certificates', getMyCertificates);
router.get('/package/:packageId', getPackageCertificate);

// Admin routes
router.get('/admin/all', adminOnly, getAllCertificates);
router.get('/admin/settings', adminOnly, getCertificateSettings);
router.put('/admin/settings', adminOnly, updateCertificateSettings);

module.exports = router;
