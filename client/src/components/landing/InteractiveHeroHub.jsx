import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  TrendingUp, 
  Trophy, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  DollarSign, 
  Award, 
  Zap, 
  GraduationCap, 
  Check,
  ChevronRight
} from 'lucide-react';

const TRACKS = [
  {
    id: 'web-dev',
    title: 'Full-Stack Web & Next.js',
    icon: Code,
    category: 'Development',
    level: 'Beginner to Pro',
    modules: 8,
    duration: '32 Hours',
    rating: '4.95',
    tagline: 'Build production-ready apps with Node, React & MongoDB',
    highlights: ['REST APIs & Database Design', 'Full Authentication System', 'Live Project Deployment'],
  },
  {
    id: 'affiliate',
    title: 'Traffic & Affiliate Mastery',
    icon: TrendingUp,
    category: 'Marketing',
    level: 'All Levels',
    modules: 6,
    duration: '24 Hours',
    rating: '4.98',
    tagline: 'High-converting organic traffic & automated affiliate funnels',
    highlights: ['Social Media Growth Loops', 'High-Ticket Conversion', '2-Tier Affiliate Scaling'],
  },
  {
    id: 'paid-ads',
    title: 'Performance & Paid Ads Pro',
    icon: Zap,
    category: 'Advertising',
    level: 'Intermediate',
    modules: 7,
    duration: '28 Hours',
    rating: '4.92',
    tagline: 'Scale Facebook, Google & YouTube ad campaigns with high ROI',
    highlights: ['Ad Copywriting & Creatives', 'Audience Targeting & Retargeting', 'Budget Optimization'],
  },
  {
    id: 'foundations',
    title: 'Digital Foundations & Business',
    icon: GraduationCap,
    category: 'Business',
    level: 'Starter',
    modules: 5,
    duration: '18 Hours',
    rating: '4.96',
    tagline: 'The essential playbook for digital creators & entrepreneurs',
    highlights: ['Brand Positioning & Identity', 'Content Strategy & Sales', 'Freelancing Fundamentals'],
  },
];

const PACKAGES = [
  { name: 'Starter', price: 2000, l1: 600, l2: 200 },
  { name: 'Intermediate', price: 4000, l1: 1200, l2: 400 },
  { name: 'Advanced', price: 6000, l1: 1800, l2: 600 },
  { name: 'Ultimate', price: 8000, l1: 2400, l2: 800 },
];

export default function InteractiveHeroHub({ onExploreClick, onStartLearning }) {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'calculator' | 'certificate'
  
  // Tab 1: Course Track state
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const activeTrack = TRACKS[selectedTrackIndex];

  // Tab 2: Calculator state
  const [referralsCount, setReferralsCount] = useState(8);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(1); // Intermediate (₹4,000) default
  const activePkg = PACKAGES[selectedPkgIndex];
  
  const directCommission = referralsCount * activePkg.l1;
  const indirectReferrals = Math.round(referralsCount * 1.5);
  const indirectCommission = indirectReferrals * activePkg.l2;
  const totalEarnings = directCommission + indirectCommission;

  // Tab 3: Certificate state
  const [studentName, setStudentName] = useState('Rahul Sharma');

  return (
    <div className="relative">
      {/* Main Interactive LMS Window Card */}
      <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-6 shadow-2xl shadow-slate-200/90 border border-slate-200 overflow-hidden">
        
        {/* Top Window Bar & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
              CourseEarn Interactive Hub
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </div>

          {/* Interactive Mode Pills */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 self-start sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-white text-[#06B6D4] shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Explore Tracks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-emerald-600 shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Earn Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('certificate')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'certificate'
                  ? 'bg-white text-purple-600 shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display with Animated Transitions */}
        <div className="min-h-[340px]">
          <AnimatePresence mode="wait">
            
            {/* ══════════════ TAB 1: INTERACTIVE COURSE TRACKS ══════════════ */}
            {activeTab === 'courses' && (
              <motion.div
                key="tab-courses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Horizontal Track Selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRACKS.map((t, idx) => {
                    const isSelected = selectedTrackIndex === idx;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTrackIndex(idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-50 to-purple-50/50 border-[#06B6D4] shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#06B6D4]' : 'text-slate-500'}`} />
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />}
                        </div>
                        <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-[#0891B2]' : 'text-[#1E293B]'}`}>
                          {t.category}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Track Showcase Card */}
                <div className="bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative">
                  <div className="flex items-center justify-between text-xs text-[#06B6D4] font-semibold mb-2">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {activeTrack.level}
                    </span>
                    <div className="flex items-center gap-1 text-[#1E293B] font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{activeTrack.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-[#1E293B] mb-1">
                    {activeTrack.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-3.5 line-clamp-2">
                    {activeTrack.tagline}
                  </p>

                  {/* Modules & Highlights */}
                  <div className="space-y-2 mb-4 bg-white/80 p-3 rounded-xl border border-slate-200/80 text-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">What You Will Master:</div>
                    {activeTrack.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[#1E293B]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Metrics & Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/70 text-xs">
                    <div className="flex items-center gap-3 text-[#64748B] font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                        {activeTrack.duration}
                      </span>
                      <span>•</span>
                      <span>{activeTrack.modules} Practical Modules</span>
                    </div>

                    <button
                      type="button"
                      onClick={onExploreClick}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white font-bold text-xs shadow-md shadow-cyan-200 hover:opacity-95 transition-all hover:scale-105 cursor-pointer"
                    >
                      <span>Explore Courses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════ TAB 2: INTERACTIVE EARNING CALCULATOR ══════════════ */}
            {activeTab === 'calculator' && (
              <motion.div
                key="tab-calculator"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Header intro */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#1E293B]">CourseEarn Affiliate Calculator</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">Earn 30% Level 1 + 10% Level 2 Lifetime</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-white border border-emerald-300 text-emerald-700 rounded-full shadow-2xs">
                    Instant Payouts
                  </span>
                </div>

                {/* Tier Selector Pills */}
                <div>
                  <label className="text-[11px] font-bold text-[#64748B] block mb-1.5 uppercase tracking-wider">
                    Select Recommended Package Tier:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PACKAGES.map((pkg, idx) => {
                      const isSelected = selectedPkgIndex === idx;
                      return (
                        <button
                          key={pkg.name}
                          type="button"
                          onClick={() => setSelectedPkgIndex(idx)}
                          className={`py-2 px-1 rounded-xl text-center text-xs transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold border-transparent shadow-xs'
                              : 'bg-slate-50 text-[#1E293B] border-slate-200 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <div className="text-[11px] truncate">{pkg.name}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-[#64748B]'}`}>
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Slider */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#1E293B]">Monthly Enrollments via Your Link:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-[#0891B2] font-extrabold text-sm">
                      {referralsCount} Students
                    </span>
                  </div>
                  <input
                    id="hero-affiliate-slider"
                    name="referralsCount"
                    type="range"
                    min="1"
                    max="50"
                    value={referralsCount}
                    onChange={(e) => setReferralsCount(Number(e.target.value))}
                    className="w-full accent-[#06B6D4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#94A3B8] font-semibold mt-1">
                    <span>1 student</span>
                    <span>25 students</span>
                    <span>50 students</span>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-300 font-medium">Estimated Monthly Earnings:</div>
                    <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                      ₹{totalEarnings.toLocaleString('en-IN')}
                      <span className="text-xs text-slate-300 font-normal"> / month</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Direct (L1): ₹{directCommission.toLocaleString('en-IN')} + Team (L2): ₹{indirectCommission.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onStartLearning}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-900 font-extrabold text-xs shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                  >
                    Start Earning →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ══════════════ TAB 3: LIVE VERIFIED CERTIFICATE ══════════════ */}
            {activeTab === 'certificate' && (
              <motion.div
                key="tab-certificate"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Name Customizer Input */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="hero-cert-name" className="text-[11px] font-bold text-[#64748B] block mb-1 uppercase tracking-wider">
                      Type Your Name To Preview Certificate:
                    </label>
                    <input
                      id="hero-cert-name"
                      name="studentName"
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student name..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                    />
                  </div>
                  <div className="pt-5">
                    <span className="text-[11px] font-bold px-2.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-1 whitespace-nowrap">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Live Verified
                    </span>
                  </div>
                </div>

                {/* Visual Certificate Mockup */}
                <div className="relative rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-amber-100/40 p-4 sm:p-5 border-2 border-amber-300 shadow-sm overflow-hidden text-center">
                  <div className="absolute top-2 left-2 text-[10px] font-extrabold tracking-widest uppercase text-amber-700">
                    CourseEarn Academy
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-400">
                    ID: CE-2026-98A
                  </div>

                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 mb-2 mt-3">
                    <Award className="w-5 h-5" />
                  </div>

                  <div className="text-[11px] tracking-widest uppercase font-semibold text-slate-500">
                    Official Certificate of Completion
                  </div>

                  <div className="text-lg sm:text-xl font-serif font-extrabold text-[#1E293B] my-1 border-b border-amber-200/80 pb-1 max-w-xs mx-auto truncate">
                    {studentName.trim() || 'Student Name'}
                  </div>

                  <p className="text-[11px] text-[#64748B] max-w-sm mx-auto mb-3">
                    Has successfully completed verified coursework with practical capstone submission.
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-amber-200/60 max-w-xs mx-auto">
                    <div className="text-left">
                      <span className="block font-bold text-[#1E293B]">Dr. Rajesh Sharma</span>
                      <span>Director of Academics</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-bold">
                      ★ Gold Verified
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Shareable on LinkedIn & Resume
                  </span>

                  <button
                    type="button"
                    onClick={onStartLearning}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all hover:scale-105 cursor-pointer"
                  >
                    <span>Earn Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Floating Card 1: Verified Certificate / Trust Badge (Top-Right) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="absolute -top-5 -right-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl shadow-slate-200/90 border border-slate-200 hidden sm:flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-[#1E293B]">100% Verified Skills</div>
          <div className="text-[10px] text-emerald-600 font-semibold">LinkedIn Ready Badges</div>
        </div>
      </motion.div>

      {/* Floating Card 2: 5-Star Mentor & Payout Badge (Bottom-Left) */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-5 -left-3 z-20 bg-white rounded-2xl p-3 shadow-xl shadow-slate-200/90 border border-slate-200 hidden sm:flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
          <Star className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#1E293B] flex items-center gap-1">
            <span>4.98 Rating</span>
            <span className="text-amber-500 font-normal">(10k+ Learners)</span>
          </div>
          <div className="text-[10px] text-[#64748B]">Instant Bank & UPI Payouts</div>
        </div>
      </motion.div>
    </div>
  );
}
