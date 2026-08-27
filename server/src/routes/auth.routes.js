const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  submitKyc,
  getProfile,
  updateProfile,
  updateBankDetails,
  changePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadKyc } = require('../config/multer');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Profile & Bank routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/bank-details', protect, updateBankDetails);
router.put('/change-password', protect, changePassword);

router.post(
  '/kyc',
  protect,
  uploadKyc.fields([
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
  ]),
  submitKyc
);

module.exports = router;

