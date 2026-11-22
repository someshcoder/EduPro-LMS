const express = require('express');
const router = express.Router();
const {
  getParentPackages,
  getParentPackageByIdOrSlug,
  purchaseParentPackage,
  getMyPurchasedPackages,
  getPurchaseHistory,
} = require('../controllers/parentPackage.controller');
const { protect, optionalProtect } = require('../middleware/auth.middleware');

// Public or optionally authenticated catalog & details
router.get('/', optionalProtect, getParentPackages);
router.get('/my-purchased', protect, getMyPurchasedPackages);
router.get('/purchase-history', protect, getPurchaseHistory);
router.get('/:idOrSlug', optionalProtect, getParentPackageByIdOrSlug);

// Purchase or upgrade parent package
router.post('/purchase', protect, purchaseParentPackage);

module.exports = router;
