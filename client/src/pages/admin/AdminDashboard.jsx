import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  UserCheck, 
  CreditCard, 
  ShieldAlert, 
  DollarSign,
  TrendingUp,
  Activity,
  Receipt,
  Award,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const response = await adminService.getDashboard();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-[#E2E8F0] rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="stat-card h-32 animate-pulse bg-slate-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1E293B]">Failed to load statistics</h2>
        <p className="text-[#64748B] mt-2">There was an error fetching the dashboard data.</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    {
      title: 'Company Net Profit',
      value: `₹${(stats.netProfit || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border border-emerald-200',
      accent: 'border-l-4 border-l-emerald-500',
    },
    {
      title: 'Gross Sales Revenue',
      value: `₹${(stats.totalSales || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      iconColor: 'text-[#06B6D4]',
      iconBg: 'bg-cyan-50 border border-cyan-200',
      accent: 'border-l-4 border-l-[#06B6D4]',
    },
    {
      title: 'Total Commissions',
      value: `₹${(stats.totalCommissions || 0).toLocaleString('en-IN')}`,
      icon: Users,
      iconColor: 'text-[#8B5CF6]',
      iconBg: 'bg-violet-50 border border-violet-200',
      accent: 'border-l-4 border-l-[#8B5CF6]',
    },
    {
      title: 'Total Registered Users',
      value: (stats.totalUsers || 0).toLocaleString('en-IN'),
      icon: Users,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border border-sky-200',
      accent: '',
    },
    {
      title: 'Active Packages',
      value: stats.totalPackages || 0,
      icon: Package,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border border-amber-200',
      accent: '',
    },
    {
      title: 'Pending KYC Review',
      value: stats.pendingKyc || 0,
      icon: UserCheck,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50 border border-orange-200',
      accent: stats.pendingKyc > 0 ? 'border-l-4 border-l-orange-500' : '',
    },
    {
      title: 'Pending Payouts',
      value: stats.pendingPayouts || 0,
      icon: CreditCard,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border border-blue-200',
      accent: stats.pendingPayouts > 0 ? 'border-l-4 border-l-blue-500' : '',
    },
    {
      title: 'Fraud Security Alerts',
      value: stats.unresolvedAlerts || 0,
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border border-rose-200',
      accent: stats.unresolvedAlerts > 0 ? 'border-l-4 border-l-rose-500' : '',
    },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Admin Executive Dashboard</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Real-time business performance, net profit analysis, and operational controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/analytics')} leftIcon={<BarChart3 className="w-4 h-4" />}>
            Analytics & Reports
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D1FAE5] border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Monitoring
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`stat-card relative overflow-hidden ${stat.accent}`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black text-[#1E293B] tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Finance & Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-[#06B6D4]" />
            </div>
            Financial & Tax Controls
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Manage tax rates (18% GST), company GSTIN credentials, and view comprehensive net profit reports.
          </p>
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/invoice-settings')}>
              <span>GST & Invoice Settings</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/analytics')}>
              <span>Full Financial Reports</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/payouts')}>
              <span>Process Payouts ({stats.pendingPayouts || 0})</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
          </div>
        </div>

        {/* Module 2: Academic & Certificates */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            Certificates & Courses
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Configure completion certificate templates, authorized academic signatory, and curriculum video uploads.
          </p>
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/certificate-settings')}>
              <span>Certificate Manager</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/packages')}>
              <span>Packages & Commission Tiers</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/videos')}>
              <span>Video Curriculum Manager</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
          </div>
        </div>

        {/* Module 3: Security & Verification */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            User Verification & Safety
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Review submitted government ID documents, track active sessions, and resolve automated fraud alerts.
          </p>
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/kyc')}>
              <span>KYC Review ({stats.pendingKyc || 0} Pending)</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/users')}>
              <span>User Directory & Blocklist</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/fraud-alerts')}>
              <span>Security Alerts ({stats.unresolvedAlerts || 0})</span>
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
