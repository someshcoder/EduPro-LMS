import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { forumService } from '../../services/forumService';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const ConfirmArchiveModal = ({ question, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      await forumService.archiveQuestion(question._id);
      toast.success('Question archived.');
      onSuccess?.(question._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#1E293B]">Archive Question</h2>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg text-[#64748B] hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base text-[#1E293B] mb-1">Archive this question?</h3>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  This will hide your question from the public forum. Existing answers, rewards, and records will be preserved. You can contact support to restore it.
                </p>
                <p className="text-xs sm:text-sm font-medium text-[#1E293B] mt-2 line-clamp-2">"{question.title}"</p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
              <Button variant="secondary" className="w-full sm:flex-1 justify-center" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button variant="warning" className="w-full sm:flex-1 justify-center" isLoading={isSubmitting} onClick={handleArchive}>Archive</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmArchiveModal;

