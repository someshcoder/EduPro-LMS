import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  EyeOff,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { adminForumService } from '../../../services/adminForumService';
import AdminForumNavHeader from '../../../components/admin/forum/AdminForumNavHeader';
import Card, { CardBody } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

const AdminForumReports = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');
  const [targetType, setTargetType] = useState('all');
  const [page, setPage] = useState(1);

  // Review modal state
  const [activeReport, setActiveReport] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('reviewed');
  const [actionTaken, setActionTaken] = useState('none');
  const [moderationReason, setModerationReason] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminForumReports', status, targetType, page],
    queryFn: async () => {
      const res = await adminForumService.getReports({
        status,
        targetType,
        page,
        limit: 15,
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, actionTaken, moderationReason }) =>
      adminForumService.reviewReport(id, { status, actionTaken, moderationReason }),
    onSuccess: () => {
      toast.success('Report resolved and moderation action recorded');
      queryClient.invalidateQueries(['adminForumReports']);
      queryClient.invalidateQueries(['adminForumDashboardStats']);
      setActiveReport(null);
      setModerationReason('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update report');
    },
  });

  const handleOpenReview = (report, defaultDecision = 'reviewed', defaultAction = 'none') => {
    setActiveReport(report);
    setReviewDecision(defaultDecision);
    setActionTaken(defaultAction);
    setModerationReason('');
  };

  const handleExecuteReview = () => {
    if (!activeReport) return;
    reviewMutation.mutate({
      id: activeReport._id,
      status: reviewDecision,
      actionTaken,
      moderationReason,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <AdminForumNavHeader
        title="Reported Content Moderation"
        subtitle="Review student-flagged discussions and answers. Protect community guidelines and record decisions."
        badge="Community Safety"
      />

      {/* Filter Bar */}
      <Card className="border-[#E2E8F0]">
        <CardBody className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              id="report-status-filter"
              name="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed (Action Taken)</option>
              <option value="dismissed">Dismissed (Safe)</option>
            </select>

            <select
              id="report-target-filter"
              name="targetType"
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Target: All Content</option>
              <option value="question">Discussions Only</option>
              <option value="answer">Answers Only</option>
            </select>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 text-[#64748B] hover:text-[#06B6D4] rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh reports"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </CardBody>
      </Card>

      {/* Reports Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError || !data?.success ? (
          <div className="p-12 text-center text-sm text-rose-500 font-semibold">
            Failed to load reported content.
          </div>
        ) : data.reports.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#64748B]">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            No content reports found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">Flagged Content</th>
                  <th className="py-3 px-4">Report Details</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {data.reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Flagged Content Preview */}
                    <td className="py-4 px-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#64748B]">
                          {rep.targetType}
                        </span>
                        {rep.targetContent?.status === 'hidden' && (
                          <Badge variant="danger">Content Hidden</Badge>
                        )}
                      </div>

                      {rep.targetType === 'question' ? (
                        <div>
                          <p className="font-bold text-[#1E293B] line-clamp-1">
                            {rep.targetContent?.title || 'Discussion not found'}
                          </p>
                          <p className="text-[11px] text-[#64748B] line-clamp-1">
                            {rep.targetContent?.description}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[11px] text-[#1E293B] line-clamp-2 italic bg-slate-50 p-1.5 rounded-lg border border-[#F1F5F9]">
                            "{rep.targetContent?.content || 'Answer content not found'}"
                          </p>
                          {rep.targetContent?.question && (
                            <p className="text-[10px] text-[#64748B] mt-0.5">
                              on discussion: <strong>{rep.targetContent.question.title}</strong>
                            </p>
                          )}
                        </div>
                      )}

                      {rep.targetContent?.author && (
                        <p className="text-[10px] text-[#64748B] mt-1">
                          Author: <strong className="text-[#1E293B]">{rep.targetContent.author.name}</strong> ({rep.targetContent.author.email})
                        </p>
                      )}
                    </td>

                    {/* Report Reason & Details */}
                    <td className="py-4 px-4 max-w-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 capitalize">
                        {rep.reason}
                      </span>
                      {rep.details ? (
                        <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                          {rep.details}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1 italic">No extra notes</p>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-semibold text-[#1E293B] text-xs">
                        {rep.reporter?.name || 'Anonymous'}
                      </p>
                      <p className="text-[10px] text-[#64748B]">{rep.reporter?.email}</p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {rep.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending
                        </span>
                      ) : rep.status === 'reviewed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#D1FAE5] text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-[#64748B] border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-500" /> Dismissed
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-[#64748B] text-[11px]">
                      {new Date(rep.createdAt).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {rep.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleOpenReview(rep, 'reviewed', 'hide')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            >
                              Hide Content
                            </button>
                            <button
                              onClick={() => handleOpenReview(rep, 'dismissed', 'none')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-[#64748B] hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenReview(rep, rep.status, 'none')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white text-[#06B6D4] hover:bg-cyan-50 border border-[#E2E8F0] transition-colors cursor-pointer"
                          >
                            Update Decision
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <span>
              Showing {(page - 1) * 15 + 1} to{' '}
              {Math.min(page * 15, data.pagination.total)} of {data.pagination.total} reports
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

      {/* Review Modal */}
      <Modal
        isOpen={!!activeReport}
        onClose={() => setActiveReport(null)}
        title="Resolve Content Flag"
      >
        <div className="space-y-4 text-xs">
          <div>
            <p className="font-bold text-[#1E293B]">
              Reason reported: <span className="text-rose-600 capitalize">{activeReport?.reason}</span>
            </p>
            {activeReport?.details && (
              <p className="text-[#64748B] mt-1 bg-slate-50 p-2 rounded-lg border border-[#E2E8F0]">
                "{activeReport.details}"
              </p>
            )}
          </div>

          <div>
            <label htmlFor="report-decision-select" className="block font-semibold text-[#1E293B] mb-1">Moderation Decision</label>
            <select
              id="report-decision-select"
              name="reviewDecision"
              value={reviewDecision}
              onChange={(e) => setReviewDecision(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="reviewed">Reviewed (Violation Confirmed)</option>
              <option value="dismissed">Dismissed (No Violation / Safe Content)</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-action-select" className="block font-semibold text-[#1E293B] mb-1">Content Action</label>
            <select
              id="report-action-select"
              name="actionTaken"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="none">Take No Content Action (Keep as is)</option>
              <option value="hide">Hide Flagged Content from Public Feed</option>
              <option value="delete">Soft-Delete Flagged Content</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-moderation-note" className="block font-semibold text-[#1E293B] mb-1">
              Internal Moderation Note (Saved to Audit Log)
            </label>
            <textarea
              id="report-moderation-note"
              name="moderationReason"
              rows={3}
              placeholder="Provide reason for this resolution..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              onClick={() => setActiveReport(null)}
              disabled={reviewMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteReview}
              loading={reviewMutation.isPending}
              className="w-full sm:w-auto"
            >
              Save Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminForumReports;