import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, AlertCircle } from 'lucide-react';
import { forumService } from '../../services/forumService';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const MAX_TAGS = 10;

const EditQuestionModal = ({ question, onClose, onSuccess }) => {
  const [title, setTitle] = useState(question.title || '');
  const [description, setDescription] = useState(question.description || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(question.tags || []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required.';
    else if (title.trim().length < 10) errs.title = 'Title must be at least 10 characters.';
    if (!description.trim()) errs.description = 'Description is required.';
    else if (description.trim().length < 20) errs.description = 'Description must be at least 20 characters.';
    return errs;
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const raw = tagInput.trim().replace(/^#/, '').toLowerCase().replace(/[^a-z0-9\-_]/g, '');
      if (!raw) return;
      if (raw.length > 30) return toast.error('Tag too long.');
      if (tags.includes(raw)) return toast.error('Tag already added.');
      if (tags.length >= MAX_TAGS) return toast.error(`Max ${MAX_TAGS} tags.`);
      setTags([...tags, raw]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      const res = await forumService.editQuestion(question._id, {
        title: title.trim(),
        description: description.trim(),
        tags: JSON.stringify(tags),
      });
      toast.success('Question updated!');
      onSuccess?.(res.data.question);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#F1F5F9]">
            <h2 className="text-base font-bold text-[#1E293B]">Edit Question</h2>
            <button onClick={onClose} className="p-2 rounded-lg text-[#64748B] hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B]">Title <span className="text-rose-500">*</span></label>
              <input
                id="edit-question-title"
                name="title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({...errors, title: ''}); }}
                maxLength={300}
                className={`w-full text-sm border rounded-xl px-3 py-2.5 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all ${errors.title ? 'border-rose-400' : 'border-[#E2E8F0] focus:border-[#06B6D4]'}`}
              />
              {errors.title && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B]">Description <span className="text-rose-500">*</span></label>
              <textarea
                id="edit-question-description"
                name="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors({...errors, description: ''}); }}
                maxLength={10000}
                rows={6}
                className={`w-full text-sm border rounded-xl px-3 py-2.5 text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-cyan-200 resize-none transition-all ${errors.description ? 'border-rose-400' : 'border-[#E2E8F0] focus:border-[#06B6D4]'}`}
              />
              {errors.description && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1E293B]">Tags</label>
              <div className="flex flex-wrap gap-1.5 p-2.5 border border-[#E2E8F0] rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-cyan-200 focus-within:border-[#06B6D4] transition-all">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-cyan-50 text-[#06B6D4] border border-cyan-200 text-xs font-medium px-2 py-0.5 rounded-full">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-rose-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length < MAX_TAGS && (
                  <input
                    id="edit-question-tag-input"
                    name="tagInput"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag..."
                    className="flex-1 min-w-[100px] text-sm text-[#1E293B] placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditQuestionModal;

