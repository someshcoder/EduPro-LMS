import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Coins,
  ShieldAlert,
  History,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const navTabs = [
  { to: '/admin/forum', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/forum/questions', label: 'Discussions', icon: MessageSquare },
  { to: '/admin/forum/rewards', label: 'Reward Engine', icon: Coins },
  { to: '/admin/forum/reports', label: 'Reports', icon: ShieldAlert },
  { to: '/admin/forum/audit', label: 'Audit Trail', icon: History },
];

const AdminForumNavHeader = ({ title, subtitle, badge }) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-[#06B6D4] border border-cyan-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/forum"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#06B6D4] bg-white border border-[#E2E8F0] rounded-xl hover:border-cyan-300 transition-all shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Forum Feed
          </a>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
                  isActive
                    ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-sm shadow-cyan-500/20'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 bg-white border border-[#E2E8F0]'
                )
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default AdminForumNavHeader;

