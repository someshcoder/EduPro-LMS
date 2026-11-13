import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Paperclip, Trash2, AlertCircle, HelpCircle } from 'lucide-react';
import { forumService } from '../../services/forumService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const MAX_TITLE = 300;
const MAX_DESC = 10000;
const MAX_TAGS = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AskQuestionModal = ({ isOpen, onClose, onSuccess }) => {
  const { updateUser } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required.';
    else if (title.trim().length < 10) errs.title = 'Title must be at least 10 characters.';
    else if (title.trim().length > MAX_TITLE) errs.title = `Title must be at most ${MAX_TITLE} characters.`;
    if (!description.trim()) errs.description = 'Description is required.';
    else if (description.trim().length < 20) errs.description = 'Description must be at least 20 characters.';
    return errs;
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const raw = tagInput.trim().replace(/^#/, '').toLowerCase().replace(/[^a-z0-9\-_]/g, '');
      if (!raw) return;
      if (raw.length > 30) return toast.error('Tag too long (max 30 characters).');
      if (tags.includes(raw)) return toast.error('Tag already added.');
      if (tags.length >= MAX_TAGS) return toast.error(`Max ${MAX_TAGS} tags allowed.`);
      setTags([...tags, raw]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t) => setTags(tags.filter((x) => x !== t));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = [];
    for (const f of selected) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: unsupported type. Allowed: images, PDF, text.`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: file too large (max 5MB).`);
        continue;
      }
      valid.push(f);
    }
    if (files.length + valid.length > 3) {
      toast.error('Maximum 3 attachments allowed.');
      return;
    }
    setFiles([...files, ...valid]);
    e.target.value = '';
  };

  const handleRemoveFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const handleClose = () => {
    if (isSubmitting) return;
    setTitle(''); setDescription(''); setTagInput(''); setTags([]); setFiles([]); setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('tags', JSON.stringify(tags));
      files.forEach((f) => formData.append('attachments', f));

      const res = await forumService.createQuestion(formData);
      toast.success(res.data.message || 'Question posted! +10 Forum Coins earned 🎉');

      // Update wallet balance in auth store
      if (res.data.coinsEarned) {
        updateUser({
          walletBalance: (useAuthStore.getState().user?.walletBalance || 0) + res.data.coinsEarned,
        });
      }

      onSuccess?.(res.data.question);
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post question.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-lg font-bold text-[#1E293B]">Ask a Question</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-[#64748B] hover:bg-slate-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coin reward hint */}
            <div className="mx-4 sm:mx-6 mt-4 mb-0 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-base">🪙</span>
              <p className="text-xs font-medium text-amber-700">
                You'll earn <strong>+10 Forum Coins</strong> automatically after successfully posting your question.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#1E293B]">
                  Question Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="ask-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({...errors, title: ''}); }}
                  placeholder="Be specific and clear — e.g. How do I use React hooks for API calls?"
                  maxLength={MAX_TITLE}
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all ${
                    errors.title ? 'border-rose-400 focus:border-rose-400' : 'border-[#E2E8F0] focus:border-[#06B6D4]'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.title ? (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.title}
                    </p>
                  ) : <span />}
                  <span className="text-[11px] text-[#94A3B8]">{title.length}/{MAX_TITLE}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#1E293B]">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="ask-description"
                  name="description"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors({...errors, description: ''}); }}
                  placeholder="Describe your problem in detail. Include what you've tried, error messages, and relevant context..."
                  maxLength={MAX_DESC}
                  rows={5}
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 resize-none transition-all ${
                    errors.description ? 'border-rose-400 focus:border-rose-400' : 'border-[#E2E8F0] focus:border-[#06B6D4]'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.description ? (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.description}
                    </p>
                  ) : <span />}
                  <span className="text-[11px] text-[#94A3B8]">{description.length}/{MAX_DESC}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#1E293B]">
                  Tags <span className="text-[#94A3B8] font-normal text-xs">(optional, max 10)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 border border-[#E2E8F0] rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-cyan-200 focus-within:border-[#06B6D4] transition-all">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 bg-cyan-50 text-[#06B6D4] border border-cyan-200 text-xs font-medium px-2 py-0.5 rounded-full">
                      <Tag className="w-2.5 h-2.5" />#{t}
                      <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-500 transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length < MAX_TAGS && (
                    <input
                      id="ask-tag-input"
                      name="tagInput"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={tags.length === 0 ? 'Type a tag and press Enter... e.g. react' : 'Add tag...'}
                      className="flex-1 min-w-[120px] text-sm text-[#1E293B] placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  )}
                </div>
                <p className="text-[11px] text-[#94A3B8]">Press Enter or comma to add a tag</p>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1E293B]">
                  Attachments <span className="text-[#94A3B8] font-normal text-xs">(optional, max 3 files, 5MB each)</span>
                </label>
                <div
                  onClick={() => files.length < 3 && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                    files.length < 3
                      ? 'border-[#E2E8F0] hover:border-[#06B6D4] hover:bg-cyan-50/30 cursor-pointer'
                      : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Paperclip className="w-5 h-5 text-[#94A3B8] mx-auto mb-1" />
                  <p className="text-xs text-[#64748B]">
                    {files.length < 3 ? 'Click to attach images, PDFs, or text files' : 'Maximum 3 files reached'}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">Supported: jpg, png, webp, gif, pdf, txt</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="ask-attachments"
                  name="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2">
                        <Paperclip className="w-4 h-4 text-[#64748B] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#1E293B] truncate">{f.name}</p>
                          <p className="text-[11px] text-[#94A3B8]">{(f.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile(i)} className="p-1 rounded text-[#94A3B8] hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                  Post Question
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AskQuestionModal;

