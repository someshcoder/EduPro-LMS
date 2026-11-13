import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Users, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Award
} from 'lucide-react';
import { INSTRUCTORS } from '../../data/landingData';

const InstructorsSection = ({ onBecomeInstructor, onExploreInstructor }) => {
  return (
    <section id="instructors" className="py-20 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider mb-3 border border-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>World-Class Mentorship</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Learn From Industry Experts
          </h2>
          <p className="mt-2 text-base text-[#64748B]">
            Our instructors are engineering leaders, principal scientists, and staff designers from top tech companies.
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-14">
          {INSTRUCTORS.map((instructor, idx) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-[#F8FAFC] rounded-2xl border border-slate-200 hover:border-[#06B6D4]/50 hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xs"
            >
              <div>
                {/* Image Container with Top Badge */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={instructor.avatar}
                    alt={instructor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[#1E293B] text-[11px] font-bold shadow-sm border border-slate-200/80">
                      {instructor.badge}
                    </span>
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-white/95 backdrop-blur-sm text-amber-500 text-xs font-bold border border-slate-200/80 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[#1E293B]">{instructor.rating}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#1E293B] group-hover:text-[#06B6D4] transition-colors">
                    {instructor.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#8B5CF6] mb-2">
                    {instructor.role} • <span className="text-[#1E293B] font-bold">{instructor.company}</span>
                  </div>

                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
                    {instructor.bio}
                  </p>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {instructor.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 rounded-md bg-white text-[#64748B] border border-slate-200 text-[10px] font-semibold shadow-2xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Metrics */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-1 font-semibold text-[#1E293B]">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{instructor.students} students</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-[#1E293B]">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{instructor.coursesCount} Courses</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Banner: "Become an Instructor" */}
        <div className="rounded-3xl bg-linear-to-r from-cyan-50 via-purple-50/40 to-pink-50/30 border border-slate-200 p-5 sm:p-10 text-[#1E293B] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left z-10 w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#06B6D4]">Teach on CourseEarn</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">
              Share your expertise with 10,000+ global students
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
              Earn competitive payouts, build your personal brand, and mentor the next generation of top tech professionals.
            </p>
          </div>

          <button
            onClick={onBecomeInstructor}
            className="z-10 shrink-0 w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 text-white text-sm font-bold shadow-lg shadow-[#06B6D4]/20 transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>Apply as an Instructor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default InstructorsSection;
