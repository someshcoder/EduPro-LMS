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
    <section id="categories" className="py-20 bg-slate-950 relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Top Disciplines</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Course Categories
          </h2>
          <p className="mt-2 text-base text-slate-400">
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
                className="group relative p-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon + Badge / Arrow */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-white group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-colors flex items-center justify-center shadow-sm">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {cat.badge && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {cat.badge}
                        </span>
                      )}
                      <div className="w-7 h-7 rounded-full bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-300 transition-all">
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors mb-1.5">
                    {cat.name}
                  </h3>

                  {/* Subtitle / Topics */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Course Count */}
                <div className="pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="font-semibold text-white">{cat.courseCount} Courses</span>
                  <span className="text-slate-500">{cat.studentCount} Students</span>
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
