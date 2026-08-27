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
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="stat-card h-32 animate-pulse bg-slate-800/50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center mt-12">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Failed to load statistics</h2>
        <p className="text-slate-400 mt-2">There was an error fetching the dashboard data.</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    {
      title: 'Company Net Profit',
      value: `₹${(stats.netProfit || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      glow: 'border-emerald-500/40 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900',
    },
    {
      title: 'Gross Sales Revenue',
      value: `₹${(stats.totalSales || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10',
      glow: 'border-indigo-500/30',
    },
    {
      title: 'Total Commissions',
      value: `₹${(stats.totalCommissions || 0).toLocaleString('en-IN')}`,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      glow: 'border-purple-500/30',
    },
    {
      title: 'Total Registered Users',
      value: (stats.totalUsers || 0).toLocaleString('en-IN'),
      icon: Users,
      color: 'text-sky-400',
      bgColor: 'bg-sky-400/10',
      glow: '',
    },
    {
      title: 'Active Packages',
      value: stats.totalPackages || 0,
      icon: Package,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      glow: '',
    },
    {
      title: 'Pending KYC Review',
      value: stats.pendingKyc || 0,
      icon: UserCheck,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      glow: stats.pendingKyc > 0 ? 'border-amber-500/40' : '',
    },
    {
      title: 'Pending Payouts',
      value: stats.pendingPayouts || 0,
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      glow: stats.pendingPayouts > 0 ? 'border-blue-500/40' : '',
    },
    {
      title: 'Fraud Security Alerts',
      value: stats.unresolvedAlerts || 0,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      glow: stats.unresolvedAlerts > 0 ? 'border-rose-500/40' : '',
    },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Executive Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time business performance, net profit analysis, and operational controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/analytics')} leftIcon={<BarChart3 className="w-4 h-4" />}>
            Analytics & Reports
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
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
              className={`stat-card relative overflow-hidden transition-all duration-200 hover:border-slate-600 ${stat.glow}`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color}`}>
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
        <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            Financial & Tax Controls
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Manage tax rates (18% GST), company GSTIN credentials, and view comprehensive net profit reports.
          </p>
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/invoice-settings')}>
              <span>GST & Invoice Settings</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/analytics')}>
              <span>Full Financial Reports</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/payouts')}>
              <span>Process Payouts ({stats.pendingPayouts || 0})</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Module 2: Academic & Certificates */}
        <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Certificates & Courses
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure completion certificate templates, authorized academic signatory, and curriculum video uploads.
          </p>
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/certificate-settings')}>
              <span>Certificate Manager</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/packages')}>
              <span>Packages & Commission Tiers</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/videos')}>
              <span>Video Curriculum Manager</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Module 3: Security & Verification */}
        <div className="glass rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            User Verification & Safety
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review submitted government ID documents, track active sessions, and resolve automated fraud alerts.
          </p>
          <div className="space-y-2 pt-2">
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/kyc')}>
              <span>KYC Review ({stats.pendingKyc || 0} Pending)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/users')}>
              <span>User Directory & Blocklist</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="secondary" className="w-full justify-between" size="sm" onClick={() => navigate('/admin/fraud-alerts')}>
              <span>Security Alerts ({stats.unresolvedAlerts || 0})</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
