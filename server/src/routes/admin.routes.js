const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller');
const adminParentPackage = require('../controllers/adminParentPackage.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { uploadThumbnail, uploadVideo } = require('../config/multer');

router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', admin.getDashboardStats);

// User management
router.get('/users', admin.getUsers);
router.patch('/users/:id/block', admin.toggleBlockUser);
router.get('/users/:id/access-overview', adminParentPackage.getUserAccessOverview);

// Parent Packages Management (Part 2)
router.get('/parent-packages', adminParentPackage.getAdminParentPackages);
router.post('/parent-packages', uploadThumbnail.single('thumbnail'), adminParentPackage.createAdminParentPackage);
router.put('/parent-packages/:id', uploadThumbnail.single('thumbnail'), adminParentPackage.updateAdminParentPackage);
router.patch('/parent-packages/:id/publish', adminParentPackage.togglePublishStatus);
router.patch('/parent-packages/:id/courses', adminParentPackage.updatePackageCourses);
router.post('/parent-packages/sync-ultimate', adminParentPackage.syncUltimatePackage);
router.delete('/parent-packages/:id', adminParentPackage.deleteAdminParentPackage);

// Purchases & Refunds Management (Part 2)
router.get('/purchases', adminParentPackage.getAllPurchases);
router.post('/purchases/:id/refund', adminParentPackage.refundOrCancelPurchase);

// KYC
router.get('/kyc', admin.getKycList);
router.patch('/kyc/:id', admin.updateKycStatus);

// Packages
router.get('/packages', admin.getPackages);
router.post('/packages', uploadThumbnail.single('thumbnail'), admin.createPackage);
router.put('/packages/:id', uploadThumbnail.single('thumbnail'), admin.updatePackage);
router.delete('/packages/:id', admin.deletePackage);
router.patch('/packages/:id/commission', admin.setCommissionRules);

// Videos
router.post('/videos', uploadVideo.single('video'), admin.uploadVideo);
router.patch('/videos/:id/watermark', admin.toggleVideoWatermark);
router.patch('/videos/:id', admin.updateVideo);
router.delete('/videos/:id', admin.deleteVideo);

// Payouts
router.get('/payouts', admin.getPayouts);
router.patch('/payouts/bulk-approve', admin.bulkApprovePayouts);
router.get('/payouts/export', admin.exportPayoutsCSV);
router.patch('/payouts/:id', admin.updatePayoutStatus);

// Sessions
router.get('/sessions', admin.getSessions);
router.delete('/sessions/:id', admin.revokeSession);

// Fraud alerts
router.get('/fraud-alerts', admin.getFraudAlerts);
router.patch('/fraud-alerts/:id/resolve', admin.resolveFraudAlert);

module.exports = router;
