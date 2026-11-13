import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronUp, MessageSquare, Tag, Clock, CheckCircle2,
  Star, AlertCircle, Send, Pencil, X, RefreshCw, ChevronDown, Flag, Paperclip
} from 'lucide-react';
import { forumService } from '../../services/forumService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import AnswerCard from '../../components/forum/AnswerCard';
import ReportModal from '../../components/forum/ReportModal';
import { ThreadSkeleton } from '../../components/forum/ForumSkeleton';
import { cn } from '../../utils/cn';

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const formatRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || '?';

const ForumThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const answerFormRef = useRef(null);

  const [question, setQuestion] = useState(null);
  const [bestAnswers, setBestAnswers] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerPagination, setAnswerPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Answer form
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isLoadingMoreAnswers, setIsLoadingMoreAnswers] = useState(false);

  // Editing question
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Report
  const [showReport, setShowReport] = useState(false);

  const loadQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await forumService.getQuestion(id);
      const q = res.data.question;
      setQuestion(q);
      setUpvoteCount(q.upvoteCount || 0);
      setHasUpvoted(q.hasUpvoted || false);
      setEditTitle(q.title);
      setEditDescription(q.description);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load question.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadAnswers = useCallback(async (page = 1, append = false) => {
    if (page > 1) setIsLoadingMoreAnswers(true);
    try {
      const res = await forumService.getAnswers(id, { page, limit: 20 });
      if (page === 1) setBestAnswers(res.data.bestAnswers || []);
      setAnswers((prev) => append ? [...prev, ...res.data.answers] : res.data.answers);
      setAnswerPagination(res.data.pagination);
    } catch {
      // silently fail
    } finally {
      setIsLoadingMoreAnswers(false);
    }
  }, [id]);

  useEffect(() => {
    loadQuestion();
    loadAnswers(1);
  }, [loadQuestion, loadAnswers]);

  const handleUpvote = async () => {
    if (!isAuthenticated) return toast.error('Please login to upvote.');
    if (isVoting) return;
    setIsVoting(true);
    const prev = { upvoteCount, hasUpvoted };
    setHasUpvoted(!hasUpvoted);
    setUpvoteCount(hasUpvoted ? upvoteCount - 1 : upvoteCount + 1);
    try {
      const res = await forumService.toggleUpvote(id);
      setUpvoteCount(res.data.upvoteCount);
      setHasUpvoted(res.data.hasUpvoted);
    } catch {
      setHasUpvoted(prev.hasUpvoted);
      setUpvoteCount(prev.upvoteCount);
      toast.error('Failed to update vote.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return toast.error('Please write your answer.');
    if (answerContent.trim().length < 10) return toast.error('Answer must be at least 10 characters.');
    if (isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);
    try {
      const res = await forumService.createAnswer(id, { content: answerContent.trim() });
      setAnswers((prev) => [...prev, res.data.answer]);
      setAnswerPagination((prev) => ({ ...prev, total: prev.total + 1 }));
      setQuestion((prev) => prev ? { ...prev, answerCount: (prev.answerCount || 0) + 1 } : prev);
      setAnswerContent('');
      toast.success('Answer submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSaveEditQuestion = async () => {
    if (!editTitle.trim() || editTitle.trim().length < 10) return toast.error('Title must be at least 10 characters.');
    if (!editDescription.trim() || editDescription.trim().length < 20) return toast.error('Description must be at least 20 characters.');
    setIsSubmittingEdit(true);
    try {
      const res = await forumService.editQuestion(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setQuestion(res.data.question);
      setIsEditingQuestion(false);
      toast.success('Question updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update question.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const isQuestionAuthor = question && (
    user?._id === question.author?._id || user?.id === question.author?._id
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button onClick={() => navigate('/forum')} className="flex items-center gap-2 text-[#64748B] hover:text-[#06B6D4] text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </button>
        </div>
        <ThreadSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button onClick={() => navigate('/forum')} className="flex items-center gap-2 text-[#64748B] hover:text-[#06B6D4] text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </button>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-600 text-sm mb-4">{error}</p>
          <Button size="sm" variant="danger" onClick={loadQuestion} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#06B6D4] text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Forum
        </button>
      </motion.div>

      {/* Question card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden"
      >
        {/* Status bar */}
        {question.isSolved && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">This question has been solved</span>
          </div>
        )}

        <div className="p-4 sm:p-6">
          {/* Author row */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {question.author?.avatar ? (
                  <img src={question.author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(question.author?.name)
                )}
              </div>
              <div>
                <p className="font-semibold text-[#1E293B] text-sm">{question.author?.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(question.createdAt)}
                  {question.editHistory?.length > 0 && <span>(edited)</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isQuestionAuthor && !isEditingQuestion && (
                <button
                  onClick={() => setIsEditingQuestion(true)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#06B6D4] hover:bg-cyan-50 transition-all"
                  title="Edit question"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {!isQuestionAuthor && (
                <button
                  onClick={() => setShowReport(true)}
                  className="p-2 rounded-xl text-[#94A3B8] hover:text-[#64748B] hover:bg-slate-100 transition-all"
                  title="Report"
                >
                  <Flag className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <AnimatePresence mode="wait">
            {isEditingQuestion ? (
              <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5 block">Title</label>
                  <input
                    id="thread-edit-title"
                    name="editTitle"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={300}
                    className="w-full text-sm border border-[#06B6D4] rounded-xl px-3 py-2.5 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-1.5 block">Description</label>
                  <textarea
                    id="thread-edit-description"
                    name="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    maxLength={10000}
                    rows={6}
                    className="w-full text-sm border border-[#06B6D4] rounded-xl px-3 py-2.5 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-cyan-200 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEditQuestion} isLoading={isSubmittingEdit}>Save Changes</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingQuestion(false)} disabled={isSubmittingEdit}>Cancel</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-xl font-bold text-[#1E293B] mb-3 leading-snug">{question.title}</h1>
                <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap mb-4">{question.description}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tags */}
          {question.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-cyan-50 text-[#06B6D4] border border-cyan-100 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Tag className="w-2.5 h-2.5" />#{tag}
                </span>
              ))}
            </div>
          )}

          {/* Attachments */}
          {question.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.attachments.map((att, i) => (
                <a
                  key={i}
                  href={`${SERVER_URL}${att.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#64748B] hover:text-[#06B6D4] hover:border-cyan-200 transition-all"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {att.originalName}
                </a>
              ))}
            </div>
          )}

          {/* Stats & Upvote */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#F1F5F9]">
            <button
              onClick={handleUpvote}
              disabled={isVoting}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border',
                hasUpvoted
                  ? 'bg-cyan-50 border-cyan-200 text-[#06B6D4]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:border-cyan-200 hover:text-[#06B6D4] hover:bg-cyan-50'
              )}
            >
              <motion.div animate={{ scale: isVoting ? 0.7 : 1 }} transition={{ duration: 0.1 }}>
                <ChevronUp className="w-4 h-4" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={upvoteCount}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  {upvoteCount} upvotes
                </motion.span>
              </AnimatePresence>
            </button>
            <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
              <MessageSquare className="w-4 h-4" />
              <span>{question.answerCount || 0} answers</span>
            </div>
            <div className="text-xs text-[#94A3B8] ml-auto">
              {question.viewCount || 0} views
            </div>
          </div>
        </div>
      </motion.div>

      {/* Answers section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E293B]">
            {(bestAnswers.length + answers.length) > 0
              ? `${bestAnswers.length + answerPagination.total} Answer${bestAnswers.length + answerPagination.total !== 1 ? 's' : ''}`
              : 'No answers yet'}
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => answerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="text-sm font-medium text-[#06B6D4] hover:text-cyan-700 transition-colors"
            >
              Write an answer ↓
            </button>
          )}
        </div>

        {/* Best Answers (admin-selected) */}
        {bestAnswers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Star className="w-4 h-4 text-emerald-500" fill="currentColor" />
              <span className="text-sm font-bold text-emerald-700">Top Answers</span>
            </div>
            {bestAnswers.map((ans) => (
              <AnswerCard key={ans._id} answer={ans} isBest={true} />
            ))}
          </div>
        )}

        {/* Regular Answers */}
        {answers.length > 0 && (
          <div className="space-y-3">
            {bestAnswers.length > 0 && (
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-[#E2E8F0]" />
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">All Answers</span>
                <div className="h-px flex-1 bg-[#E2E8F0]" />
              </div>
            )}
            {answers.map((ans) => (
              <AnswerCard
                key={ans._id}
                answer={ans}
                isBest={false}
                onAnswerUpdated={(updated) =>
                  setAnswers((prev) => prev.map((a) => a._id === updated._id ? { ...a, content: updated.content, editHistory: updated.editHistory } : a))
                }
              />
            ))}

            {/* Load more answers */}
            {answerPagination.page < answerPagination.pages && (
              <div className="text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isLoadingMoreAnswers}
                  onClick={() => loadAnswers(answerPagination.page + 1, true)}
                  leftIcon={<ChevronDown className="w-4 h-4" />}
                >
                  Load more answers
                </Button>
              </div>
            )}
          </div>
        )}

        {bestAnswers.length === 0 && answers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center"
          >
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-[#64748B] text-sm">No answers yet. Be the first to help!</p>
          </motion.div>
        )}
      </div>

      {/* Answer Form */}
      {isAuthenticated ? (
        <motion.div
          ref={answerFormRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-6 shadow-xs"
        >
          <h3 className="text-base font-bold text-[#1E293B] mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#06B6D4]" /> Your Answer
          </h3>
          <form onSubmit={handleSubmitAnswer} className="space-y-3">
            <textarea
              id="thread-answer-content"
              name="answerContent"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Write a clear, helpful answer. Include code examples, steps, or explanations as needed..."
              rows={6}
              maxLength={10000}
              className="w-full text-sm border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-[#06B6D4] resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#94A3B8]">{answerContent.length}/10000</span>
              <Button
                type="submit"
                isLoading={isSubmittingAnswer}
                disabled={!answerContent.trim()}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Answer
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center">
          <p className="text-[#64748B] text-sm mb-3">Please log in to post an answer.</p>
          <Button size="sm" onClick={() => navigate('/login')}>Login to Answer</Button>
        </div>
      )}

      {showReport && (
        <ReportModal
          targetType="question"
          targetId={question._id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default ForumThread;

