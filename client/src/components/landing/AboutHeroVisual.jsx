import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Zap
} from 'lucide-react';

const PILLARS = [
  {
    id: 'learning',
    title: 'Skill Mastery',
    label: 'Academy',
    icon: GraduationCap,
    badge: 'Industry-Standard',
    badgeColor: 'bg-cyan-50 text-[#0891B2] border-cyan-200',
    headline: 'Practical Skills That Move Careers Forward',
    description: 'Learn through structured, step-by-step modular lessons with real-world projects and mentor feedback.',
    highlights: [
      '18+ In-Demand Digital Courses & 4 Packages',
      'Production-Ready Capstone Projects',
      'Self-Paced High-Definition Video Lectures'
    ],
    metricValue: '18+ Courses',
    metricLabel: 'Categorized Curricula'
  },
  {
    id: 'earning',
    title: 'Partner Network',
    label: 'Affiliate',
    icon: TrendingUp,
    badge: 'Transparent Payouts',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    headline: 'Ethical, High-Yield Partner Ecosystem',
    description: 'Empowering learners and creators with transparent 2-tier affiliate commissions and real-time ledger tracking.',
    highlights: [
      'Level 1: 30% Direct Referral Commission',
      'Level 2: 10% Indirect Team Commission',
      'Automated Weekly UPI & Bank Disbursements'
    ],
    metricValue: '₹1.2Cr+',
    metricLabel: 'Paid to Community'
  },
  {
    id: 'credential',
    title: 'Verification',
    label: 'Credentials',
    icon: Award,
    badge: 'Cryptographic Proof',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    headline: 'Verifiable Proof of Genuine Competence',
    description: 'Every completed track delivers an official certificate with a cryptographic verification hash.',
    highlights: [
      'Instant LinkedIn & Resume Integration',
      'Unique Verification ID & Digital Seals',
      'Evaluated Rigorously on Coursework'
    ],
    metricValue: '100% Proof',
    metricLabel: 'Tamper-Proof Badges'
  }
];

export default function AboutHeroVisual() {
  const [activeTab, setActiveTab] = useState(0);
  const activePillar = PILLARS[activeTab];
  const Icon = activePillar.icon;

  return (
    <div className="relative">
      {/* Main Glassmorphic Showcase Window Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-200/90 border border-slate-200 overflow-hidden">
        
        {/* Window Top Bar with System Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              CourseEarn Ecosystem Architecture
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active & Verified</span>
          </div>
        </div>

        {/* 3 Pillars Segmented Control */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-5">
          {PILLARS.map((pillar, idx) => {
            const isSelected = activeTab === idx;
            const PillarIcon = pillar.icon;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#06B6D4] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <PillarIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#06B6D4]' : 'text-slate-400'}`} />
                <span className="truncate">{pillar.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Pillar Card Display */}
        <div className="min-h-[290px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Header Badge & Metric */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${activePillar.badgeColor}`}>
                  {activePillar.badge}
                </span>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#1E293B]">{activePillar.metricValue}</div>
                  <div className="text-[10px] text-[#64748B]">{activePillar.metricLabel}</div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-4 rounded-2xl border border-slate-200/90">
                <h3 className="text-base sm:text-lg font-extrabold text-[#1E293B] mb-1.5 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-[#06B6D4] shrink-0" />
                  <span>{activePillar.headline}</span>
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mb-3.5">
                  {activePillar.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 bg-white/90 p-3 rounded-xl border border-slate-200/80">
                  {activePillar.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#1E293B]">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="font-medium truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Trust Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-[#64748B] font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>100% Transparent Governance</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified & Regulated</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Floating Card 1: ISO & Industry Standard (Top-Right) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
        className="absolute -top-5 -right-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl shadow-slate-200/90 border border-slate-200 hidden sm:flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-[#1E293B]">ISO 9001:2015 Aligned</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Quality-Driven Curricula</div>
        </div>
      </motion.div>

      {/* Floating Card 2: 100% Transparent Community (Bottom-Left) */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-5 -left-3 z-20 bg-white rounded-2xl p-3 shadow-xl shadow-slate-200/90 border border-slate-200 hidden sm:flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center border border-purple-200">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#1E293B] flex items-center gap-1">
            <span>₹1.2Cr+ Disbursed</span>
          </div>
          <div className="text-[10px] text-[#64748B]">Automated UPI & Bank Payouts</div>
        </div>
      </motion.div>
    </div>
  );
}
