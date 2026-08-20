const User = require('../models/User');
const Package = require('../models/Package');
const Video = require('../models/Video');
const PayoutRequest = require('../models/PayoutRequest');
const Session = require('../models/Session');
const FraudAlert = require('../models/FraudAlert');
const Transaction = require('../models/Transaction');
const { generatePayoutCSV } = require('../utils/csvExport');
const { sendKycStatusEmail } = require('../utils/email');

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { search, kycStatus, isBlocked, page = 1, limit = 20 } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (kycStatus) query.kycStatus = kycStatus;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block / Unblock user
// @route   PATCH /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin.' });

    user.isBlocked = !user.isBlocked;
    user.blockedReason = req.body.reason || '';
    await user.save();

    if (user.isBlocked) {
      await Session.updateMany({ user: user._id }, { isActive: false });
    }

    res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== KYC MANAGEMENT ====================

// @desc    Get pending KYC list
// @route   GET /api/admin/kyc
exports.getKycList = async (req, res) => {
  try {
    const { status = 'submitted' } = req.query;
    const users = await User.find({ kycStatus: status })
      .select('name email phone kycDocuments kycStatus kycSubmittedAt createdAt')
      .sort({ kycSubmittedAt: 1 });
    res.json({ success: true, users, total: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject KYC
// @route   PATCH /api/admin/kyc/:id
exports.updateKycStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.kycStatus = status;
    if (status === 'approved') user.kycApprovedAt = new Date();
    if (status === 'rejected') user.kycRejectionReason = reason || 'Documents unclear';
    await user.save();

    sendKycStatusEmail(user.email, user.name, status, reason).catch(console.error);

    res.json({ success: true, message: `KYC ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PACKAGE MANAGEMENT ====================

// @desc    Create package
// @route   POST /api/admin/packages
exports.createPackage = async (req, res) => {
  try {
    const pkgData = { ...req.body, createdBy: req.user.id };
    if (req.file) pkgData.thumbnail = req.file.path;
    const pkg = await Package.create(pkgData);
    res.status(201).json({ success: true, message: 'Package created!', package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update package
// @route   PUT /api/admin/packages/:id
exports.updatePackage = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.thumbnail = req.file.path;
    const pkg = await Package.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, message: 'Package updated!', package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete package
// @route   DELETE /api/admin/packages/:id
exports.deletePackage = async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    await Video.deleteMany({ package: req.params.id });
    res.json({ success: true, message: 'Package and its videos deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all packages (admin)
// @route   GET /api/admin/packages
exports.getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== VIDEO MANAGEMENT ====================

// @desc    Upload video to package
// @route   POST /api/admin/videos
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, packageId, order, watermarkEnabled } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Video file required.' });

    const video = await Video.create({
      title,
      description,
      videoUrl: req.file.path,
      package: packageId,
      order: order || 0,
      watermarkEnabled: watermarkEnabled !== 'false',
      uploadedBy: req.user.id,
    });

    await Package.findByIdAndUpdate(packageId, { $push: { videos: video._id }, $inc: { totalVideos: 1 } });

    res.status(201).json({ success: true, message: 'Video uploaded!', video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video
// @route   DELETE /api/admin/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });
    await Package.findByIdAndUpdate(video.package, { $pull: { videos: video._id }, $inc: { totalVideos: -1 } });
    res.json({ success: true, message: 'Video deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PAYOUT MANAGEMENT ====================

// @desc    Get all payout requests
// @route   GET /api/admin/payouts
exports.getPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const payouts = await PayoutRequest.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PayoutRequest.countDocuments(query);
    res.json({ success: true, payouts, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject payout
// @route   PATCH /api/admin/payouts/:id
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { status, adminNote, transactionRef } = req.body;
    const payout = await PayoutRequest.findById(req.params.id).populate('user');
    if (!payout) return res.status(404).json({ success: false, message: 'Payout not found.' });

    payout.status = status;
    payout.adminNote = adminNote;
    payout.approvedBy = req.user.id;
    payout.approvedAt = new Date();
    if (transactionRef) payout.transactionRef = transactionRef;
    if (status === 'paid') payout.paidAt = new Date();

    // If rejected, refund to wallet
    if (status === 'rejected') {
      await User.findByIdAndUpdate(payout.user._id, { $inc: { walletBalance: payout.amount } });
      await Transaction.create({
        user: payout.user._id,
        type: 'payout',
        amount: payout.amount,
        description: `Payout request rejected - refunded`,
        reference: payout._id.toString(),
        status: 'reversed',
      });
    }

    await payout.save();
    res.json({ success: true, message: `Payout ${status}.`, payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk approve payouts
// @route   PATCH /api/admin/payouts/bulk-approve
exports.bulkApprovePayouts = async (req, res) => {
  try {
    const { payoutIds } = req.body;
    await PayoutRequest.updateMany(
      { _id: { $in: payoutIds }, status: 'pending' },
      { status: 'approved', approvedBy: req.user.id, approvedAt: new Date() }
    );
    res.json({ success: true, message: `${payoutIds.length} payouts approved.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export payouts as CSV
// @route   GET /api/admin/payouts/export
exports.exportPayoutsCSV = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const payouts = await PayoutRequest.find(query).populate('user', 'name email phone');
    const csv = generatePayoutCSV(payouts);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payouts-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SECURITY MANAGEMENT ====================

// @desc    Get active sessions
// @route   GET /api/admin/sessions
exports.getSessions = async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (userId) query.user = userId;

    const sessions = await Session.find(query)
      .populate('user', 'name email')
      .sort({ lastActivity: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);
    res.json({ success: true, sessions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Revoke session
// @route   DELETE /api/admin/sessions/:id
exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, {
      isActive: false,
      revokedAt: new Date(),
      revokedBy: req.user.id,
      revokeReason: req.body.reason || 'Revoked by admin',
    });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, message: 'Session revoked.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fraud alerts
// @route   GET /api/admin/fraud-alerts
exports.getFraudAlerts = async (req, res) => {
  try {
    const { isResolved, severity, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';
    if (severity) query.severity = severity;

    const alerts = await FraudAlert.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await FraudAlert.countDocuments(query);
    res.json({ success: true, alerts, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve fraud alert
// @route   PATCH /api/admin/fraud-alerts/:id/resolve
exports.resolveFraudAlert = async (req, res) => {
  try {
    const alert = await FraudAlert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedBy: req.user.id, resolvedAt: new Date(), resolvedNote: req.body.note },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.json({ success: true, message: 'Alert resolved.', alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPackages, pendingKyc, pendingPayouts, unresolvedAlerts, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Package.countDocuments(),
      User.countDocuments({ kycStatus: 'submitted' }),
      PayoutRequest.countDocuments({ status: 'pending' }),
      FraudAlert.countDocuments({ isResolved: false }),
      Transaction.aggregate([
        { $match: { type: 'commission', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPackages,
        pendingKyc,
        pendingPayouts,
        unresolvedAlerts,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set commission rules for a package
// @route   PATCH /api/admin/packages/:id/commission
exports.setCommissionRules = async (req, res) => {
  try {
    const { level1Percent, level2Percent } = req.body;
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { 'commissionRules.level1Percent': level1Percent, 'commissionRules.level2Percent': level2Percent },
      { new: true }
    );
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, message: 'Commission rules updated!', package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
