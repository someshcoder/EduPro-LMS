const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getTeamTree } = require('../utils/referralCode');

// @desc    Get referral link and stats
// @route   GET /api/affiliate/link
exports.getReferralInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const referralLink = `${process.env.CLIENT_URL}/signup?ref=${user.referralCode}`;

    // Count direct referrals
    const directCount = await User.countDocuments({ referredBy: req.user.id });

    // Count indirect referrals
    const directIds = await User.find({ referredBy: req.user.id }).distinct('_id');
    const indirectCount = await User.countDocuments({ referredBy: { $in: directIds } });

    // Total commission earned
    const commissions = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'commission' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      stats: {
        directReferrals: directCount,
        indirectReferrals: indirectCount,
        totalTeam: directCount + indirectCount,
        totalCommissionEarned: commissions[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team list (direct + indirect)
// @route   GET /api/affiliate/team
exports.getTeam = async (req, res) => {
  try {
    const { level = 'all' } = req.query;
    const team = await getTeamTree(req.user.id, User);

    if (level === '1') return res.json({ success: true, team: team.level1, totalTeam: team.level1.length });
    if (level === '2') return res.json({ success: true, team: team.level2, totalTeam: team.level2.length });

    res.json({ success: true, ...team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get commission history
// @route   GET /api/affiliate/commissions
exports.getCommissions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const commissions = await Transaction.find({ user: req.user.id, type: 'commission' })
      .populate('fromUser', 'name email')
      .populate('package', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ user: req.user.id, type: 'commission' });

    res.json({ success: true, commissions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
