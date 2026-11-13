import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  ThumbsUp,
  ShieldAlert,
  Award,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { adminForumService } from '../../../services/adminForumService';
import AdminForumNavHeader from '../../../components/admin/forum/AdminForumNavHeader';
import Card, { CardBody } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

const AdminForumQuestions = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [solved, setSolved] = useState('all');
  const [hasReports, setHasReports] = useState('all');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  // Moderation modal state
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modStatus, setModStatus] = useState('active');
  const [modReason, setModReason] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminForumQuestions', search, status, solved, hasReports, tag, sort, page],
    queryFn: async () => {
      const res = await adminForumService.getQuestions({
        search,
        status,
        solved,
        hasReports,
        tag,
        sort,
        page,
        limit: 12,
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status, reason }) =>
      adminForumService.moderateQuestion(id, { status, reason }),
    onSuccess: () => {
      toast.success('Question moderation status updated');
      queryClient.invalidateQueries(['adminForumQuestions']);
      queryClient.invalidateQueries(['adminForumDashboardStats']);
      setSelectedQuestion(null);
      setModReason('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update question status');
    },
  });

  const handleOpenModModal = (q) => {
    setSelectedQuestion(q);
    setModStatus(q.status);
    setModReason('');
  };

  const handleApplyModeration = () => {
    if (!selectedQuestion) return;
    moderateMutation.mutate({
      id: selectedQuestion._id,
      status: modStatus,
      reason: modReason,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <AdminForumNavHeader
        title="Discussion Moderation & Best Answers"
        subtitle="Manage student discussions, check flagged reports and select Top 3 Best Answers"
        badge="Discussions Hub"
      />

      {/* Filter & Search Bar */}
      <Card className="border-[#E2E8F0]">
        <CardBody className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="forum-admin-search"
              name="search"
              type="text"
              placeholder="Search discussions by title, content or tags..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#06B6D4] bg-white text-[#1E293B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              id="forum-status-filter"
              name="status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="archived">Archived</option>
            </select>

            <select
              id="forum-solved-filter"
              name="solved"
              value={solved}
              onChange={(e) => {
                setSolved(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Solution: All</option>
              <option value="true">Solved (Best Answer Set)</option>
              <option value="false">Unsolved (Pending)</option>
            </select>

            <select
              id="forum-reports-filter"
              name="hasReports"
              value={hasReports}
              onChange={(e) => {
                setHasReports(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="all">Reports: All</option>
              <option value="true">Flagged / Has Reports</option>
            </select>

            <input
              id="forum-tag-filter"
              name="tag"
              type="text"
              placeholder="Filter by tag..."
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-28 px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            />

            <select
              id="forum-sort-filter"
              name="sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-white text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="latest">Sort: Latest</option>
              <option value="answers">Most Answers</option>
              <option value="upvotes">Most Upvotes</option>
              <option value="oldest">Oldest</option>
            </select>

            <button
              onClick={() => refetch()}
              className="p-2 text-[#64748B] hover:text-[#06B6D4] rounded-xl border border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Discussion Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError || !data?.success ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-sm text-[#1E293B] font-semibold">Failed to load discussions</p>
          </div>
        ) : data.questions.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#64748B]">
            No discussions found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-3 px-4">Discussion</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status & Solution</th>
                  <th className="py-3 px-4 text-center">Engagement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {data.questions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Discussion details */}
                    <td className="py-4 px-4 max-w-md">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/forum/questions/${q._id}`}
                          className="font-bold text-sm text-[#1E293B] hover:text-[#06B6D4] transition-colors line-clamp-1"
                        >
                          {q.title}
                        </Link>
                        {q.pendingReportsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                            {q.pendingReportsCount} flags
                          </span>
                        )}
                      </div>

                      <p className="text-[#64748B] text-xs line-clamp-1 mt-0.5">{q.description}</p>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {q.tags?.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-[#64748B] font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                          {q.author?.name ? q.author.name[0] : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1E293B] text-xs">{q.author?.name || 'User'}</p>
                          <p className="text-[10px] text-[#64748B]">{q.author?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status & Solution */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {q.isSolved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#D1FAE5] text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Solved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Needs Review
                          </span>
                        )}

                        <div>
                          {q.status === 'active' && (
                            <span className="text-[10px] font-bold text-emerald-600">● Active</span>
                          )}
                          {q.status === 'hidden' && (
                            <span className="text-[10px] font-bold text-rose-600">● Hidden</span>
                          )}
                          {q.status === 'archived' && (
                            <span className="text-[10px] font-bold text-slate-500">● Archived</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Engagement */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-3 text-xs text-[#64748B]">
                        <span className="inline-flex items-center gap-1" title="Answers">
                          <MessageSquare className="w-3.5 h-3.5 text-[#06B6D4]" /> {q.answerCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Upvotes">
                          <ThumbsUp className="w-3.5 h-3.5 text-purple-500" /> {q.upvoteCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/forum/questions/${q._id}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white hover:opacity-95 shadow-xs transition-all inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Review & Best Answers
                        </Link>

                        <button
                          onClick={() => handleOpenModModal(q)}
                          className="p-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer"
                          title="Moderate Status"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
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
              Showing {(page - 1) * 12 + 1} to{' '}
              {Math.min(page * 12, data.pagination.total)} of {data.pagination.total} discussions
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

      {/* Moderation Modal */}
      <Modal
        isOpen={!!selectedQuestion}
        onClose={() => setSelectedQuestion(null)}
        title="Moderate Discussion Visibility"
      >
        <div className="space-y-4 text-xs">
          <div>
            <p className="text-sm font-bold text-[#1E293B] mb-1">{selectedQuestion?.title}</p>
            <p className="text-[#64748B]">
              Change visibility status for this discussion. Hiding will prevent students from viewing it in the main feed.
            </p>
          </div>

          <div>
            <label htmlFor="mod-status-select" className="block font-semibold text-[#1E293B] mb-1">Status</label>
            <select
              id="mod-status-select"
              name="modStatus"
              value={modStatus}
              onChange={(e) => setModStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="active">Active (Visible)</option>
              <option value="hidden">Hidden (Moderated)</option>
              <option value="archived">Archived (Closed)</option>
            </select>
          </div>

          <div>
            <label htmlFor="mod-reason-text" className="block font-semibold text-[#1E293B] mb-1">
              Reason / Moderation Notes (Optional)
            </label>
            <textarea
              id="mod-reason-text"
              name="modReason"
              rows={3}
              placeholder="e.g. Inappropriate language, off-topic, spam..."
              value={modReason}
              onChange={(e) => setModReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              onClick={() => setSelectedQuestion(null)}
              disabled={moderateMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyModeration}
              loading={moderateMutation.isPending}
              className="w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminForumQuestions;