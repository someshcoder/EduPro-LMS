import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { forumService } from '../../services/forumService';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const REASONS = [
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'inappropriate', label: 'Inappropriate or offensive content' },
  { value: 'misinformation', label: 'Misinformation or false claims' },
  { value: 'off_topic', label: 'Off-topic or irrelevant' },
  { value: 'other', label: 'Other' },
];

const ReportModal = ({ targetType, targetId, onClose }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error('Please select a reason.');
    setIsSubmitting(true);
    try {
      await forumService.createReport({ targetType, targetId, reason, details });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={(e) => e.stopPropagation()}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#1E293B]">Report {targetType === 'question' ? 'Question' : 'Answer'}</h2>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg text-[#64748B] hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-bold text-[#1E293B] mb-1">Report Submitted</h3>
                <p className="text-sm text-[#64748B] mb-4">Thank you for helping keep the forum safe. Our team will review this content.</p>
                <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1E293B]">Reason *</label>
                  {REASONS.map((r) => (
                    <label key={r.value} htmlFor={`report-reason-${r.value}`} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        id={`report-reason-${r.value}`}
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="w-4 h-4 text-[#06B6D4] border-slate-300 focus:ring-[#06B6D4]"
                      />
                      <span className="text-sm text-[#1E293B] group-hover:text-[#06B6D4] transition-colors">{r.label}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#1E293B]">Additional details (optional)</label>
                  <textarea
                    id="report-details"
                    name="reportDetails"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Provide any additional context..."
                    className="w-full text-sm border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-[#06B6D4] resize-none"
                  />
                  <p className="text-[11px] text-[#94A3B8] text-right">{details.length}/500</p>
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
                  <Button type="button" variant="secondary" size="sm" className="w-full sm:flex-1 justify-center" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="danger" size="sm" className="w-full sm:flex-1 justify-center" isLoading={isSubmitting}>
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportModal;

