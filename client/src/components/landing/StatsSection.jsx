import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { PLATFORM_STATS, TRUSTED_COMPANIES } from '../../data/landingData';

const iconMap = {
  Users: Users,
  BookOpen: BookOpen,
  Award: Award,
  TrendingUp: TrendingUp,
};

const StatsSection = () => {
  return (
    <section className="relative py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {PLATFORM_STATS.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Users;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative p-4 sm:p-6 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#06B6D4] flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#06B6D4] group-hover:to-[#8B5CF6] group-hover:text-white transition-all">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1E293B] mb-1">
                  {stat.label}
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Company Logos / Career Outcomes Ribbon */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-[#06B6D4]" />
            <span>CourseEarn Alumni Work At World-Class Companies</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 sm:gap-10 opacity-80 hover:opacity-100 transition-opacity">
            {TRUSTED_COMPANIES.map((company) => (
              <div key={company.name} className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-[#1E293B] text-sm tracking-wide transition-colors">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>{company.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;
