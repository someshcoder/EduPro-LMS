import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  BrainCircuit, 
  Database, 
  Palette, 
  ShieldCheck, 
  Cloud, 
  TrendingUp, 
  Briefcase, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '../../data/landingData';

const iconMap = {
  Code: Code,
  BrainCircuit: BrainCircuit,
  Database: Database,
  Palette: Palette,
  ShieldCheck: ShieldCheck,
  Cloud: Cloud,
  TrendingUp: TrendingUp,
  Briefcase: Briefcase,
};

const CategoriesSection = ({ onSelectCategory }) => {
  return (
    <section id="categories" className="py-20 bg-[#F8FAFC] relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-3 border border-cyan-100">
            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Top Disciplines</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Explore Course Categories
          </h2>
          <p className="mt-2 text-base text-[#64748B]">
            Choose from a wide variety of in-demand technology and business fields crafted by industry leaders.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || Code;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className="group relative p-6 rounded-2xl bg-white hover:bg-white border border-slate-200 hover:border-[#06B6D4]/50 hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Top Bar: Icon + Badge / Arrow */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-[#06B6D4] group-hover:bg-linear-to-r group-hover:from-[#06B6D4] group-hover:to-[#8B5CF6] group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {cat.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-purple-50 text-[#8B5CF6] border border-purple-100">
                          {cat.badge}
                        </span>
                      )}
                      <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#06B6D4] group-hover:text-white flex items-center justify-center text-[#64748B] transition-all">
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-base font-bold text-[#1E293B] group-hover:text-[#06B6D4] transition-colors mb-1.5">
                    {cat.name}
                  </h3>

                  {/* Subtitle / Topics */}
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Course Count */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B] font-medium">
                  <span className="font-semibold text-[#1E293B]">{cat.courseCount} Courses</span>
                  <span className="text-slate-400">{cat.studentCount} Students</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CategoriesSection;
