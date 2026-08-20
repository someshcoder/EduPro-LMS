const express = require('express');
const router = express.Router();
const { signup, login, logout, refreshToken, forgotPassword, resetPassword, submitKyc } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadKyc } = require('../config/multer');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
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
