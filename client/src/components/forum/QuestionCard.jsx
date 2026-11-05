import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, ChevronUp, MessageSquare, Clock, Tag, MoreHorizontal, Flag,
  User
} from 'lucide-react';
import { forumService } from '../../services/forumService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import ReportModal from './ReportModal';

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
  name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '?';

const QuestionCard = ({ question, onUpvoteChange }) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [upvoteCount, setUpvoteCount] = useState(question.upvoteCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState(question.hasUpvoted || false);
  const [isVoting, setIsVoting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to upvote questions.');
      return;
    }
    if (isVoting) return;
    setIsVoting(true);
    // Optimistic update
    const prevCount = upvoteCount;
    const prevVoted = hasUpvoted;
    setHasUpvoted(!hasUpvoted);
    setUpvoteCount(hasUpvoted ? upvoteCount - 1 : upvoteCount + 1);
    try {
      const res = await forumService.toggleUpvote(question._id);
      setUpvoteCount(res.data.upvoteCount);
      setHasUpvoted(res.data.hasUpvoted);
      onUpvoteChange?.(question._id, res.data.upvoteCount, res.data.hasUpvoted);
    } catch {
      // Revert
      setHasUpvoted(prevVoted);
      setUpvoteCount(prevCount);
      toast.error('Failed to update vote.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/forum/question/${question._id}`);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-5 cursor-pointer hover:border-cyan-300 hover:shadow-md transition-all duration-200 group"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {question.author?.avatar ? (
                <img src={question.author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(question.author?.name)
              )}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#1E293B] truncate block">
                {question.author?.name || 'Anonymous'}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                <Clock className="w-2.5 h-2.5" />
                <span>{formatRelativeTime(question.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {question.isSolved && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Solved
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowReport(true); }}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#64748B] hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
              title="Report"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[#1E293B] mb-1.5 line-clamp-2 text-[15px] group-hover:text-[#06B6D4] transition-colors">
          {question.title}
        </h3>

        {/* Description preview */}
        <p className="text-[13px] text-[#64748B] line-clamp-2 mb-3">
          {question.description}
        </p>

        {/* Tags */}
        {question.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {question.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-cyan-50 text-[#06B6D4] border border-cyan-100 px-2 py-0.5 rounded-full"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {question.tags.length > 4 && (
              <span className="text-[11px] text-[#94A3B8] px-1">+{question.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#F1F5F9]">
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            disabled={isVoting}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all',
              hasUpvoted
                ? 'bg-cyan-50 text-[#06B6D4] border border-cyan-200'
                : 'text-[#64748B] hover:bg-slate-100 hover:text-[#1E293B]'
            )}
          >
            <motion.div
              animate={{ scale: isVoting ? 0.8 : 1 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronUp className={cn('w-4 h-4', hasUpvoted && 'text-[#06B6D4]')} />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={upvoteCount}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                {upvoteCount}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Answers */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-medium">{question.answerCount || 0}</span>
            <span>answers</span>
          </div>

          <div className="ml-auto">
            <span className="text-[11px] text-[#94A3B8]">
              {question.viewCount || 0} views
            </span>
          </div>
        </div>
      </motion.div>

      {showReport && (
        <ReportModal
          targetType="question"
          targetId={question._id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
};

export default QuestionCard;

