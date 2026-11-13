import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle2, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

const VideoDemoModal = ({ isOpen, onClose, onGetStarted }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden z-10 text-[#1E293B]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 hover:bg-white text-[#1E293B] transition-colors border border-slate-200 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Interactive Player Simulation */}
          <div className="relative aspect-video w-full bg-slate-900 flex flex-col items-center justify-center overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
              alt="CourseEarn Platform Walkthrough"
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Center Play Button Overlay */}
            <div className="relative z-10 text-center space-y-3 sm:space-y-4 max-w-lg px-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-95 text-white flex items-center justify-center mx-auto shadow-2xl shadow-[#06B6D4]/40 cursor-pointer transform hover:scale-110 transition-all duration-300">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
              </div>
              <div>
                <h3 className="text-base sm:text-2xl font-extrabold text-white">
                  CourseEarn Platform Tour (2 min)
                </h3>
                <p className="text-xs text-slate-200 mt-1 line-clamp-2 sm:line-clamp-none">
                  Watch how our interactive video player, built-in code editor, and live progress tracking work seamlessly.
                </p>
              </div>
            </div>

            {/* Video Controls Bar Simulation */}
            <div className="hidden sm:flex absolute bottom-4 left-6 right-6 z-20 items-center justify-between text-xs text-white bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4 fill-[#06B6D4] text-[#06B6D4]" />
                <span>01:14 / 02:45</span>
                <div className="w-32 sm:w-64 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-[#06B6D4] rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-[11px] font-bold text-[#06B6D4] bg-white/20 px-2 py-0.5 rounded">
                  1080p HD
                </span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-6 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
              <span>Full student dashboard included in all accounts</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onGetStarted();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-[#06B6D4]/20 transition-all hover:scale-105"
            >
              Start Free Trial Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoDemoModal;
