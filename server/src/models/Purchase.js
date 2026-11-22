const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: {
      type: String,
      enum: ['parent_package', 'course', 'package_upgrade'],
      required: true,
    },
    parentPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'ParentPackage' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' }, // for single course purchases
    grantedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }], // all individual course IDs unlocked by this purchase

    // Package Upgrade Tracking
    upgradedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
    previousPaidAdjusted: { type: Number, default: 0 },

    // Financial Breakdown
    basePrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // net paid after upgrade adjustment or discount

    // Payment details
    paymentMethod: { type: String, default: 'Online' },
    paymentRef: { type: String, required: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    invoiceNumber: { type: String, required: true },

    // Access Status & 1-Year Validity
    status: {
      type: String,
      enum: ['active', 'expired', 'refunded', 'cancelled', 'upgraded'],
      default: 'active',
      index: true,
    },
    purchaseDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true }, // 1 Year (365 days) from purchaseDate

    // Audit timestamps
    refundedAt: { type: Date },
    cancelledAt: { type: Date },
    adminRemarks: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema);
