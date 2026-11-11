const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PayoutRequest = require('../models/PayoutRequest');
const { checkFraud } = require('../middleware/fraud.middleware');

// @desc    Get wallet stats (today / 7-day / total)
// @route   GET /api/wallet/stats
exports.getWalletStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [todayEarnings, weekEarnings, totalEarnings, recentTxns] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, type: 'commission', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'commission', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'commission' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('fromUser', 'name')
        .populate('package', 'title'),
    ]);

    const user = await User.findById(userId).select('walletBalance totalEarnings');

    res.json({
      success: true,
      stats: {
        todayEarnings: todayEarnings[0]?.total || 0,
        weekEarnings: weekEarnings[0]?.total || 0,
        totalEarnings: totalEarnings[0]?.total || 0,
        walletBalance: user.walletBalance,
      },
      recentTransactions: recentTxns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request payout
// @route   POST /api/wallet/payout
exports.requestPayout = async (req, res) => {
  try {
    const { amount, paymentMethod, bankDetails, upiId, requestNote } = req.body;

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payout amount.' });
    }

    const minPayout = 500;
    if (numAmount < minPayout) {
      return res.status(400).json({ success: false, message: `Minimum payout amount is ₹${minPayout}.` });
    }

    const pendingPayout = await PayoutRequest.findOne({ user: req.user.id, status: 'pending' });
    if (pendingPayout) {
      return res.status(400).json({ success: false, message: 'You have a pending payout request.' });
    }

    // Atomic conditional decrement to eliminate race conditions
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id, walletBalance: { $gte: numAmount } },
      { $inc: { walletBalance: -numAmount } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance.' });
    }

    let payout;
    try {
      payout = await PayoutRequest.create({
        user: req.user.id,
        amount: numAmount,
        paymentMethod,
        bankDetails: paymentMethod === 'bank' ? bankDetails : undefined,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
        requestNote,
      });

      // Create transaction record
      await Transaction.create({
        user: req.user.id,
        type: 'payout',
        amount: -numAmount,
        description: 'Payout request created',
        reference: payout._id.toString(),
        status: 'pending',
        balanceAfter: updatedUser.walletBalance,
      });
    } catch (createErr) {
      // Rollback deduction if record creation fails
      await User.findByIdAndUpdate(req.user.id, { $inc: { walletBalance: numAmount } });
      throw createErr;
    }

    // Fraud check async
    checkFraud(req.user.id, 'suspicious_payout', { amount: numAmount, ip: req.ip });

    res.status(201).json({ success: true, message: 'Payout request submitted!', payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payout history
// @route   GET /api/wallet/payouts
exports.getPayoutHistory = async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
