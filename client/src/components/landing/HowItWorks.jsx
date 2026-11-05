import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  PlayCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Award
} from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../../data/landingData';

const iconMap = {
  UserPlus: UserPlus,
  PlayCircle: PlayCircle,
  CheckCircle2: CheckCircle2,
};

const HowItWorks = ({ onStartAction }) => {
  return (
    <section id="how-it-works" className="py-20 bg-[#F8FAFC] relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-3 border border-cyan-100">
            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Simple 3-Step Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            How CourseEarn Works
          </h2>
          <p className="mt-2 text-base text-[#64748B]">
            Start learning in three frictionless steps and earn verifiable industry credentials.
          </p>
        </div>

        {/* Steps Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-[18%] right-[18%] h-0.5 border-t-2 border-dashed border-slate-200 -translate-y-8 -z-0" />

          {HOW_IT_WORKS_STEPS.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || CheckCircle2;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                className="relative z-10 p-8 rounded-2xl bg-white border border-slate-200 hover:border-[#06B6D4]/50 hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all duration-300 flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Step Header: Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent tracking-tight">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8B5CF6] border border-purple-100 shadow-xs flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Highlight pill */}
                  <div className="mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-50 text-[#06B6D4] border border-cyan-100">
                      {item.highlight}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1E293B] mb-2.5">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs font-semibold text-[#64748B] flex items-center justify-between">
                  <span>{item.badge}</span>
                  <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-14 text-center">
          <button
            onClick={onStartAction}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-[#06B6D4]/20 transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <span>Start Your Learning Journey Now</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
