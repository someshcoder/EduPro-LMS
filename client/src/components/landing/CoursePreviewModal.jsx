import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Clock, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Sparkles,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const CoursePreviewModal = ({ course, isOpen, onClose, onEnroll }) => {
  if (!isOpen || !course) return null;

  const handleEnrollClick = () => {
    onClose();
    if (onEnroll) {
      onEnroll(course);
    } else {
      toast.success(`🎉 You're enrolling in ${course.title}!`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 text-[#1E293B]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-[#1E293B] transition-colors shadow-sm border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="relative aspect-[21/9] w-full bg-slate-100 overflow-hidden">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#06B6D4] text-xs font-bold border border-slate-200/50 shadow-xs">
                  {course.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                  {course.level}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white line-clamp-2">
                {course.title}
              </h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3 sm:p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium">Student Rating</span>
                <div className="flex items-center gap-1 font-bold text-[#1E293B] text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating}</span>
                  <span className="text-[#64748B] font-normal">({course.reviewsCount || '120+'})</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium">Enrolled</span>
                <span className="font-bold text-[#1E293B] text-sm">{course.studentsCount} learners</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium">Total Duration</span>
                <span className="font-bold text-[#1E293B] text-sm">{course.duration} ({course.totalLessons} {course.totalLessons === 1 ? 'lecture' : 'lectures'})</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-[#64748B] font-medium">Certification</span>
                <span className="font-bold text-[#06B6D4] text-sm flex items-center gap-1">
                  <Award className="w-4 h-4" /> Included
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-2">
                About this Course
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line">
                {course.description ? course.description.replace(/\*\*/g, '').replace(/^#+\s/g, '') : 'Learn comprehensive and practical industry-level skills.'}
              </p>
            </div>

            {/* What you'll learn / Features */}
            <div>
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-3">
                Key Highlights Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(course.features || [
                  'Complete hands-on video modules',
                  'Verified Course Completion Certificate',
                  'Direct practical learning & techniques',
                  'Lifetime updates & access'
                ]).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#1E293B] font-medium bg-cyan-50/80 p-2.5 rounded-xl border border-cyan-100">
                    <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wider mb-3">
                Syllabus & Modules
              </h3>
              <div className="space-y-2">
                {(course.curriculum || [
                  'Module 1: Fundamental Concepts & Framework Overview',
                  'Module 2: Practical Step-by-Step Implementation',
                  'Module 3: Growth, Optimization & Advanced Strategies'
                ]).map((module, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs font-semibold text-[#1E293B]">
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-[#06B6D4] flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                      {i + 1}
                    </div>
                    <span>{module}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Box */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center gap-4">
              <img
                src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={course.instructor?.name || 'Instructor'}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <span className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Taught By</span>
                <h4 className="text-sm font-bold text-[#1E293B]">{course.instructor?.name || 'CourseEarn Expert'}</h4>
                <p className="text-xs text-[#64748B]">{course.instructor?.role || 'Senior Industry Mentor'}</p>
              </div>
            </div>

            {/* Bottom Checkout Action */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#1E293B]">₹{Number(course.price || 0).toLocaleString('en-IN')}</span>
                {course.originalPrice && (
                  <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                    ₹{Number(course.originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-bold text-[#06B6D4] bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                  Lifetime Access
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 sm:px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#64748B] text-xs font-bold transition-colors flex-1 sm:flex-initial text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEnrollClick}
                  className="px-5 sm:px-7 py-3 rounded-xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-[#06B6D4]/20 transition-all hover:scale-105 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <span>Enroll in Course</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CoursePreviewModal;
