import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Award, Receipt, 
  ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck, Eye 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
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
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Business Analytics & Net Profit</h1>
            <p className="text-slate-400 text-sm">
              Comprehensive financial breakdown, sales revenue, net profit margin, and top performers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Financial KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/20">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
              <p className="text-2xl font-black text-white mt-1">₹{(stats.totalSales || 0).toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Total Course Enrolments
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950/20">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Commissions</p>
              <p className="text-2xl font-black text-purple-400 mt-1">
                ₹{(stats.totalCommissions || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Direct + Indirect Payouts</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-emerald-500/40 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Company Net Profit</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                ₹{(stats.netProfit || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-300 mt-1">Revenue - Commissions</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-blue-500/30 bg-gradient-to-br from-slate-900 to-blue-950/20">
          <CardBody className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GST Tax Collected</p>
              <p className="text-2xl font-black text-blue-400 mt-1">
                ₹{(stats.totalTaxCollected || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">18% GST on all sales</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
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
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Top Affiliate Earners</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {topAffiliates.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {topAffiliates.map((aff, index) => (
                  <div key={aff._id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0 ? 'bg-amber-400 text-slate-950' : index === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{aff.name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{aff.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">₹{(aff.totalEarnings || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-500">Balance: ₹{(aff.walletBalance || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-slate-500 text-xs">No affiliate earnings recorded yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Recent Invoices & Sales Stream */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Recent Invoices & Transactions</h2>
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
                        <td className="font-mono text-indigo-300 text-xs font-semibold">{inv.invoiceNumber}</td>
                        <td>
                          <div className="text-xs font-medium text-white">{inv.billingDetails?.name || inv.user?.name}</div>
                          <div className="text-[10px] text-slate-400">{inv.billingDetails?.email || inv.user?.email}</div>
                        </td>
                        <td className="text-xs text-slate-300">{inv.packageName}</td>
                        <td className="text-xs font-bold text-emerald-400">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="text-xs text-slate-400">
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
              <p className="p-6 text-center text-slate-500 text-xs">No invoices generated yet.</p>
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
