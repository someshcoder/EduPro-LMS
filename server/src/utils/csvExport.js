/**
 * Convert array of payout requests to Professional Banking & Audit CSV format
 */
exports.generatePayoutCSV = (payouts = []) => {
  const headers = [
    'Payout ID',
    'Request Date',
    'Request Time',
    'Student Name',
    'Student Email',
    'Student Phone',
    'Amount (INR)',
    'Payment Method',
    'Beneficiary Name',
    'Bank Name',
    'Account Number',
    'IFSC Code',
    'UPI VPA ID',
    'Status',
    'Transaction UTR / Ref',
    'Approved At',
    'Paid At',
    'Admin Remarks',
    'Student Request Note',
  ];

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return `${formatDate(date)} ${formatTime(date)} IST`;
  };

  const rows = payouts.map((p) => {
    const user = p.user || {};
    const bank = p.bankDetails || {};
    const method = (p.paymentMethod || 'bank').toUpperCase();

    const values = [
      p._id ? p._id.toString() : '',
      formatDate(p.createdAt),
      formatTime(p.createdAt),
      user.name || '',
      user.email || '',
      user.phone || '',
      p.amount !== undefined ? Number(p.amount).toFixed(2) : '0.00',
      method,
      bank.accountHolder || user.name || '',
      method === 'BANK' ? (bank.bankName || '') : 'N/A',
      method === 'BANK' ? (bank.accountNumber || '') : 'N/A',
      method === 'BANK' ? (bank.ifscCode || '') : 'N/A',
      method === 'UPI' ? (p.upiId || '') : 'N/A',
      (p.status || 'pending').toUpperCase(),
      p.transactionRef || '',
      formatDateTime(p.approvedAt),
      formatDateTime(p.paidAt),
      p.adminNote || '',
      p.requestNote || '',
    ];

    return values.map((val) => {
      let str = String(val ?? '').replace(/"/g, '""');
      // Prevent CSV / Excel formula injection (OWASP guideline)
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    });
  });

  // UTF-8 BOM (\uFEFF) at start ensures Microsoft Excel renders special characters properly on Windows
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  return csvContent;
};
