import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  ArrowRight, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  BookOpen, 
  Trophy, 
  Users, 
  Code, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Search
} from 'lucide-react';

const Hero = ({ onExploreClick, onStartLearning, onWatchDemo, onQuickSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onQuickSearch) {
      onQuickSearch(searchQuery);
    }
  };

  const trendingTags = ['Full Stack', 'AI & ML', 'Figma UI/UX', 'DevOps', 'Python'];

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 -z-10">
        <div className="absolute -top-24 left-10 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
        <div className="absolute top-48 left-1/3 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm shadow-slate-900/10 border border-slate-800">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">EduPro 2.0</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200">The Modern EdTech LMS Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              Learn New Skills.{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                Build Your Future.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-emerald-400/40 -z-10"
                  viewBox="0 0 250 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C60 3 190 3 247 9"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              Access expert-led courses, learn at your own pace, track your progress in real-time, and build the skills you need to achieve your career goals.
            </p>

            {/* Quick Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="p-1.5 bg-white rounded-2xl shadow-lg shadow-slate-200/70 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 max-w-xl"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn? (e.g. React, Python, AI...)"
                  className="w-full px-3 py-2.5 text-sm text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </form>

            {/* Trending tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">Popular Searches:</span>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    if (onQuickSearch) onQuickSearch(tag);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors border border-slate-200/60"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 flex items-center gap-2.5 group"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onStartLearning}
                className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Start Learning Free
              </button>

              <button
                onClick={onWatchDemo}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm transition-all hover:border-slate-300 flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>Platform Demo</span>
              </button>
            </div>

            {/* Trust & Social Proof Row */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-slate-200/70">
              <div className="flex -space-x-2.5">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
                ].map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="Student Avatar"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  +10k
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-bold text-slate-900 text-sm ml-1">4.9/5</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Trusted by over <strong className="text-slate-800 font-semibold">10,000+ ambitious learners</strong>
                </span>
              </div>
            </div>

          </motion.div>

          {/* Right Hero Visual / Interactive Educational Dashboard Mock */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            {/* Main Interactive LMS Dashboard Card */}
            <div className="relative z-10 bg-white rounded-3xl p-6 shadow-2xl shadow-slate-300/60 border border-slate-200/90 overflow-hidden">
              
              {/* Window Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-500">EduPro Student Dashboard</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/70">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live Study Mode</span>
                </div>
              </div>

              {/* Active Course Card Preview */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-5 text-white shadow-md relative overflow-hidden mb-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4" /> Full-Stack Engineering
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Module 4 of 8
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-3">
                  Building Scalable REST & GraphQL APIs with Node.js
                </h3>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Course Progress</span>
                    <span className="font-bold text-emerald-400">76% Completed</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-3/4 transition-all duration-1000" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> 18h 45m left
                  </span>
                  <button 
                    onClick={onStartLearning}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                  >
                    <span>Resume Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Weekly Learning Analytics Mini Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-medium">Weekly Goal</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">14.2 <span className="text-xs font-normal text-slate-500">/ 15 hrs</span></div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">⚡ 94% on track</div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-medium">Certificates</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">3 <span className="text-xs font-normal text-slate-500">Earned</span></div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">1 in progress</div>
                </div>
              </div>

              {/* Upcoming Live Mentorship Session */}
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                    alt="Instructor"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Live Q&A with Sarah Jenkins</div>
                    <div className="text-[11px] text-slate-500">Staff Eng @ Stripe • Starts in 45 min</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm">
                  Join
                </span>
              </div>
            </div>

            {/* Floating Card 1: Certificate Achievement Badge (Top-Right) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute -top-6 -right-4 z-20 bg-white rounded-2xl p-3.5 shadow-xl shadow-slate-300/60 border border-slate-200/80 hidden sm:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Verified Certificate</div>
                <div className="text-[11px] text-emerald-600 font-semibold">Ready to share on LinkedIn</div>
              </div>
            </motion.div>

            {/* Floating Card 2: 5-Star Mentor Rating (Bottom-Left) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -left-4 z-20 bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl shadow-slate-950/20 border border-slate-800 hidden sm:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>4.98 Mentor Rating</span>
                  <span className="text-emerald-400">★</span>
                </div>
                <div className="text-[11px] text-slate-300">Top 1% Global Tech Mentors</div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
