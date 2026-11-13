import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  GraduationCap, 
  Activity, 
  Award, 
  Infinity as InfinityIcon, 
  ShieldCheck, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { WHY_CHOOSE_FEATURES } from '../../data/landingData';

const iconMap = {
  Smartphone: Smartphone,
  GraduationCap: GraduationCap,
  Activity: Activity,
  Award: Award,
  Infinity: InfinityIcon,
  ShieldCheck: ShieldCheck,
};

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="py-20 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider mb-3 border border-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Platform Advantages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Why Choose CourseEarn PlatForm
          </h2>
          <p className="mt-2 text-base text-[#64748B]">
            Engineered from the ground up to give you the highest quality learning experience and verified career outcomes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_FEATURES.map((feature, idx) => {
            const IconComponent = iconMap[feature.icon] || ShieldCheck;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-5 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#06B6D4]/50 hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all duration-300 group flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#06B6D4] group-hover:bg-linear-to-r group-hover:from-[#06B6D4] group-hover:to-[#8B5CF6] group-hover:text-white transition-colors flex items-center justify-center border border-cyan-100 shadow-xs">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-[#64748B] border border-slate-200 shadow-2xs">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#1E293B] mb-2.5 group-hover:text-[#06B6D4] transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-[#06B6D4]">
                  <Check className="w-4 h-4 text-[#06B6D4]" />
                  <span>Standard on all courses</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
