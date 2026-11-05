import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import { LIVE_NOTIFICATION_ITEMS } from '../../data/landingData';

const LiveNotificationToast = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial notification after 3 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Cycle through notifications every 12 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % LIVE_NOTIFICATION_ITEMS.length);
        setIsVisible(true);
      }, 1000);
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const currentItem = LIVE_NOTIFICATION_ITEMS[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-6 z-40 max-w-sm bg-white rounded-2xl p-3.5 shadow-2xl shadow-slate-900/10 border border-slate-200/90 flex items-center gap-3.5"
        >
          {/* Green Pulse Ring */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 truncate">
                {currentItem.student}
              </span>
              <span className="text-[10px] text-slate-400">({currentItem.location})</span>
            </div>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              Just enrolled in <strong className="text-slate-900 font-semibold">{currentItem.course}</strong>
            </p>
            <span className="text-[9px] text-slate-400 mt-0.5 block">{currentItem.time}</span>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveNotificationToast;
