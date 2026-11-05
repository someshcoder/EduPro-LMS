import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  GraduationCap
} from 'lucide-react';

const CTASection = ({ onExploreClick, onCreateAccount }) => {
  return (
    <section className="relative py-24 bg-linear-to-b from-white via-cyan-50/30 to-[#F8FAFC] text-[#1E293B] overflow-hidden border-t border-slate-200">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#06B6D4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#06B6D4 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Top Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start Your Transformational Journey Today</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h2 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E293B] leading-tight mb-6"
        >
          Ready to Start <span className="bg-linear-to-r from-[#06B6D4] via-[#8B5CF6] to-[#FB7185] bg-clip-text text-transparent">Learning?</span>
        </motion.h2>

        {/* Supporting Text */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Join thousands of learners and take the next step toward your goals. Master full-stack dev, AI, UI/UX, and cloud infrastructure with hands-on projects.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={onExploreClick}
            className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#1E293B] font-bold text-sm border border-slate-200 shadow-xs transition-all hover:scale-105"
          >
            Explore Courses
          </button>

          <button
            onClick={onCreateAccount}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-[#06B6D4]/25 transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </motion.div>

        {/* Guarantees & Social Proof Row */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
            <span>14-Day Money-Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
            <span>Bank-Grade 256-Bit SSL Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#06B6D4]" />
            <span>Instant Full Course Access</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CTASection;
