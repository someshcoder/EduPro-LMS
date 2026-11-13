import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Award, Receipt, 
  ArrowUpRight, CreditCard, Eye 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import InvoiceModal from '../../components/common/InvoiceModal';

const AdminAnalytics = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const res = await adminService.getDashboard();
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const topAffiliates = data?.topAffiliates || [];
  const recentInvoices = data?.recentInvoices || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Business Analytics & Net Profit</h1>
            <p className="text-[#64748B] text-sm">
              Comprehensive financial breakdown, sales revenue, net profit margin, and top performers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Financial KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#06B6D4]">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Gross Sales Revenue</p>
              <p className="text-2xl font-black text-[#1E293B] mt-1">₹{(stats.totalSales || 0).toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Total Course Enrolments
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[#06B6D4]">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-[#8B5CF6]">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Commissions</p>
              <p className="text-2xl font-black text-[#8B5CF6] mt-1">
                ₹{(stats.totalCommissions || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Direct + Indirect Payouts</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-200 text-[#8B5CF6]">
              <Users className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Company Net Profit</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                ₹{(stats.netProfit || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">Revenue - Commissions</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">GST Tax Collected</p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                ₹{(stats.totalTaxCollected || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">18% GST on all sales</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Affiliates Leaderboard */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-[#1E293B]">Top Affiliate Earners</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {topAffiliates.length > 0 ? (
              <div className="divide-y divide-[#F1F5F9]">
                {topAffiliates.map((aff, index) => (
                  <div key={aff._id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0 ? 'bg-amber-400 text-[#1E293B]' : index === 1 ? 'bg-slate-300 text-[#1E293B]' : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1E293B]">{aff.name}</p>
                        <p className="text-[11px] text-[#64748B] truncate max-w-[130px]">{aff.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">₹{(aff.totalEarnings || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-[#64748B]">Balance: ₹{(aff.walletBalance || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-[#64748B] text-xs">No affiliate earnings recorded yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Recent Invoices & Sales Stream */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-lg font-bold text-[#1E293B]">Recent Invoices & Transactions</h2>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {recentInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Customer</th>
                      <th>Package</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((inv) => (
                      <tr key={inv._id}>
                        <td className="font-mono text-[#06B6D4] text-xs font-semibold">{inv.invoiceNumber}</td>
                        <td>
                          <div className="text-xs font-medium text-[#1E293B]">{inv.billingDetails?.name || inv.user?.name}</div>
                          <div className="text-[10px] text-[#64748B]">{inv.billingDetails?.email || inv.user?.email}</div>
                        </td>
                        <td className="text-xs text-[#64748B]">{inv.packageName}</td>
                        <td className="text-xs font-bold text-emerald-600">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="text-xs text-[#64748B]">
                          {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedInvoice(inv)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-6 text-center text-[#64748B] text-xs">No invoices generated yet.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};

export default AdminAnalytics;
