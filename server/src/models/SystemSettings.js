const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    // GST & Invoice Settings
    companyName: { type: String, default: 'CourseEarn Learning Technologies Pvt. Ltd.' },
    companyGstin: { type: String, default: '07AAAAA0000A1Z5' },
    companyAddress: { type: String, default: 'Tech Hub, Cyber City, Gurugram, Haryana - 122002' },
    companyEmail: { type: String, default: 'billing@courseearn.com' },
    companyPhone: { type: String, default: '+91 98765 43210' },
    taxRatePercent: { type: Number, default: 18 }, // GST %
    invoicePrefix: { type: String, default: 'INV-CE' },
    invoiceNotes: { type: String, default: 'Thank you for choosing CourseEarn. This is a computer generated invoice.' },

    // Certificate Manager Settings
    orgName: { type: String, default: 'CourseEarn Learning Academy' },
    signatoryName: { type: String, default: 'Dr. Rajesh Sharma' },
    signatoryTitle: { type: String, default: 'Director of Academic Affairs' },
    certificateTitle: { type: String, default: 'Certificate of Excellence & Completion' },
    autoIssueCertificate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
