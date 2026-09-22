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
      className="group bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Course Thumbnail Image with Zoom Effect */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/95 backdrop-blur-md text-white text-xs font-bold shadow-sm border border-slate-700/50">
            {course.category}
          </span>
          {course.badge && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm shadow-indigo-950/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {course.badge}
            </span>
          )}
        </div>

        {/* Level Tag (Bottom-Right overlay) */}
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[11px] font-medium border border-slate-700/50">
            {course.level}
          </span>
        </div>
      </div>

      {/* Course Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Rating & Students */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">{course.rating}</span>
              <span className="text-slate-500">({course.reviewsCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{course.studentsCount} students</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onPreview(course)}
            className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug cursor-pointer mb-2"
          >
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {course.description}
          </p>

          {/* Key Course Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>{course.totalLessons} Lessons</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Instructor & Pricing/CTA */}
        <div className="pt-4 mt-auto">
          {/* Instructor Row */}
          <div className="flex items-center gap-2.5 mb-4">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate">
                {course.instructor.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {course.instructor.role}
              </span>
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-white">
                  ${course.price}
                </span>
                {course.originalPrice && (
                  <span className="text-xs text-slate-500 line-through font-medium">
                    ${course.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-indigo-400">
                Lifetime Access
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPreview(course)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Quick Course Preview"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onEnroll(course)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 group-hover:shadow-md"
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
