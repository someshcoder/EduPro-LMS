import React, { useRef } from 'react';
import { X, Printer, Download, Receipt, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from './Button';

const InvoiceModal = ({ invoice, onClose }) => {
  const invoiceRef = useRef(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const halfTaxRate = ((invoice.taxRate || 18) / 2).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tax Invoice / Payment Receipt</h2>
              <p className="text-xs text-slate-400">#{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print / PDF
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="p-6 md:p-8 bg-slate-950/40">
          <div
            ref={invoiceRef}
            id="printable-invoice"
            className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 p-8 md:p-10 shadow-xl"
          >
            {/* Header: Company & Invoice Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    CE
                  </div>
                  <h1 className="text-xl font-bold text-white">
                    {invoice.companyDetails?.legalName || 'CourseEarn Learning Technologies Pvt. Ltd.'}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  {invoice.companyDetails?.address || 'Tech Hub, Cyber City, Gurugram, Haryana - 122002'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  <strong>GSTIN:</strong> {invoice.companyDetails?.gstin || '07AAAAA0000A1Z5'}
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Email:</strong> {invoice.companyDetails?.email || 'support@courseearn.com'}
                </p>
              </div>

              <div className="text-left md:text-right bg-slate-800/40 p-4 rounded-xl border border-slate-800 min-w-[200px]">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider mb-2">
                  Tax Invoice
                </span>
                <p className="text-sm font-bold text-white font-mono">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400">
                  Payment: <span className="text-indigo-400 font-medium">{invoice.paymentMethod || 'Online'}</span>
                </p>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-800/20 border border-slate-800/80">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To (Student):</p>
                <p className="text-sm font-bold text-white">{invoice.billingDetails?.name || invoice.user?.name}</p>
                <p className="text-xs text-slate-400">{invoice.billingDetails?.email || invoice.user?.email}</p>
                {invoice.billingDetails?.phone && (
                  <p className="text-xs text-slate-400">Phone: {invoice.billingDetails.phone}</p>
                )}
                {invoice.billingDetails?.state && (
                  <p className="text-xs text-slate-400">State: {invoice.billingDetails.state}</p>
                )}
              </div>
              <div className="md:text-right">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transaction Details:</p>
                <p className="text-xs text-slate-300 font-mono">Ref: {invoice.paymentRef || 'N/A'}</p>
                <div className="mt-2 flex md:justify-end items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Payment Completed
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Course / Item Description</th>
                    <th className="pb-3 text-right">Base Price</th>
                    <th className="pb-3 text-right">Discount</th>
                    <th className="pb-3 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-4">
                      <p className="font-semibold text-white">{invoice.packageName}</p>
                      <p className="text-xs text-slate-400">Full Lifetime Access + Verified Certification</p>
                    </td>
                    <td className="py-4 text-right">₹{(invoice.basePrice || invoice.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="py-4 text-right text-emerald-400">
                      {invoice.discountAmount > 0 ? `-₹${invoice.discountAmount.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="py-4 text-right font-medium text-white">₹{invoice.taxableAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals & Tax Breakdown */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-slate-800 pt-6">
              <div className="text-xs text-slate-400 max-w-sm">
                <p className="font-semibold text-slate-300 mb-1">Terms & Conditions:</p>
                <p>1. This is a system generated computer invoice and does not require physical signature.</p>
                <p>2. Fees paid are inclusive of applicable Goods and Services Tax (GST).</p>
              </div>

              <div className="w-full md:w-72 space-y-2 text-sm bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Taxable Amount:</span>
                  <span>₹{invoice.taxableAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>CGST ({halfTaxRate}%):</span>
                  <span>₹{(invoice.cgst || (invoice.taxAmount / 2)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>SGST ({halfTaxRate}%):</span>
                  <span>₹{(invoice.sgst || (invoice.taxAmount / 2)).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base text-white">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-400">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">Official GST Invoice for CourseEarn LMS</p>
          <Button onClick={handlePrint} leftIcon={<Download className="w-4 h-4" />}>
            Download / Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
