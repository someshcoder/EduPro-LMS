const express = require('express');
const router = express.Router();
const { getReferralInfo, getTeam, getCommissions } = require('../controllers/affiliate.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/link', getReferralInfo);
router.get('/team', getTeam);
router.get('/commissions', getCommissions);

module.exports = router;
