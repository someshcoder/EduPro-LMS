import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Download, Eye, Calendar, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import InvoiceModal from '../../components/common/InvoiceModal';
import { useNavigate } from 'react-router-dom';

const Invoices = () => {
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: async () => {
      const res = await invoiceService.getMyInvoices();
      return res.data.invoices;
    },
  });

  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Invoices & Payment Receipts</h1>
          <p className="text-[#64748B] text-sm mt-1">
            View, verify, and download official GST invoices for all your enrolled courses.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/courses')}>
          Browse More Courses
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#06B6D4]" />
            <h2 className="text-lg font-bold text-[#1E293B]">Payment History ({data?.length || 0})</h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {data && data.length > 0 ? (
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
                  {data.map((inv) => (
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
                      <td className="font-bold text-emerald-400">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
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

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};

export default Invoices;
