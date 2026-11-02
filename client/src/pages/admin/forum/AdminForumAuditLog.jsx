import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Award,
  Shield,
} from 'lucide-react';
import { adminForumService } from '../../../services/adminForumService';
import AdminForumNavHeader from '../../../components/admin/forum/AdminForumNavHeader';
import Card, { CardBody } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';

const AdminForumAuditLog = () => {
  const [action, setAction] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminForumAuditLogs', action, page],
    queryFn: async () => {
      const res = await adminForumService.getAuditLogs({
        action,
        page,
        limit: 20,
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const getActionBadge = (act) => {
    switch (act) {
      case 'publish_best_answers':
      case 'update_best_answers':
        return <Badge variant="primary">Best Answers Published</Badge>;
      case 'moderate_question':
      case 'moderate_answer':
        return <Badge variant="warning">Content Moderation</Badge>;
      case 'review_report':
      case 'dismiss_report':
        return <Badge variant="purple">Report Action</Badge>;
      case 'retry_reward':
        return <Badge variant="success">Reward Retry</Badge>;
      default:
        return <Badge variant="default">{act}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
      <AdminForumNavHeader
        title="Administrative Audit History"
        subtitle="Append-only record of best-answer publications, moderation decisions, report resolutions, and reward distributions."
        badge="Audit Trail"
      />

      {/* Filter Bar */}
      <Card className="border-[#E2E8F0]">
        <CardBody className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1E293B]">Filter Action:</span>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">All Actions</option>
              <option value="publish_best_answers">Best Answers Published</option>
              <option value="update_best_answers">Best Answers Updated</option>
              <option value="moderate_question">Question Moderation</option>
              <option value="moderate_answer">Answer Moderation</option>
              <option value="review_report">Report Reviewed</option>
              <option value="dismiss_report">Report Dismissed</option>
              <option value="retry_reward">Reward Retried</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 text-[#64748B] hover:text-[#06B6D4] rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </CardBody>
      </Card>

      {/* Audit Logs List */}
      <Card>
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError || !data?.success ? (
          <div className="p-12 text-center text-sm text-rose-500 font-semibold">
            Failed to load audit history.
          </div>
        ) : data.logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#64748B]">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No audit records found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {data.logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B] text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Administrator */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-[#1E293B] flex items-center justify-center font-bold text-[10px] uppercase">
                          {log.admin?.name ? log.admin.name[0] : 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1E293B] text-xs">
                            {log.admin?.name || 'Administrator'}
                          </p>
                          <p className="text-[10px] text-[#64748B]">{log.admin?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Event Details */}
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-[#1E293B] leading-relaxed">{log.details}</p>
                      {log.transactionRefs?.length > 0 && (
                        <p className="text-[10px] text-[#06B6D4] mt-0.5 font-medium">
                          Associated Txns: {log.transactionRefs.join(', ')}
                        </p>
                      )}
                    </td>

                    {/* Reference Link */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {log.question ? (
                        <Link
                          to={`/admin/forum/questions/${log.question._id || log.question}`}
                          className="text-[#06B6D4] hover:text-[#0891B2] font-semibold text-xs inline-flex items-center gap-1"
                        >
                          View Discussion <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {(page - 1) * 20 + 1} to{' '}
              {Math.min(page * 20, data.pagination.total)} of {data.pagination.total} audit events
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="font-semibold text-[#1E293B]">
                {page} / {data.pagination.totalPages}
              </span>

              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminForumAuditLog;