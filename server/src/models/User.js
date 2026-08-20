const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },

    // KYC
    kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
    kycDocuments: {
      aadharFront: { type: String },
      aadharBack: { type: String },
      panCard: { type: String },
    },
    kycRejectionReason: { type: String },
    kycSubmittedAt: { type: Date },
    kycApprovedAt: { type: Date },

    // Account Status
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Affiliate / referral
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralLevel: { type: Number, default: 0 },

    // Wallet
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    // Enrolled packages
    enrolledPackages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],

    // Bank details for payout
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      upiId: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
