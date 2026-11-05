import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2,
  BadgeCheck 
} from 'lucide-react';
import { TESTIMONIALS } from '../../data/landingData';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-[#F8FAFC] relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-3 border border-cyan-100">
              <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Real Student Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              What Our Students Say
            </h2>
            <p className="mt-2 text-base text-[#64748B] max-w-xl">
              Discover how CourseEarn graduates landed engineering, design, and AI roles at top companies worldwide.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={prevTestimonial}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#1E293B] transition-colors shadow-xs"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#1E293B] transition-colors shadow-xs"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#06B6D4]/50 hover:shadow-xl hover:shadow-[#06B6D4]/10 transition-all duration-300 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#06B6D4] bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md">
                    <BadgeCheck className="w-3 h-3 text-[#06B6D4]" />
                    {item.badge}
                  </span>
                </div>

                {/* Course Name */}
                <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Course: {item.course}
                </div>

                {/* Quote */}
                <p className="text-xs text-[#1E293B] leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              {/* Student Profile Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-[#1E293B] truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-[#64748B] truncate font-medium">
                    {item.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
