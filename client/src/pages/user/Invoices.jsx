import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  Download,
  Eye,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Layers,
  BookOpen,
  Zap,
} from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { parentPackageService } from '../../services/parentPackageService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import InvoiceModal from '../../components/common/InvoiceModal';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' | 'invoices'

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: async () => {
      const res = await invoiceService.getMyInvoices();
      return res.data.invoices || [];
    },
  });

  const { data: purchases = [], isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['myPurchaseHistory'],
    queryFn: async () => {
      const res = await parentPackageService.getPurchaseHistory();
      return res.data.history || [];
    },
  });

  const isLoading = isLoadingInvoices || isLoadingPurchases;

  const handleViewInvoiceByNumber = (invoiceNumber) => {
    const matched = invoices.find((inv) => inv.invoiceNumber === invoiceNumber);
    if (matched) {
      setSelectedInvoice(matched);
    } else {
      // Fallback: build invoice preview
      setSelectedInvoice({
        invoiceNumber,
        packageName: 'Course / Package Enrollment',
        totalAmount: 0,
        taxAmount: 0,
        taxableAmount: 0,
        createdAt: new Date(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            Purchases & Invoices
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Track your 1-year access validity, package upgrades, and download official GST tax receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/packages')}>
            View Packages
          </Button>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'purchases'
              ? 'bg-white text-[#1E293B] shadow-xs'
              : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Access Validity & History ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'invoices'
              ? 'bg-white text-[#1E293B] shadow-xs'
              : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>GST Invoices ({invoices.length})</span>
        </button>
      </div>

      {/* TAB 1: PURCHASE HISTORY & 1-YEAR VALIDITY */}
      {activeTab === 'purchases' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#06B6D4]" />
              <h2 className="text-lg font-bold text-[#1E293B]">
                Active Purchases & Expiry Timeline
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {purchases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item / Package</th>
                      <th>Type</th>
                      <th>Purchase Date</th>
                      <th>Access Expiry (1 Year)</th>
                      <th>Amount Paid</th>
                      <th>Status</th>
                      <th className="text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((item) => {
                      const isExpired = item.status === 'expired' || item.isExpired;
                      const isUpgraded = item.status === 'upgraded';

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="font-bold text-[#1E293B]">{item.title}</div>
                            <div className="text-xs text-[#94A3B8] font-mono">
                              Invoice #{item.invoiceNumber}
                            </div>
                          </td>
                          <td>
                            {item.itemType === 'parent_package' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-[#0891B2] border border-cyan-200">
                                <Layers className="w-3 h-3" /> Parent Package
                              </span>
                            ) : item.itemType === 'package_upgrade' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Zap className="w-3 h-3" /> Upgrade
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-[#64748B]">
                                <BookOpen className="w-3 h-3" /> Course
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                              {new Date(item.purchaseDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </td>
                          <td>
                            <div className="space-y-0.5">
                              <div className="text-xs font-semibold text-[#1E293B]">
                                {new Date(item.expiresAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              {!isExpired && !isUpgraded && (
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {item.daysRemaining} days left
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="font-bold text-emerald-600">
                              ₹{item.amountPaid?.toLocaleString('en-IN')}
                            </div>
                            {item.previousPaidAdjusted > 0 && (
                              <div className="text-[10px] text-[#06B6D4]">
                                (Adjusted ₹{item.previousPaidAdjusted})
                              </div>
                            )}
                          </td>
                          <td>
                            {isUpgraded ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Upgraded
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewInvoiceByNumber(item.invoiceNumber)}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                            >
                              View Invoice
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
                  <Clock className="w-8 h-8 text-[#94A3B8]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-1">No Purchase Records Yet</h3>
                <p className="text-[#64748B] text-sm max-w-sm mx-auto mb-6">
                  Purchases provide 1-year unlimited access with certified completion and upgrade adjustment benefits.
                </p>
                <Button onClick={() => navigate('/packages')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Packages
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 2: OFFICIAL GST INVOICES */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#06B6D4]" />
              <h2 className="text-lg font-bold text-[#1E293B]">Official GST Invoices ({invoices.length})</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {invoices && invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Course / Package</th>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Tax (GST)</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td className="font-mono text-[#06B6D4] font-semibold">{inv.invoiceNumber}</td>
                        <td>
                          <div className="font-medium text-[#1E293B]">{inv.packageName}</div>
                          <div className="text-xs text-[#64748B]">Ref: {inv.paymentRef || 'Online'}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-[#64748B]">
                            <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="font-bold text-emerald-600">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="text-xs text-[#64748B]">
                          ₹{inv.taxAmount?.toLocaleString('en-IN')} ({inv.taxRate}%)
                        </td>
                        <td>
                          <Badge variant="success">Paid</Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedInvoice(inv)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View / Print
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
                  <Receipt className="w-8 h-8 text-[#94A3B8]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1E293B] mb-1">No Invoices Found</h3>
                <p className="text-[#64748B] text-sm max-w-sm mx-auto mb-6">
                  You have not purchased any course packages yet. Enrolling in courses will generate instant GST tax invoices.
                </p>
                <Button onClick={() => navigate('/courses')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Courses
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};

export default Invoices;
