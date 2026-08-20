/**
 * Convert array of payout requests to CSV format
 */
exports.generatePayoutCSV = (payouts) => {
  const headers = [
    'ID',
    'User Name',
    'User Email',
    'Amount (INR)',
    'Method',
    'Bank/UPI',
    'Account Number',
    'IFSC Code',
    'Status',
    'Requested At',
    'Approved At',
  ];

  const rows = payouts.map((p) => {
    const user = p.user || {};
    return [
      p._id.toString(),
      user.name || '',
      user.email || '',
      p.amount,
      p.paymentMethod,
      p.paymentMethod === 'upi' ? p.upiId || '' : p.bankDetails?.bankName || '',
      p.bankDetails?.accountNumber || '',
      p.bankDetails?.ifscCode || '',
      p.status,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '',
      p.approvedAt ? new Date(p.approvedAt).toLocaleDateString('en-IN') : '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csvContent;
};
