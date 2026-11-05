const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    packageName: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    taxRate: { type: Number, default: 18 }, // GST %
    taxAmount: { type: Number, required: true }, // CGST + SGST or IGST
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Online' },
    paymentRef: { type: String },
    status: { type: String, enum: ['paid', 'refunded', 'cancelled'], default: 'paid' },
    billingDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
      state: { type: String },
    },
    companyDetails: {
      legalName: { type: String, default: 'CourseEarn Learning Technologies Pvt. Ltd.' },
      gstin: { type: String, default: '07AAAAA0000A1Z5' },
      address: { type: String, default: 'Tech Hub, Cyber City, Gurugram, Haryana - 122002' },
      email: { type: String, default: 'support@courseearn.com' },
      phone: { type: String, default: '+91 98765 43210' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
