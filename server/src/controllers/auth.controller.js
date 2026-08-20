const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateReferralCode } = require('../utils/referralCode');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { checkFraud } = require('../middleware/fraud.middleware');

// @desc    Register user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    const newReferralCode = generateReferralCode();
    const user = await User.create({
      name,
      email,
      password,
      phone,
      referralCode: newReferralCode,
      referredBy,
    });

    sendWelcomeEmail(email, name).catch(console.error);

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    await Session.create({
      user: user._id,
      token: accessToken,
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        kycStatus: user.kycStatus,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account blocked. Contact support.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    await Session.create({
      user: user._id,
      token: accessToken,
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Async fraud check
    checkFraud(user._id, 'multiple_logins', { ip: req.ip });

    res.json({
      success: true,
      message: 'Login successful!',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        kycStatus: user.kycStatus,
        walletBalance: user.walletBalance,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token.' });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Invalidate old session, create new
    await Session.findOneAndUpdate({ refreshToken }, { isActive: false });
    await Session.create({
      user: user._id,
      token: accessToken,
      refreshToken: newRefreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    await Session.findOneAndUpdate({ token: req.token }, { isActive: false });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoke all sessions
    await Session.updateMany({ user: user._id }, { isActive: false });

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit KYC
// @route   POST /api/auth/kyc
exports.submitKyc = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const files = req.files;

    if (!files || !files.aadharFront || !files.aadharBack || !files.panCard) {
      return res.status(400).json({ success: false, message: 'Please upload all required documents.' });
    }

    user.kycDocuments = {
      aadharFront: files.aadharFront[0].path,
      aadharBack: files.aadharBack[0].path,
      panCard: files.panCard[0].path,
    };
    user.kycStatus = 'submitted';
    user.kycSubmittedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'KYC submitted successfully. Under review.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
