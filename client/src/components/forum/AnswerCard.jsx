import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Pencil, Flag, X } from 'lucide-react';
import { forumService } from '../../services/forumService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import Button from '../common/Button';
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
  name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || '?';

const AnswerCard = ({ answer, isBest = false, onAnswerUpdated }) => {
  const { user } = useAuthStore();
  const isOwn = user?._id === answer.author?._id || user?.id === answer.author?._id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [currentContent, setCurrentContent] = useState(answer.content);

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent.trim().length < 10) {
      return toast.error('Answer must be at least 10 characters.');
    }
    setIsSubmitting(true);
    try {
      const res = await forumService.editAnswer(answer._id, { content: editContent.trim() });
      setCurrentContent(res.data.answer.content);
      setIsEditing(false);
      toast.success('Answer updated!');
      onAnswerUpdated?.(res.data.answer);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'rounded-2xl border p-5 transition-all duration-200',
          isBest
            ? 'bg-emerald-50/60 border-emerald-200 shadow-sm'
            : 'bg-white border-[#E2E8F0]'
        )}
      >
        {/* Best Answer Badge */}
        {isBest && (
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-emerald-200/80">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Best Answer {answer.bestAnswerPosition ? `#${answer.bestAnswerPosition}` : ''}</span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                ⭐ Verified Solution
              </span>
            </div>
            {answer.bestAnswerRewardCredited && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                +25 Forum Coins Awarded
              </span>
            )}
          </div>
        )}

        {/* Author info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm',
              isBest
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400'
                : 'bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6]'
            )}>
              {answer.author?.avatar ? (
                <img src={answer.author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(answer.author?.name)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1E293B]">{answer.author?.name || 'Anonymous'}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                <Clock className="w-2.5 h-2.5" />
                {formatRelativeTime(answer.createdAt)}
                {answer.editHistory?.length > 0 && (
                  <span className="ml-1 text-[#94A3B8]">(edited)</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {isOwn && !isBest && (
              <button
                onClick={() => { setIsEditing(!isEditing); setEditContent(currentContent); }}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#06B6D4] hover:bg-cyan-50 transition-all"
                title="Edit answer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {!isOwn && (
              <button
                onClick={() => setShowReport(true)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#64748B] hover:bg-slate-100 transition-all"
                title="Report"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleEdit}
              className="space-y-3"
            >
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                maxLength={10000}
                className="w-full text-sm border border-[#06B6D4] rounded-xl px-3 py-2.5 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-cyan-200 resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" isLoading={isSubmitting}>Save</Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'text-sm leading-relaxed whitespace-pre-wrap',
                isBest ? 'text-emerald-900' : 'text-[#1E293B]'
              )}
            >
              {currentContent}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showReport && (
        <ReportModal
          targetType="answer"
          targetId={answer._id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
};

export default AnswerCard;

