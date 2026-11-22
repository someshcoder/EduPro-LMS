import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Star, 
  Search
} from 'lucide-react';
import InteractiveHeroHub from './InteractiveHeroHub';

const Hero = ({ onExploreClick, onStartLearning, onQuickSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onQuickSearch) {
      onQuickSearch(searchQuery);
    }
  };

  const trendingTags = ['Web & Content', 'Social & Marketing', 'Design & UI/UX', 'Ads & Traffic'];

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-transparent">
      {/* Background Decorative Accents (Soft Pastel Orbs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-60 -z-10">
        <div className="absolute -top-24 left-10 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl" />
        <div className="absolute top-48 left-1/3 w-80 h-80 bg-rose-300/15 rounded-full blur-3xl" />
      </div>

      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
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
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-50 text-[#06B6D4] text-xs font-semibold shadow-xs border border-cyan-200/80">
              <span className="flex h-2 w-2 rounded-full bg-[#06B6D4] animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-[11px]">CourseEarn 2.0</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#64748B]">The Modern EdTech LMS Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E293B] leading-[1.12]">
              Learn New Skills.{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#FB7185]">
                Build Your Future.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-cyan-400/40 -z-10"
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
            <p className="text-lg sm:text-xl text-[#64748B] font-normal leading-relaxed max-w-2xl">
              Access expert-led courses, learn at your own pace, track your progress in real-time, and build the skills you need to achieve your career goals.
            </p>

            {/* Quick Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="p-1.5 bg-white rounded-2xl shadow-xl shadow-cyan-950/5 border border-slate-200 flex flex-col sm:flex-row items-center gap-2 max-w-xl"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <label htmlFor="hero-search-query" className="sr-only">
                  Search courses
                </label>
                <Search className="w-5 h-5 text-[#64748B] shrink-0" />
                <input
                  id="hero-search-query"
                  name="q"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn? (e.g. React, Python, AI...)"
                  aria-label="What do you want to learn?"
                  className="w-full px-3 py-2.5 text-sm text-[#1E293B] bg-transparent placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-95 text-white text-sm font-semibold transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>

            {/* Trending tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#64748B] font-medium">
              <span className="font-semibold text-[#1E293B]">Popular Searches:</span>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    if (onQuickSearch) onQuickSearch(tag);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-[#06B6D4] hover:border-cyan-200 text-[#64748B] transition-colors border border-slate-200 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-95 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore All Courses</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Trust & Social Proof Row */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-slate-200">
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
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white text-[#1E293B] flex items-center justify-center text-xs font-bold shadow-xs">
                  +10k
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-bold text-[#1E293B] text-sm ml-1">4.9/5</span>
                </div>
                <span className="text-xs text-[#64748B] font-medium">
                  Trusted by over <strong className="text-[#1E293B] font-semibold">10,000+ ambitious learners</strong>
                </span>
              </div>
            </div>

          </motion.div>

          {/* Right Hero Visual / Interactive Showcase Hub */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <InteractiveHeroHub 
              onExploreClick={onExploreClick} 
              onStartLearning={onStartLearning} 
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
