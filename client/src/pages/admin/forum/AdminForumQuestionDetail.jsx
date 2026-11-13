import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Coins,
  Eye,
  EyeOff,
  History,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { adminForumService } from '../../../services/adminForumService';
import Card, { CardBody, CardHeader } from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

const AdminForumQuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local selection state: Map of answerId -> { selected: boolean, position: number }
  const [selections, setSelections] = useState({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modQuestionModal, setModQuestionModal] = useState(false);
  const [questionStatus, setQuestionStatus] = useState('active');
  const [questionReason, setQuestionReason] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminForumQuestionDetail', id],
    queryFn: async () => {
      const res = await adminForumService.getQuestionDetail(id);
      return res.data;
    },
  });

  // Sync initial selections with DB state when data arrives
  useEffect(() => {
    if (data?.answers) {
      const initialMap = {};
      data.answers.forEach((ans) => {
        if (ans.isBestAnswer) {
          initialMap[ans._id] = {
            selected: true,
            position: ans.bestAnswerPosition || 1,
          };
        }
      });
      setSelections(initialMap);
      if (data.question) {
        setQuestionStatus(data.question.status);
      }
    }
  }, [data]);

  // Publish best answers mutation
  const publishMutation = useMutation({
    mutationFn: (selectedAnswers) =>
      adminForumService.publishBestAnswers(id, selectedAnswers),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Best answers published and coins credited!');
      setConfirmModalOpen(false);
      queryClient.invalidateQueries(['adminForumQuestionDetail', id]);
      queryClient.invalidateQueries(['adminForumQuestions']);
      queryClient.invalidateQueries(['adminForumDashboardStats']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to publish best answers');
    },
  });

  // Question moderation mutation
  const modQuestionMutation = useMutation({
    mutationFn: ({ status, reason }) =>
      adminForumService.moderateQuestion(id, { status, reason }),
    onSuccess: () => {
      toast.success('Question moderation status updated');
      setModQuestionModal(false);
      queryClient.invalidateQueries(['adminForumQuestionDetail', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update question status');
    },
  });

  // Answer moderation mutation
  const modAnswerMutation = useMutation({
    mutationFn: ({ answerId, status, reason }) =>
      adminForumService.moderateAnswer(answerId, { status, reason }),
    onSuccess: () => {
      toast.success('Answer status updated');
      queryClient.invalidateQueries(['adminForumQuestionDetail', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update answer status');
    },
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <Card className="text-center p-12">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1E293B]">Discussion not found</h2>
          <p className="text-sm text-[#64748B] mt-2 mb-6">
            The requested discussion does not exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/admin/forum/questions')} variant="primary">
            Back to Discussions
          </Button>
        </Card>
      </div>
    );
  }

  const { question, answers = [], auditLogs = [] } = data;

  // Toggle answer selection
  const handleToggleSelect = (answerId) => {
    setSelections((prev) => {
      const current = prev[answerId];
      if (current?.selected) {
        const next = { ...prev };
        delete next[answerId];
        return next;
      } else {
        // Find first available rank (1, 2, or 3)
        const usedPositions = Object.values(prev)
          .filter((v) => v.selected)
          .map((v) => Number(v.position));
        if (usedPositions.length >= 3) {
          toast.error('You can select a maximum of 3 best answers');
          return prev;
        }
        let nextPos = 1;
        while (usedPositions.includes(nextPos) && nextPos <= 3) {
          nextPos++;
        }
        return {
          ...prev,
          [answerId]: { selected: true, position: nextPos },
        };
      }
    });
  };

  // Change position of selected answer
  const handlePositionChange = (answerId, newPos) => {
    setSelections((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        position: Number(newPos),
      },
    }));
  };

  // Prepare payload for publish
  const selectedList = Object.entries(selections)
    .filter(([_, v]) => v.selected)
    .map(([answerId, v]) => ({
      answerId,
      position: Number(v.position),
    }));

  // Validation checks
  const selectedPositions = selectedList.map((s) => s.position);
  const hasDuplicatePositions = new Set(selectedPositions).size !== selectedPositions.length;
  const hasInvalidPositions = selectedPositions.some((p) => p < 1 || p > 3);
  const isValidSelection = !hasDuplicatePositions && !hasInvalidPositions && selectedList.length <= 3;

  // Calculate new rewards that will be credited (+25 coins per non-credited answer)
  const newlyRewardedAnswers = selectedList.filter((s) => {
    const ans = answers.find((a) => a._id === s.answerId);
    return ans && !ans.bestAnswerRewardCredited;
  });
  const coinsToDisburse = newlyRewardedAnswers.length * 25;

  const handleOpenConfirm = () => {
    if (!isValidSelection) {
      toast.error('Please assign unique ranks (1, 2, or 3) to each selected answer.');
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleExecutePublish = () => {
    publishMutation.mutate(selectedList);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/forum/questions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#06B6D4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discussions
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`/forum/question/${question._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#06B6D4]" />
            View in Student Forum
          </a>
          <button
            onClick={() => setModQuestionModal(true)}
            className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            Moderate Status
          </button>
        </div>
      </div>

      {/* Main Question Overview Card */}
      <Card className="border-[#E2E8F0] overflow-hidden">
        <CardBody className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {question.isSolved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#D1FAE5] text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Solved • Best Answers Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Needs Best Answer Review
              </span>
            )}

            <Badge
              variant={
                question.status === 'active'
                  ? 'success'
                  : question.status === 'hidden'
                  ? 'danger'
                  : 'default'
              }
            >
              Status: {question.status.toUpperCase()}
            </Badge>

            {question.reports?.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                {question.reports.length} Flagged Reports
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-3">
            {question.title}
          </h1>

          <div className="prose prose-sm max-w-none text-[#1E293B] whitespace-pre-wrap bg-slate-50/70 p-4 rounded-xl border border-[#E2E8F0] mb-4">
            {question.description}
          </div>

          {/* Tags & Meta Details */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F1F5F9] text-xs text-[#64748B]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#1E293B]">Tags:</span>
              {question.tags?.length > 0 ? (
                question.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-cyan-50 text-[#06B6D4] font-medium border border-cyan-100"
                  >
                    #{t}
                  </span>
                ))
              ) : (
                <span>No tags</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span>Author: <strong className="text-[#1E293B]">{question.author?.name}</strong> ({question.author?.email})</span>
              <span>•</span>
              <span>Posted: {new Date(question.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Answers: <strong className="text-[#1E293B]">{answers.length}</strong></span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Top 3 Best Answers Selection Controller Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Top 3 Best Answers Engine
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Evaluate and Publish Best Answers
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Select up to 3 student answers to feature at the very top of this discussion. Each newly published author automatically receives <span className="text-cyan-300 font-bold">+25 Forum Coins</span> into their wallet.
            </p>
          </div>

          {/* Action Button & Summary Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-center sm:text-right border border-white/10">
              <p className="text-[11px] text-slate-300">Selected Answers</p>
              <p className="text-sm font-bold text-cyan-300">
                {selectedList.length} / 3 Selected
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleOpenConfirm}
              disabled={selectedList.length === 0 || !isValidSelection || publishMutation.isPending}
              className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white hover:opacity-95 shadow-lg shadow-cyan-500/20 font-bold px-5 py-2.5 text-xs"
            >
              <Award className="w-4 h-4 mr-1.5" />
              Publish Best Answers & Award Coins
            </Button>
          </div>
        </div>

        {/* Validation Warning if duplicate ranks exist */}
        {hasDuplicatePositions && (
          <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            Duplicate ranks detected! Please assign unique ranks (#1, #2, #3) to each selected answer.
          </div>
        )}
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E293B]">
            All Submitted Answers ({answers.length})
          </h3>
          <span className="text-xs text-[#64748B]">
            Review quality, originality, and completeness before selection
          </span>
        </div>

        {answers.length === 0 ? (
          <Card className="text-center p-12">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#1E293B]">No answers submitted yet</h4>
            <p className="text-xs text-[#64748B] mt-1">
              Students haven't replied to this discussion yet. Check back once answers are posted.
            </p>
          </Card>
        ) : (
          answers.map((ans) => {
            const isSelected = !!selections[ans._id]?.selected;
            const currentPosition = selections[ans._id]?.position || 1;

            return (
              <motion.div
                key={ans._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`transition-all border-2 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-50/20 shadow-md'
                      : ans.isBestAnswer
                      ? 'border-emerald-300 bg-emerald-50/10'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <CardBody className="p-5">
                    {/* Header: Author & Selection Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {ans.author?.name ? ans.author.name[0] : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1E293B]">
                              {ans.author?.name || 'User'}
                            </span>
                            {ans.author?.role === 'admin' && (
                              <Badge variant="purple">Admin</Badge>
                            )}
                            {ans.status === 'hidden' && (
                              <Badge variant="danger">Hidden</Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-[#64748B]">
                            {ans.author?.email} • {new Date(ans.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Best Answer Selection Widget */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-center">
                        {isSelected && (
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-cyan-300 shadow-xs">
                            <label htmlFor={`rank-select-${ans._id}`} className="text-[11px] font-bold text-[#06B6D4]">
                              Rank:
                            </label>
                            <select
                              id={`rank-select-${ans._id}`}
                              name={`rank-${ans._id}`}
                              value={currentPosition}
                              onChange={(e) => handlePositionChange(ans._id, e.target.value)}
                              className="text-xs font-bold text-[#1E293B] bg-transparent focus:outline-none cursor-pointer"
                            >
                              <option value={1}>#1 (First Place)</option>
                              <option value={2}>#2 (Second Place)</option>
                              <option value={3}>#3 (Third Place)</option>
                            </select>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleSelect(ans._id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white'
                              : 'bg-white border border-[#E2E8F0] text-[#1E293B] hover:border-cyan-400 hover:text-[#06B6D4]'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          {isSelected ? `Selected as #${currentPosition}` : 'Select as Best Answer'}
                        </button>

                        {/* Answer visibility moderation */}
                        <button
                          type="button"
                          onClick={() =>
                            modAnswerMutation.mutate({
                              answerId: ans._id,
                              status: ans.status === 'hidden' ? 'active' : 'hidden',
                              reason: 'Moderator action',
                            })
                          }
                          className="p-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer"
                          title={ans.status === 'hidden' ? 'Unhide answer' : 'Hide answer'}
                        >
                          {ans.status === 'hidden' ? (
                            <Eye className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-rose-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Answer Content */}
                    <div className="py-4 text-sm text-[#1E293B] whitespace-pre-wrap leading-relaxed">
                      {ans.content}
                    </div>

                    {/* Status badges footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9] text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {ans.bestAnswerRewardCredited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#D1FAE5] text-emerald-800 border border-emerald-200">
                            <Coins className="w-3 h-3 text-emerald-600" /> +25 Coins Awarded (Txn Credited)
                          </span>
                        ) : isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-[#06B6D4] border border-cyan-200">
                            <Coins className="w-3 h-3 text-[#06B6D4]" /> +25 Coins will be credited upon publish
                          </span>
                        ) : null}

                        {ans.reports?.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {ans.reports.length} report(s) on this answer
                          </span>
                        )}
                      </div>

                      {ans.isBestAnswer && ans.bestAnswerPublishedAt && (
                        <span className="text-[11px] text-[#64748B]">
                          Published as Best Answer #{ans.bestAnswerPosition} on {new Date(ans.bestAnswerPublishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Audit History for this discussion */}
      {auditLogs.length > 0 && (
        <Card className="mt-8 border-[#E2E8F0]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#8B5CF6]" />
              <h3 className="font-bold text-[#1E293B] text-sm">
                Administrative Audit Trail for this Discussion
              </h3>
            </div>
          </CardHeader>
          <div className="divide-y divide-[#F1F5F9] text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#1E293B]">{log.admin?.name || 'Admin'}</span>
                    <Badge variant="purple">{log.action}</Badge>
                    <span className="text-[#64748B] text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#64748B]">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Best Answers Publication */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Best Answers Publication"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#1E293B] leading-relaxed">
            You are about to publish <strong>{selectedList.length} Best Answer(s)</strong> for this discussion:
          </p>

          <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0] space-y-2">
            {selectedList.map((s) => {
              const ans = answers.find((a) => a._id === s.answerId);
              return (
                <div key={s.answerId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 text-[#06B6D4] font-bold flex items-center justify-center text-[10px]">
                      #{s.position}
                    </span>
                    <span className="font-semibold text-[#1E293B]">{ans?.author?.name}</span>
                  </div>
                  <span className="text-[#64748B]">
                    {ans?.bestAnswerRewardCredited ? (
                      <span className="text-emerald-600 font-medium">Already Awarded</span>
                    ) : (
                      <span className="text-cyan-600 font-bold">+25 Forum Coins</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-900 text-xs">
            <p className="font-bold mb-0.5">Automated Coin Credit Notice:</p>
            <p>
              Total of <strong>{coinsToDisburse} Forum Coins</strong> will be credited directly to the respective authors' wallets upon confirmation. This operation is idempotent and recorded in the audit trail.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={publishMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExecutePublish}
              loading={publishMutation.isPending}
              className="w-full sm:w-auto bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white"
            >
              Confirm & Publish Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Moderate Question Modal */}
      <Modal
        isOpen={modQuestionModal}
        onClose={() => setModQuestionModal(false)}
        title="Change Discussion Status"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label htmlFor="mod-question-status" className="block font-semibold text-[#1E293B] mb-1">Status</label>
            <select
              id="mod-question-status"
              name="questionStatus"
              value={questionStatus}
              onChange={(e) => setQuestionStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#06B6D4]"
            >
              <option value="active">Active (Visible)</option>
              <option value="hidden">Hidden (Moderated)</option>
              <option value="archived">Archived (Closed)</option>
            </select>
          </div>

          <div>
            <label htmlFor="mod-question-reason" className="block font-semibold text-[#1E293B] mb-1">
              Reason / Moderation Notes
            </label>
            <textarea
              id="mod-question-reason"
              name="questionReason"
              rows={3}
              placeholder="Provide reason for status change..."
              value={questionReason}
              onChange={(e) => setQuestionReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              variant="outline"
              onClick={() => setModQuestionModal(false)}
              disabled={modQuestionMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                modQuestionMutation.mutate({
                  status: questionStatus,
                  reason: questionReason,
                })
              }
              loading={modQuestionMutation.isPending}
              className="w-full sm:w-auto"
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminForumQuestionDetail;