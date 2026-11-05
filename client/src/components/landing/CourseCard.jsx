import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Eye, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';

const CourseCard = ({ course, onPreview, onEnroll }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-[#06B6D4]/50 hover:shadow-xl hover:shadow-[#06B6D4]/5 transition-all duration-300 flex flex-col overflow-hidden relative shadow-xs"
    >
      {/* Course Thumbnail Image with Zoom Effect */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[#1E293B] text-xs font-bold shadow-sm border border-slate-200/80">
            {course.category}
          </span>
          {course.badge && (
            <span className="px-2.5 py-1 rounded-lg bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] text-white text-xs font-bold shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {course.badge}
            </span>
          )}
        </div>

        {/* Level Tag (Bottom-Right overlay) */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-sm text-[#1E293B] text-[11px] font-semibold border border-slate-200/80 shadow-xs">
            {course.level}
          </span>
        </div>
      </div>

      {/* Course Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Rating & Students */}
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2.5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[#1E293B]">{course.rating}</span>
              <span className="text-[#64748B]">({course.reviewsCount?.toLocaleString() || '150'})</span>
            </div>
            <div className="flex items-center gap-1 text-[#64748B] font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.studentsCount} students</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onPreview(course)}
            className="text-base font-bold text-[#1E293B] group-hover:text-[#06B6D4] transition-colors line-clamp-2 leading-snug cursor-pointer mb-2"
          >
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
            {course.description ? course.description.replace(/\*\*/g, '').replace(/^#+\s/g, '') : 'Comprehensive course designed to build high-demand skills.'}
          </p>

          {/* Key Course Stats */}
          <div className="flex items-center gap-4 text-xs text-[#64748B] pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.totalLessons} {course.totalLessons === 1 ? 'Video' : 'Videos'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Instructor & Pricing/CTA */}
        <div className="pt-4 mt-auto">
          {/* Instructor Row */}
          <div className="flex items-center gap-2.5 mb-4">
            <img
              src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={course.instructor?.name || 'Mentor'}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-[#1E293B] truncate">
                {course.instructor?.name || 'CourseEarn Expert'}
              </span>
              <span className="text-[10px] text-[#64748B] truncate">
                {course.instructor?.role || 'Senior Specialist'}
              </span>
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-[#1E293B]">
                  ₹{Number(course.price || 0).toLocaleString('en-IN')}
                </span>
                {course.originalPrice && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    ₹{Number(course.originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-[#06B6D4]">
                Lifetime Access
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPreview(course)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E293B] transition-colors"
                title="Quick Course Preview"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onEnroll(course)}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm shadow-[#06B6D4]/20 flex items-center gap-1.5 group-hover:shadow-md"
              >
                <span>Enroll</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
