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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          className="relative bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="relative aspect-[21/9] w-full bg-slate-950 overflow-hidden">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
                  {course.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                  {course.level}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white line-clamp-2">
                {course.title}
              </h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">Student Rating</span>
                <div className="flex items-center gap-1 font-bold text-white text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating}</span>
                  <span className="text-slate-500 font-normal">({course.reviewsCount})</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">Enrolled</span>
                <span className="font-bold text-white text-sm">{course.studentsCount} learners</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">Total Duration</span>
                <span className="font-bold text-white text-sm">{course.duration} ({course.totalLessons} lectures)</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-medium">Certification</span>
                <span className="font-bold text-indigo-400 text-sm flex items-center gap-1">
                  <Award className="w-4 h-4" /> Included
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                About this Course
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* What you'll learn / Features */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Key Highlights Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {course.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/30">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Syllabus & Modules
              </h3>
              <div className="space-y-2">
                {course.curriculum.map((module, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs font-semibold text-white">
                    <div className="w-6 h-6 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {i + 1}
                    </div>
                    <span>{module}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Box */}
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center gap-4">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-700"
              />
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Taught By</span>
                <h4 className="text-sm font-bold text-white">{course.instructor.name}</h4>
                <p className="text-xs text-slate-400">{course.instructor.role}</p>
              </div>
            </div>

            {/* Bottom Checkout Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">${course.price}</span>
                {course.originalPrice && (
                  <span className="text-sm text-slate-500 line-through font-medium">
                    ${course.originalPrice}
                  </span>
                )}
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                  Lifetime Access
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors w-1/2 sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEnrollClick}
                  className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2 w-1/2 sm:w-auto"
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
