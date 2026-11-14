import React, { useRef, useState } from 'react';
import { X, Printer, Download, Receipt, Building2, CheckCircle2, ShieldCheck, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import {
  downloadInvoicePdf,
  numberToWordsINR,
  formatInvoiceDate,
  formatInvoiceTime,
} from '../../utils/invoicePdfGenerator';

const InvoiceModal = ({ invoice, onClose }) => {
  const invoiceRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!invoice) return null;

  const handlePrintReceipt = () => {
    window.print();
  };

  // Download Receipt handler (100% reliable direct PDF download)
  const handleDownloadReceipt = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const toastId = toast.loading('Generating official PDF receipt...');

    try {
      await downloadInvoicePdf(invoice, invoiceRef.current);
      toast.success('Receipt downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Could not download PDF. Please try again.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const halfTaxRate = ((invoice.taxRate || 18) / 2).toFixed(1);
  const invoiceDate = formatInvoiceDate(invoice.createdAt);
  const invoiceTime = formatInvoiceTime(invoice.createdAt);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[94vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Tax Invoice / Payment Receipt</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">#{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePrintReceipt}
              leftIcon={<Printer className="w-4 h-4 text-[#06B6D4]" />}
            >
              Print Receipt
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Container View */}
        <div className="p-3 sm:p-6 md:p-8 bg-slate-950/60 flex justify-center">
          {/* Printable Official Invoice Card - Pristine White with Crisp Typography */}
          <div
            ref={invoiceRef}
            id="printable-invoice"
            className="w-full max-w-3xl bg-white text-slate-800 rounded-xl border border-slate-200 p-5 sm:p-8 md:p-10 shadow-lg text-[13px] leading-relaxed"
          >
            {/* Top Bar: GST Statutory Badge */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Original For Recipient
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  (Under Section 31 of CGST Act, 2017)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Official GST Tax Invoice
                </span>
              </div>
            </div>

            {/* Header: Company Info (Left) & Invoice Meta (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
              {/* Company Info */}
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    CE
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {invoice.companyDetails?.legalName || 'CourseEarn Learning Technologies Pvt. Ltd.'}
                    </h1>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                  {invoice.companyDetails?.address || 'Tech Hub, Cyber City, Gurugram, Haryana - 122002'}
                </p>
                <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                  <p>
                    <strong className="text-slate-800">GSTIN:</strong>{' '}
                    <span className="font-mono font-semibold">{invoice.companyDetails?.gstin || '07AAAAA0000A1Z5'}</span>
                  </p>
                  <p>
                    <strong className="text-slate-800">CIN:</strong>{' '}
                    <span className="font-mono">U72900DL2024PTC123456</span>
                  </p>
                  <p>
                    <strong className="text-slate-800">Email:</strong> {invoice.companyDetails?.email || 'support@courseearn.com'}
                  </p>
                  <p>
                    <strong className="text-slate-800">Place of Supply:</strong> Haryana (State Code: 06)
                  </p>
                </div>
              </div>

              {/* Invoice Meta Box */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Invoice Summary
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
                      Paid in Full
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice No:</span>
                      <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Invoice Date:
                      </span>
                      <span className="font-semibold text-slate-800">{invoiceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Invoice Time:
                      </span>
                      <span className="font-semibold text-slate-800">{invoiceTime} IST</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/80 pt-1.5 mt-1.5">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-semibold text-slate-800">{invoice.paymentMethod || 'Online (Instant)'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To (Student) & Payment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {/* Student Details */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Billed To (Student / Customer):
                </p>
                <p className="text-sm font-bold text-slate-900">{invoice.billingDetails?.name || invoice.user?.name || 'Student'}</p>
                <p className="text-xs text-slate-600 mt-0.5">{invoice.billingDetails?.email || invoice.user?.email || 'N/A'}</p>
                {invoice.billingDetails?.phone && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>Phone:</strong> {invoice.billingDetails.phone}
                  </p>
                )}
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>State / Jurisdiction:</strong> {invoice.billingDetails?.state || 'Delhi, India'}
                </p>
              </div>

              {/* Transaction / Settlement Record */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Transaction & Settlement Record:
                </p>
                <p className="text-xs text-slate-700">
                  <strong className="text-slate-900">Transaction Ref:</strong>{' '}
                  <span className="font-mono text-slate-800">{invoice.paymentRef || 'N/A'}</span>
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  <strong className="text-slate-900">Date & Time:</strong> {invoiceDate} at {invoiceTime}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Verified & Successful</span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3.5 text-center w-10">#</th>
                    <th className="py-3 px-3.5">Course / Service Description</th>
                    <th className="py-3 px-3 text-center">SAC Code</th>
                    <th className="py-3 px-3 text-right">Base Price</th>
                    <th className="py-3 px-3 text-right">Discount</th>
                    <th className="py-3 px-3.5 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-3.5 px-3.5 text-center font-medium text-slate-500">1</td>
                    <td className="py-3.5 px-3.5">
                      <p className="font-bold text-slate-900 text-[13px]">{invoice.packageName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Full Lifetime Access • Verified Completion Certificate • Digital Content Access
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">999293</td>
                    <td className="py-3.5 px-3 text-right font-medium">
                      ₹{(invoice.basePrice || invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-emerald-600">
                      {invoice.discountAmount > 0
                        ? `-₹${invoice.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '₹0.00'}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-bold text-slate-900">
                      ₹{invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Calculation & Totals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 pb-6 border-b border-slate-200">
              {/* Amount in words & Notes */}
              <div className="md:col-span-7 space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    Total Amount in Words:
                  </p>
                  <p className="text-xs font-semibold text-slate-900 italic">
                    {numberToWordsINR(invoice.totalAmount)}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 leading-normal pt-1">
                  <p className="font-bold text-slate-700">Terms & Statutory Declarations:</p>
                  <p>1. This is a computer-generated invoice issued in compliance with Section 31 of the CGST Act, 2017 and does not require a physical signature.</p>
                  <p>2. SAC 999293 covers Commercial training & coaching services delivered via digital e-learning platforms.</p>
                  <p>3. Fees paid are inclusive of applicable GST (CGST + SGST @ 18%).</p>
                </div>
              </div>

              {/* Summary Calculation Box */}
              <div className="md:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount (Subtotal):</span>
                  <span className="font-semibold text-slate-800">
                    ₹{invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST ({halfTaxRate}%):</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(invoice.cgst || (invoice.taxAmount / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST ({halfTaxRate}%):</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(invoice.sgst || (invoice.taxAmount / 2)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1.5 font-medium">
                  <span>Total Tax (GST {invoice.taxRate || 18}%):</span>
                  <span className="text-slate-800">
                    ₹{invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-xs uppercase tracking-wider">Total Amount Paid:</span>
                  <span className="text-base text-emerald-700 font-extrabold font-mono">
                    ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Authentication & Seal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Digitally Certified Document</strong> • Verified by CourseEarn LMS Automated Billing Engine
                </span>
              </div>
              <div className="text-center sm:text-right">
                <p className="font-bold text-slate-800">For CourseEarn Learning Technologies Pvt. Ltd.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Authorised Signatory (System Generated)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden in Print) */}
        <div className="no-print px-4 sm:px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Official GST Invoice for CourseEarn LMS • Instant Verified PDF</span>
          </div>

          <Button
            onClick={handleDownloadReceipt}
            isLoading={isDownloading}
            className="w-full sm:w-auto shadow-md"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;