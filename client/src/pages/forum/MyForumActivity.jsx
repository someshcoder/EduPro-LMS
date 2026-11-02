import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, MessageSquare, ChevronUp, CheckCircle2, Clock,
  Pencil, Archive, ExternalLink, Star, Coins, AlertTriangle,
  ChevronDown, ArrowRight, Inbox, RefreshCw
} from 'lucide-react';
import { forumService } from '../../services/forumService';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { cn } from '../../utils/cn';
import EditQuestionModal from '../../components/forum/EditQuestionModal';
import ConfirmArchiveModal from '../../components/forum/ConfirmArchiveModal';
import ForumNavHeader from '../../components/forum/ForumNavHeader';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const MyForumActivity = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [qPagination, setQPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [aPagination, setAPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoadingQ, setIsLoadingQ] = useState(true);
  const [isLoadingA, setIsLoadingA] = useState(true);
  const [isLoadingMoreQ, setIsLoadingMoreQ] = useState(false);
  const [isLoadingMoreA, setIsLoadingMoreA] = useState(false);

  // Modals
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [archivingQuestion, setArchivingQuestion] = useState(null);

  const loadQuestions = async (page = 1, append = false) => {
    if (page > 1) setIsLoadingMoreQ(true);
    else setIsLoadingQ(true);
    try {
      const res = await forumService.getMyQuestions({ page, limit: 10 });
      setQuestions((prev) => append ? [...prev, ...res.data.questions] : res.data.questions);
      setQPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load your questions.');
    } finally {
      setIsLoadingQ(false);
      setIsLoadingMoreQ(false);
    }
  };

  const loadAnswers = async (page = 1, append = false) => {
    if (page > 1) setIsLoadingMoreA(true);
    else setIsLoadingA(true);
    try {
      const res = await forumService.getMyAnswers({ page, limit: 10 });
      setAnswers((prev) => append ? [...prev, ...res.data.answers] : res.data.answers);
      setAPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load your answers.');
    } finally {
      setIsLoadingA(false);
      setIsLoadingMoreA(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    loadAnswers();
  }, []);

  const handleArchived = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) => q._id === questionId ? { ...q, status: 'archived' } : q)
    );
    setArchivingQuestion(null);
  };

  const handleQuestionUpdated = (updated) => {
    setQuestions((prev) =>
      prev.map((q) => q._id === updated._id ? { ...q, ...updated } : q)
    );
    setEditingQuestion(null);
  };

  const tabs = [
    { key: 'questions', label: 'My Questions', count: qPagination.total, icon: HelpCircle },
    { key: 'answers', label: 'My Answers', count: aPagination.total, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <ForumNavHeader />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-[#1E293B]">My Forum Activity</h1>
        <p className="text-[#64748B] text-sm mt-1">View and manage your questions and answers.</p>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-1.5 flex gap-1 w-fit shadow-xs">
        {tabs.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              activeTab === key
                ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-sm'
                : 'text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count > 0 && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                activeTab === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#64748B]'
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* MY QUESTIONS */}
        {activeTab === 'questions' && (
          <motion.div key="questions" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            {isLoadingQ ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="flex gap-4">
                    <div className="h-4 bg-slate-100 rounded w-20" />
                    <div className="h-4 bg-slate-100 rounded w-20" />
                  </div>
                </div>
              ))
            ) : questions.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-[#64748B] text-sm mb-4">You haven't posted any questions yet.</p>
                <Button size="sm" onClick={() => navigate('/forum')}>Go to Forum</Button>
              </div>
            ) : (
              <>
                {questions.map((q) => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:border-cyan-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {q.isSolved && (
                            <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Solved
                            </span>
                          )}
                          <span className={cn(
                            'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                            q.status === 'active' ? 'bg-cyan-50 border-cyan-200 text-[#06B6D4]'
                            : 'bg-amber-50 border-amber-200 text-amber-600'
                          )}>
                            {q.status}
                          </span>
                          {q.questionRewardCredited && (
                            <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-full">
                              🪙 +10 coins
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/forum/question/${q._id}`}
                          className="text-sm font-bold text-[#1E293B] hover:text-[#06B6D4] transition-colors line-clamp-1"
                        >
                          {q.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(q.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {q.answerCount || 0} answers
                          </span>
                          <span className="flex items-center gap-1">
                            <ChevronUp className="w-3 h-3" /> {q.upvoteCount || 0} upvotes
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/forum/question/${q._id}`}
                          className="p-2 rounded-xl text-[#64748B] hover:text-[#06B6D4] hover:bg-cyan-50 transition-all"
                          title="View discussion"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {q.status === 'active' && (
                          <>
                            <button
                              onClick={() => setEditingQuestion(q)}
                              className="p-2 rounded-xl text-[#64748B] hover:text-[#06B6D4] hover:bg-cyan-50 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setArchivingQuestion(q)}
                              className="p-2 rounded-xl text-[#64748B] hover:text-rose-500 hover:bg-rose-50 transition-all"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {qPagination.page < qPagination.pages && (
                  <div className="text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isLoadingMoreQ}
                      onClick={() => loadQuestions(qPagination.page + 1, true)}
                      leftIcon={<ChevronDown className="w-4 h-4" />}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* MY ANSWERS */}
        {activeTab === 'answers' && (
          <motion.div key="answers" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
            {isLoadingA ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-48 mb-1.5" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              ))
            ) : answers.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-[#64748B] text-sm mb-4">You haven't answered any questions yet.</p>
                <Button size="sm" onClick={() => navigate('/forum')}>Browse Questions</Button>
              </div>
            ) : (
              <>
                {answers.map((a) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'border rounded-2xl p-5 transition-all',
                      a.isBestAnswer
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-white border-[#E2E8F0] hover:border-cyan-200'
                    )}
                  >
                    {a.isBestAnswer && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Best Answer
                        </span>
                        {a.bestAnswerRewardCredited && (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            🪙 +{a.bestAnswerRewardAmount || 25} coins earned
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-[#1E293B] line-clamp-2 mb-2">{a.content}</p>

                    <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(a.createdAt)}
                      </span>
                      {a.question && (
                        <Link
                          to={`/forum/question/${a.question._id}`}
                          className="flex items-center gap-1 text-[#06B6D4] hover:text-cyan-700 font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="line-clamp-1 max-w-[200px]">{a.question.title}</span>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}

                {aPagination.page < aPagination.pages && (
                  <div className="text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={isLoadingMoreA}
                      onClick={() => loadAnswers(aPagination.page + 1, true)}
                      leftIcon={<ChevronDown className="w-4 h-4" />}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSuccess={handleQuestionUpdated}
        />
      )}

      {/* Archive Confirm Modal */}
      {archivingQuestion && (
        <ConfirmArchiveModal
          question={archivingQuestion}
          onClose={() => setArchivingQuestion(null)}
          onSuccess={handleArchived}
        />
      )}
    </div>
  );
};

export default MyForumActivity;

