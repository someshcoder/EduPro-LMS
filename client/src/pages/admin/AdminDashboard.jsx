import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Package, 
  UserCheck, 
  CreditCard, 
  ShieldAlert, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const response = await adminService.getDashboard();
      return response.data.stats;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${data?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      glow: 'glow-emerald',
    },
    {
      title: 'Total Users',
      value: data?.totalUsers?.toLocaleString() || 0,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10',
      glow: 'glow-indigo',
    },
    {
      title: 'Total Packages',
      value: data?.totalPackages || 0,
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      glow: 'glow-indigo',
    },
    {
      title: 'Pending KYC',
      value: data?.pendingKyc || 0,
      icon: UserCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      glow: '',
    },
    {
      title: 'Pending Payouts',
      value: data?.pendingPayouts || 0,
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      glow: '',
    },
    {
      title: 'Fraud Alerts',
      value: data?.unresolvedAlerts || 0,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      glow: '',
    },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Overview of platform metrics and pending actions.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-300">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card relative overflow-hidden ${stat.glow}`}>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-white tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                <Icon className="w-32 h-32" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder for Quick Actions or Recent Activity */}
        <div className="glass rounded-xl p-6 border border-slate-800">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-slate-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 rounded-lg transition-colors text-left group">
              <UserCheck className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-slate-200">Review KYC</div>
              <div className="text-xs text-slate-400 mt-1">{data?.pendingKyc || 0} pending</div>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-colors text-left group">
              <CreditCard className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-slate-200">Process Payouts</div>
              <div className="text-xs text-slate-400 mt-1">{data?.pendingPayouts || 0} pending</div>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-colors text-left group">
              <ShieldAlert className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-slate-200">Fraud Alerts</div>
              <div className="text-xs text-slate-400 mt-1">{data?.unresolvedAlerts || 0} unresolved</div>
            </button>
            <button className="p-4 bg-slate-800/50 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-colors text-left group">
              <Package className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-slate-200">Manage Packages</div>
              <div className="text-xs text-slate-400 mt-1">View catalog</div>
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-slate-800 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-700">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Platform Growth</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Detailed analytics and charts will be available in the upcoming update.
            Keep track of user growth, revenue, and active subscriptions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
