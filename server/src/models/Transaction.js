const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['commission', 'payout', 'bonus', 'deduction', 'purchase'],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String },
    reference: { type: String }, // order ID, payout ID, etc.
    status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'completed' },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who triggered the commission
    level: { type: Number }, // 1 = direct, 2 = indirect
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
    balanceAfter: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
