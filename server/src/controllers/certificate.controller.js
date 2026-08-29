const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Package = require('../models/Package');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

// Helper to get or create settings
const getSettings = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
};

// @desc    Get user's certificates
// @route   GET /api/certificates/my-certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('package', 'title thumbnail')
      .sort({ createdAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or generate certificate for completed package
// @route   GET /api/certificates/package/:packageId
exports.getPackageCertificate = async (req, res) => {
  try {
    const { packageId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const pkg = await Package.findById(packageId);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Course package not found.' });
    }

    // Check progress
    const progress = await Progress.findOne({ user: userId, package: packageId });
    const isCompleted = progress?.isCompleted || (progress && progress.progressPercent >= 100);

    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Course is not completed yet. Reach 100% completion to unlock your certificate.',
        progressPercent: progress?.progressPercent || 0,
      });
    }

    // Check if certificate already exists
    let cert = await Certificate.findOne({ user: userId, package: packageId });
    if (!cert) {
      const settings = await getSettings();
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const certificateId = `CERT-EDP-${Date.now().toString().slice(-4)}${randomId}`;

      cert = await Certificate.create({
        certificateId,
        user: userId,
        package: pkg._id,
        userName: user.name,
        courseTitle: pkg.title,
        issuedAt: new Date(),
        completedAt: progress.completedAt || new Date(),
        organizationName: settings.orgName || 'EduPro Learning Platform',
        signatoryName: settings.signatoryName || 'Dr. Rajesh Sharma',
        signatoryTitle: settings.signatoryTitle || 'Director of Academic Affairs',
        verificationUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate/${certificateId}`,
      });
    }

    res.json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify certificate publicly
// @route   GET /api/certificates/verify/:certificateId
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate('user', 'name')
      .populate('package', 'title');

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Invalid certificate ID or certificate not found.' });
    }

    res.json({
      success: true,
      valid: true,
      certificate: cert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN CERTIFICATE CONTROLLERS ====================

// @desc    Get all certificates (Admin)
// @route   GET /api/certificates/admin/all
exports.getAllCertificates = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { certificateId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const certificates = await Certificate.find(query)
      .populate('user', 'name email')
      .populate('package', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Certificate.countDocuments(query);

    res.json({ success: true, certificates, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Certificate template settings (Admin)
// @route   GET /api/certificates/admin/settings
exports.getCertificateSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Certificate template settings (Admin)
// @route   PUT /api/certificates/admin/settings
exports.updateCertificateSettings = async (req, res) => {
  try {
    const { orgName, signatoryName, signatoryTitle, certificateTitle, autoIssueCertificate } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (orgName !== undefined) settings.orgName = orgName;
    if (signatoryName !== undefined) settings.signatoryName = signatoryName;
    if (signatoryTitle !== undefined) settings.signatoryTitle = signatoryTitle;
    if (certificateTitle !== undefined) settings.certificateTitle = certificateTitle;
    if (autoIssueCertificate !== undefined) settings.autoIssueCertificate = autoIssueCertificate;

    await settings.save();

    res.json({ success: true, message: 'Certificate settings updated successfully.', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
