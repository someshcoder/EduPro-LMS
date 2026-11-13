import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { FAQS } from '../../data/landingData';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="py-20 bg-white relative border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider mb-3 border border-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-base text-[#64748B]">
            Everything you need to know about our learning platform, certifications, and guarantees.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#F8FAFC] border border-slate-200 overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-[#1E293B] hover:text-[#06B6D4] transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <div className={`p-1.5 rounded-lg bg-white border border-slate-200 text-[#64748B] transition-transform duration-200 shadow-2xs flex-shrink-0 ${isOpen ? 'rotate-180 bg-cyan-50 border-cyan-100 text-[#06B6D4]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-200 pt-3 sm:pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
