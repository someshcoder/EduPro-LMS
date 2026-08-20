const express = require('express');
const router = express.Router();
const { getWalletStats, requestPayout, getPayoutHistory } = require('../controllers/wallet.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/stats', getWalletStats);
router.post('/payout', requestPayout);
router.get('/payouts', getPayoutHistory);

module.exports = router;
