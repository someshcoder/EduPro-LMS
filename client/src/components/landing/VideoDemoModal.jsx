import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, CheckCircle2, Sparkles, Volume2, ShieldCheck } from 'lucide-react';

const VideoDemoModal = ({ isOpen, onClose, onGetStarted }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          className="relative bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-4xl overflow-hidden z-10 text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Interactive Player Simulation */}
          <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
              alt="CourseEarn Platform Walkthrough"
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Center Play Button Overlay */}
            <div className="relative z-10 text-center space-y-4 max-w-lg px-4">
              <div className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40 cursor-pointer transform hover:scale-110 transition-all duration-300">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  CourseEarn Platform Tour (2 min)
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Watch how our interactive video player, built-in code editor, and live progress tracking work seamlessly.
                </p>
              </div>
            </div>

            {/* Video Controls Bar Simulation */}
            <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between text-xs text-slate-400 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-3">
                <Play className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                <span>01:14 / 02:45</span>
                <div className="w-32 sm:w-64 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-indigo-500 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  1080p HD
                </span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-6 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Full student dashboard included in all accounts</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onGetStarted();
              }}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
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
