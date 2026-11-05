import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  TrendingUp,
  Share2,
  Award,
  Compass,
  Clock,
  ShieldCheck,
  Users,
  Target,
  BarChart3,
  Layers,
  GraduationCap,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Zap,
  Globe,
  Coins,
  FileCheck2,
  Lock,
  HeartHandshake,
  Check,
  Eye,
  Activity,
  Lightbulb,
  ExternalLink,
  Info
} from 'lucide-react';

import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import BackToTop from '../components/landing/BackToTop';
import useAuthStore from '../store/authStore';

// ─── Ambient Floating Background Orb ──────────────────────────────
const AmbientOrb = ({ className = '', delay = 0, duration = 8 }) => (
  <motion.div
    animate={{
      y: [0, -25, 0],
      x: [0, 15, 0],
      scale: [1, 1.08, 1],
      opacity: [0.15, 0.30, 0.15],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
    className={`absolute rounded-full pointer-events-none blur-3xl -z-10 ${className}`}
  />
);

// ─── Animation Variants ───────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: custom * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// ─── Data Definitions ─────────────────────────────────────────────

// Story Cards
const STORY_CARDS = [
  {
    icon: Target,
    title: 'Learn with Purpose',
    subtitle: 'Practical Skills That Matter',
    description:
      'Help learners develop high-value, market-relevant skills through structured curricula, hands-on application, and focused learning pathways designed for real-world execution.',
    badge: 'Foundation',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    accentColor: 'cyan',
    points: [
      'Industry-aligned syllabus',
      'Step-by-step modular lessons',
      'Actionable projects & assignments',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Grow with Confidence',
    subtitle: 'Measurable Mastery & Proof',
    description:
      'Encourage learners to track their individual milestones, assess skill retention, celebrate progress, and build authentic confidence as they progress from fundamentals to advanced concepts.',
    badge: 'Progression',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: 'purple',
    points: [
      'Real-time lesson progress analytics',
      'Milestone achievement badges',
      'Verified certificates upon completion',
    ],
  },
  {
    icon: Share2,
    title: 'Earn Through Opportunity',
    subtitle: 'Sustainable Partner Ecosystem',
    description:
      'Introduce transparent affiliate opportunities that empower eligible members to share courses, build their referral network, and earn tiered commissions based on platform policies.',
    badge: 'Opportunity',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: 'emerald',
    points: [
      'Multi-tier commission structure',
      'Dedicated referral link generator',
      'Real-time clicks & conversion insights',
    ],
  },
];

// Ecosystem Features
const ECOSYSTEM_CARDS = [
  {
    id: 'explore-courses',
    title: 'Explore Courses',
    tagline: 'Curated knowledge paths',
    description:
      'Discover learning opportunities across relevant technical and digital categories to build competitive, practical knowledge.',
    extended:
      'Browse through in-depth modules ranging from Full-Stack Development and AI to Growth Marketing and Design Tokens.',
    icon: Compass,
    actionLabel: 'View Course Catalog',
    link: '/courses',
    color: 'from-indigo-500/10 to-indigo-600/5',
    borderColor: 'group-hover:border-indigo-500/40',
    iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'learn-pace',
    title: 'Learn at Your Pace',
    tagline: 'Flexible on-demand learning',
    description:
      'Access lessons seamlessly across devices, resume where you left off, and tailor your study schedule to your daily routine.',
    extended:
      'High-speed streaming, downloadable resources, and progress auto-saving ensure uninterrupted learning at any schedule.',
    icon: Clock,
    actionLabel: 'Go to Student Dashboard',
    link: '/dashboard',
    color: 'from-blue-500/10 to-blue-600/5',
    borderColor: 'group-hover:border-blue-500/40',
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'track-achievements',
    title: 'Track Achievements',
    tagline: 'Verified skill credentials',
    description:
      'Celebrate completed courses, milestones, and authentic digital certificates to showcase your capabilities.',
    extended:
      'Each certificate features a unique verification hash ready to link directly to your resume or LinkedIn profile.',
    icon: Award,
    actionLabel: 'Explore Certifications',
    link: '/dashboard',
    color: 'from-emerald-500/10 to-emerald-600/5',
    borderColor: 'group-hover:border-emerald-500/40',
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'become-affiliate',
    title: 'Become an Affiliate',
    tagline: 'Share & grow together',
    description:
      'Explore referral opportunities, share eligible courses with your network, and understand how transparent commissions work.',
    extended:
      'Join our two-level referral program with instant link creation, marketing assets, and platform guideline support.',
    icon: Share2,
    actionLabel: 'Affiliate Portal',
    link: '/affiliate',
    color: 'from-violet-500/10 to-purple-600/5',
    borderColor: 'group-hover:border-violet-500/40',
    iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'monitor-performance',
    title: 'Monitor Performance',
    tagline: 'Data-driven overview',
    description:
      'View referral clicks, conversion activity, commission breakdown, and available wallet payout requests in one place.',
    extended:
      'Built-in analytics charts display daily referral trends, qualified leads, and processed disbursement histories.',
    icon: BarChart3,
    actionLabel: 'View Performance',
    link: '/wallet',
    color: 'from-teal-500/10 to-teal-600/5',
    borderColor: 'group-hover:border-teal-500/40',
    iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  },
  {
    id: 'grow-community',
    title: 'Grow with Community',
    tagline: 'Collaborative ecosystem',
    description:
      'Encourage peer discussions, knowledge sharing, live mentor interactions, and constructive collaboration.',
    extended:
      'Participate in dedicated community channels to ask questions, solve challenges, and network with driven peers.',
    icon: Users,
    actionLabel: 'Join the Discussion',
    link: '/contact',
    color: 'from-amber-500/10 to-amber-600/5',
    borderColor: 'group-hover:border-amber-500/40',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

// 5-Step Journey
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Join the Platform',
    headline: 'Create your account & set up your profile',
    description:
      'Sign up in less than a minute. Gain immediate access to the student dashboard, orientation guides, and the course library.',
    detail: 'Instant dashboard setup • Clean onboarding walkthrough',
    icon: GraduationCap,
  },
  {
    step: '02',
    title: 'Choose Your Path',
    headline: 'Select curated courses matching your ambitions',
    description:
      'Explore categories across software engineering, digital product design, marketing, and business packages that fit your career roadmap.',
    detail: 'Detailed curriculum syllabus • Instructor credentials',
    icon: Compass,
  },
  {
    step: '03',
    title: 'Learn and Progress',
    headline: 'Engage with lessons and build practical mastery',
    description:
      'Complete high-definition video lessons, participate in interactive quizzes, track retention, and submit milestone checkpoints.',
    detail: 'Auto-saved progress • Mobile-friendly video player',
    icon: BookOpen,
  },
  {
    step: '04',
    title: 'Explore Affiliate Program',
    headline: 'Access marketing tools & share eligible courses',
    description:
      'Eligible learners can unlock custom referral links to introduce friends, colleagues, or social communities to CourseEarn curricula.',
    detail: 'Transparent multi-tier payout structure • Real-time tracking',
    icon: Share2,
  },
  {
    step: '05',
    title: 'Celebrate Your Growth',
    headline: 'Collect verified certificates & track partner metrics',
    description:
      'Receive official certificates upon course completion and review your affiliate performance metrics through your personalized portal.',
    detail: 'Verified digital credentials • Detailed payout summaries',
    icon: Award,
  },
];

// Why Choose Us (8 Value Propositions)
const VALUE_PROPOSITIONS = [
  {
    title: 'Learning & Earning in One Ecosystem',
    description:
      'Rather than isolating education from real-world utility, CourseEarn aligns high-caliber learning with authentic partner incentives under one cohesive login.',
    icon: Layers,
    accent: 'indigo',
  },
  {
    title: 'Structured, Focused Curricula',
    description:
      'Every course is broken down into concise, coherent modules. We prioritize practical application and conceptual clarity over bloated hour counts.',
    icon: Target,
    accent: 'purple',
  },
  {
    title: 'Transparent Progress Tracking',
    description:
      'Interactive dashboards make learning tangible. Monitor completed lectures, upcoming milestones, and study streaks in real-time.',
    icon: TrendingUp,
    accent: 'emerald',
  },
  {
    title: 'Accessible Course Discovery',
    description:
      'Clear categorized packages help both beginners and experienced pros find precisely the skills they need to advance their careers.',
    icon: Compass,
    accent: 'blue',
  },
  {
    title: 'Empowering Affiliate Architecture',
    description:
      'Understand exactly how referral tiers operate with clear commission policies, fraud protection, and timely wallet settlement requests.',
    icon: Coins,
    accent: 'violet',
  },
  {
    title: 'Intuitive, Modern Experience',
    description:
      'Engineered with a responsive, high-performance interface with dark-mode ergonomics, instant search, and zero unnecessary friction.',
    icon: Zap,
    accent: 'amber',
  },
  {
    title: 'Community-Oriented Growth',
    description:
      'Connect with dedicated peers and mentors who share your dedication to professional development and continuous upskilling.',
    icon: Users,
    accent: 'teal',
  },
  {
    title: 'Commitment to Integrity & Quality',
    description:
      'No exaggerated promises or get-rich-quick schemes. We maintain transparent pricing, clear course previews, and honest terms.',
    icon: ShieldCheck,
    accent: 'emerald',
  },
];

// Core Values
const CORE_VALUES = [
  {
    name: 'Accessibility',
    quote: 'Knowledge without unnecessary hurdles.',
    description:
      'We believe high-quality education should be straightforward to access, intuitively organized, and easily navigated on any screen.',
    icon: Globe,
    gradient: 'from-blue-500/20 via-indigo-500/20 to-transparent',
    borderGlow: 'hover:border-blue-500/40',
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    name: 'Growth',
    quote: 'Continuous, compounding improvement.',
    description:
      'We empower both personal and professional evolution—helping members steadily expand their practical skills, confidence, and career prospects.',
    icon: TrendingUp,
    gradient: 'from-indigo-500/20 via-purple-500/20 to-transparent',
    borderGlow: 'hover:border-indigo-500/40',
    iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    name: 'Transparency',
    quote: 'Clarity in every rule, policy, and metric.',
    description:
      'We clearly delineate between academic accomplishments and affiliate earnings. Terms, commissions, and policies are stated up front.',
    icon: FileCheck2,
    gradient: 'from-purple-500/20 via-pink-500/20 to-transparent',
    borderGlow: 'hover:border-purple-500/40',
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    name: 'Community',
    quote: 'Collaborative energy accelerates success.',
    description:
      'A supportive ecosystem where instructors, learners, and affiliates engage constructively, exchange tips, and cheer each other on.',
    icon: HeartHandshake,
    gradient: 'from-emerald-500/20 via-teal-500/20 to-transparent',
    borderGlow: 'hover:border-emerald-500/40',
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
];

// Trust & Transparency Points
const TRUST_PRINCIPLES = [
  {
    title: 'Clear Course & Package Details',
    desc: 'Transparent module syllabi, estimated completion time, and prerequisite outlines so learners make well-informed choices.',
  },
  {
    title: 'Explicit Commission Guidelines',
    desc: 'Structured, documented payout tiers and eligibility requirements with no hidden asterisks or arbitrary fee cuts.',
  },
  {
    title: 'Responsible Representation',
    desc: 'We never frame affiliate marketing as guaranteed income or passive wealth; earnings correlate directly to legitimate referrals.',
  },
  {
    title: 'Secure Account Handling',
    desc: 'Modern token-based authentication, protected user data, and verified payment channels for peace of mind.',
  },
  {
    title: 'Separation of Learning & Finance',
    desc: 'Course completion credentials reflect authentic learning rigor, evaluated completely independent of referral activity.',
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    q: 'What is CourseEarn?',
    a: 'CourseEarn is an integrated EdTech platform that combines high-quality, practical online courses with an optional affiliate partner program. It gives learners the resources to acquire career-ready digital skills while providing eligible members the opportunity to share courses and earn commissions.',
  },
  {
    q: 'How does the learning platform work?',
    a: 'Once you sign up and choose a course, you gain full access to self-paced video modules, supplementary guides, and milestone checkpoints. You can learn from your laptop or mobile phone, pause anytime, resume automatically, and receive an authentic completion certificate when you finish.',
  },
  {
    q: 'Who can join CourseEarn?',
    a: 'Anyone looking to upgrade their skills can join! Whether you are a college student, early-career software engineer, aspiring marketer, freelancer, or someone looking to explore affiliate marketing, CourseEarn welcomes ambitious learners from all backgrounds.',
  },
  {
    q: 'How can I explore available courses?',
    a: 'You can browse our course catalog directly on the website under the Courses section. Each course lists its overview, syllabus modules, instructor profile, and learning objectives so you know exactly what you will master before enrolling.',
  },
  {
    q: 'What is the CourseEarn affiliate program?',
    a: 'The affiliate program is an optional channel that allows registered, eligible users to promote CourseEarn courses to their networks. When an individual enrolls through your unique referral link, you receive a commission as defined by our active partner tier structure.',
  },
  {
    q: 'How do affiliate commissions work?',
    a: 'CourseEarn supports a transparent multi-tier commission system. Level 1 commissions apply to direct enrollments via your link, while Level 2 commissions apply when your eligible network members refer others. Payouts can be tracked in real-time and withdrawn via the Wallet once minimum thresholds are met.',
  },
  {
    q: 'Can I use CourseEarn for learning and affiliate marketing?',
    a: 'Yes, absolutely! Many of our most successful affiliate partners are active learners who share courses they have personally taken and gained value from. You can engage with both features simultaneously or focus entirely on coursework—it is completely your choice.',
  },
  {
    q: 'Where can I get help or support?',
    a: 'Our support team is always ready to help. You can visit our Contact page, submit a support ticket, email us at support@courseearn.io, or reach out to our dedicated WhatsApp help desk during business hours.',
  },
];

// ─── Component: Interactive FAQ Accordion Item ────────────────────
const FaqAccordionItem = ({ faq, isOpen, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isOpen
        ? 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-purple-50 shadow-lg shadow-cyan-100'
        : 'border-slate-200 bg-white hover:border-slate-300'
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none cursor-pointer"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isOpen ? 'bg-cyan-100 text-[#06B6D4]' : 'bg-slate-100 text-[#64748B]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
        </div>
        <span
          className={`text-sm sm:text-base font-semibold transition-colors ${
            isOpen ? 'text-[#1E293B]' : 'text-[#1E293B] hover:text-[#06B6D4]'
          }`}
        >
          {faq.q}
        </span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="shrink-0"
      >
        <ChevronDown
          className={`w-4 h-4 transition-colors ${
            isOpen ? 'text-[#06B6D4]' : 'text-[#64748B]'
          }`}
        />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
        >
          <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-slate-200">
            {faq.a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── Main About Page Component ────────────────────────────────────
export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0); // first FAQ open by default
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState('all'); // 'all', 'learning', 'affiliate'
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Scroll to section helper
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 90;
      const elPos = el.getBoundingClientRect().top;
      const offsetPos = elPos + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPos, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-cyan-200 selection:text-cyan-900 overflow-x-hidden relative">
      
      {/* ── Top Ambient Illumination ── */}
      <AmbientOrb
        className="top-10 left-1/4 w-[500px] h-[500px] bg-cyan-300/20"
        delay={0}
        duration={9}
      />
      <AmbientOrb
        className="top-40 right-10 w-[450px] h-[450px] bg-purple-300/20"
        delay={2}
        duration={11}
      />
      <AmbientOrb
        className="top-[1400px] left-10 w-[600px] h-[600px] bg-cyan-200/15"
        delay={4}
        duration={12}
      />
      <AmbientOrb
        className="top-[2800px] right-20 w-[550px] h-[550px] bg-purple-200/15"
        delay={1}
        duration={10}
      />

      {/* Subtle Dot Grid Backdrop */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(#06B6D4 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Fixed Navigation Bar ── */}
      <Navbar
        onOpenAuth={(tab) => navigate(`/${tab}`)}
        onSearchClick={() => navigate('/courses')}
      />

      <main className="flex-1">

        {/* ═════════════════════════════════════════════════════════════
            SECTION 1: HERO SECTION
            “Empowering Ambition Through Learning & Opportunity”
        ═════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative pt-36 pb-20 lg:pt-44 lg:pb-32 overflow-hidden border-b border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="lg:col-span-7 space-y-7"
              >
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-200 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#06B6D4] animate-ping" />
                  <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-[#06B6D4]">
                    ABOUT COURSEEARN | LEARN. GROW. EARN.
                  </span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1E293B] leading-[1.12]">
                  Empowering Ambition Through{' '}
                  <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#06B6D4]">
                    Learning & Opportunity.
                    <svg
                      className="absolute left-0 -bottom-2 w-full h-3 text-cyan-300 -z-10"
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

                {/* Supporting Description */}
                <p className="text-base sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-2xl">
                  CourseEarn unites structured, career-focused skill development, verifiable milestone achievements, and transparent affiliate partner channels into one frictionless digital platform. Designed for curious learners, ambitious creators, and forward-thinking builders.
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => scrollTo('ecosystem')}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-cyan-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group cursor-pointer"
                  >
                    <span>Explore Our Platform</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => scrollTo('story')}
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-semibold text-sm sm:text-base border border-slate-200 shadow-md transition-all duration-200 hover:border-[#06B6D4] flex items-center gap-2 cursor-pointer"
                  >
                    <span>Our Purpose & Story</span>
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  </button>
                </div>

                {/* Micro Highlights Pill Row */}
                <div className="pt-4 grid grid-cols-3 gap-3 sm:gap-6 border-t border-slate-200 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Curated Modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span>Verified Badges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                    <span>Transparent Tiers</span>
                  </div>
                </div>

              </motion.div>

              {/* Right Column: Dynamic Ecosystem Mockup Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.2 }}
                className="lg:col-span-5 relative"
              >
                {/* Central Ecosystem Container Card */}
                <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200 border border-slate-200 overflow-hidden">
                  
                  {/* Top Bar / Mac header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-xs font-semibold text-[#64748B]">CourseEarn Ecosystem Hub</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-50 text-[#06B6D4] border border-cyan-200 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Dual Track Active
                    </span>
                  </div>

                  {/* Card 1: Live Course Progress */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 hover:border-cyan-300 transition-colors">
                    <div className="flex items-center justify-between text-xs text-[#06B6D4] font-semibold mb-2">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
                        Full-Stack Engineering Path
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-50 text-[#06B6D4] font-bold border border-cyan-200">
                        84% Done
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#1E293B] mb-2.5">
                      Distributed Microservices & Cloud APIs
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#06B6D4] rounded-full w-[84%]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
                      <span>Module 7 of 8 completed</span>
                      <span className="text-emerald-600 font-medium">Next: Capstone Exam</span>
                    </div>
                  </div>

                  {/* Dual Grid: Achievement + Referral Stream */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Mini card: Verified Credential */}
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-[#64748B] font-medium">Credential</span>
                        <Award className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-xs font-bold text-[#1E293B]">Full-Stack Certified</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Blockchain Hash Ready
                      </div>
                    </div>

                    {/* Mini card: Referral Activity */}
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-[#64748B] font-medium">Affiliate Track</span>
                        <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      <div className="text-xs font-bold text-[#1E293B]">Level 2 Tier Active</div>
                      <div className="text-[10px] text-[#8B5CF6] font-semibold mt-1">
                        ⚡ Real-time attribution
                      </div>
                    </div>
                  </div>

                  {/* Community & Mentorship Row */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-100 text-[#06B6D4] flex items-center justify-center font-bold text-xs border border-cyan-200">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E293B]">Connected Community</div>
                        <div className="text-[11px] text-[#64748B]">Collaborative study groups & peer reviews</div>
                      </div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#06B6D4] text-white font-bold">
                      Active
                    </span>
                  </div>

                </div>

                {/* Floating Decorative Badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-4 z-20 bg-white rounded-2xl p-3.5 shadow-xl shadow-slate-200 border border-slate-200 hidden sm:flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E293B]">Verified Certificate</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Ready to share on LinkedIn</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-4 z-20 bg-white rounded-2xl p-3.5 shadow-xl shadow-slate-200 border border-slate-200 hidden sm:flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-[#06B6D4] flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E293B]">Transparent Commissions</div>
                    <div className="text-[10px] text-[#64748B]">Clear 2-Level Referral Structure</div>
                  </div>
                </motion.div>

              </motion.div>

            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 2: OUR STORY — WHY COURSEEARN EXISTS
            “A Vision to Make Learning More Rewarding”
        ═════════════════════════════════════════════════════════════ */}
        <section id="story" className="py-24 relative border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#8B5CF6] text-xs font-semibold mb-4">
                <Compass className="w-3.5 h-3.5" />
                OUR ORIGIN & PURPOSE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-tight">
                A Vision to Make Learning{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6]">
                  More Rewarding.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
                Traditional education often isolates skill acquisition from practical, tangible progression. CourseEarn exists to bridge that gap—combining focused, structured learning with legitimate affiliate empowerment so dedication is recognized at every phase.
              </p>
            </div>

            {/* 3 Story Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {STORY_CARDS.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    variants={fadeInUp}
                    custom={idx}
                    className="relative rounded-3xl bg-white p-8 border border-slate-200 hover:border-cyan-300 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#06B6D4] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                          {card.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#1E293B] mb-1.5">{card.title}</h3>
                      <div className="text-xs font-semibold text-[#06B6D4] mb-4">{card.subtitle}</div>
                      <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                        {card.description}
                      </p>
                    </div>

                    {/* Feature points */}
                    <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-[#64748B]">
                      {card.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 3: OUR MISSION & VISION
            Side-by-side distinctive cards
        ═════════════════════════════════════════════════════════════ */}
        <section id="mission-vision" className="py-24 relative border-b border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
                <Target className="w-3.5 h-3.5" />
                FOUNDATIONAL PILLARS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Our Mission & Vision
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                The core convictions that direct every roadmap decision, course curriculum, and platform policy.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Mission Card */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/30 border border-indigo-500/30 shadow-xl shadow-indigo-950/30 hover:border-indigo-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <Target className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25">
                    Our Mission
                  </span>
                </div>

                <blockquote className="text-xl sm:text-2xl font-bold text-white leading-snug mb-6">
                  “To make learning more accessible, engaging, and rewarding by connecting skill development with meaningful opportunities.”
                </blockquote>

                <p className="text-sm text-slate-300 leading-relaxed mb-8">
                  We believe no student should waste months on outdated theory. By crafting curriculum with practical relevance and coupling it with ethical partner avenues, we empower individuals to unlock their true potential.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="text-xs font-bold text-indigo-300">Accessibility</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Zero friction entry</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="text-xs font-bold text-indigo-300">Engagement</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Hands-on practice</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="text-xs font-bold text-indigo-300">Reward</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Tangible growth</div>
                  </div>
                </div>
              </motion.div>

              {/* Vision Card */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-purple-950/30 border border-purple-500/30 shadow-xl shadow-purple-950/30 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                    <Compass className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25">
                    Our Vision
                  </span>
                </div>

                <blockquote className="text-xl sm:text-2xl font-bold text-white leading-snug mb-6">
                  “To build a trusted learning ecosystem where people can develop their skills, celebrate their progress, and discover new opportunities for growth.”
                </blockquote>

                <p className="text-sm text-slate-300 leading-relaxed mb-8">
                  We envision a transparent global community where learning and sustainable growth reinforce one another, creating an evergreen cycle of mastery, collaboration, and personal achievement.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="text-xs font-bold text-purple-300">Trust</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Documented policies</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="text-xs font-bold text-purple-300">Progress</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Verified certificates</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div className="text-xs font-bold text-purple-300">Ecosystem</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Thriving network</div>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 4: THE COURSEEARN ECOSYSTEM
            “One Platform. Multiple Ways to Grow.” (6 Feature Cards)
        ═════════════════════════════════════════════════════════════ */}
        <section id="ecosystem" className="py-24 relative border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#06B6D4] text-xs font-semibold mb-4">
                <Layers className="w-3.5 h-3.5" />
                INTERACTIVE PLATFORM PILLARS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                One Platform.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#06B6D4]">
                  Multiple Ways to Grow.
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B]">
                Explore the interconnected facets of CourseEarn. Hover over any feature to see its capabilities or jump directly into the experience.
              </p>
            </div>

            {/* 6 Feature Cards Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {ECOSYSTEM_CARDS.map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    variants={fadeInUp}
                    custom={idx}
                    onClick={() => {
                      if (card.link) navigate(card.link);
                    }}
                    className="group relative rounded-3xl bg-white p-7 border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-cyan-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Icon & Link Arrow */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-cyan-200 bg-cyan-50 text-[#06B6D4] transition-transform group-hover:scale-110">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#64748B] group-hover:text-white group-hover:bg-[#06B6D4] group-hover:border-[#06B6D4] transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold text-[#06B6D4] uppercase tracking-wider mb-1">
                        {card.tagline}
                      </div>
                      <h3 className="text-xl font-bold text-[#1E293B] mb-3 group-hover:text-[#06B6D4] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                        {card.description}
                      </p>
                    </div>

                    {/* Extended Description on Hover & Action CTA */}
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-[#64748B] leading-normal mb-3 opacity-90 group-hover:text-[#1E293B] transition-colors">
                        {card.extended}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#06B6D4] group-hover:text-[#8B5CF6] transition-colors">
                        <span>{card.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 5: HOW COURSEEARN WORKS (5-STEP JOURNEY)
            Horizontal on desktop, vertical on mobile
        ═════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24 relative border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#06B6D4] text-xs font-semibold mb-4">
                <Compass className="w-3.5 h-3.5" />
                STEP-BY-STEP PROGRESSION
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                How CourseEarn Works
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B]">
                A seamless 5-step journey connecting skill development with verifiable accomplishment.
              </p>
            </div>

            {/* Stepper Selection Chips (Desktop & Mobile Friendly) */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-12">
              {WORKFLOW_STEPS.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    activeWorkflowStep === idx
                      ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-lg shadow-cyan-200 scale-105'
                      : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-slate-200 hover:border-[#06B6D4]'
                  }`}
                >
                  <span className="font-mono text-xs opacity-75">{step.step}</span>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>

            {/* Active Step Highlight Card */}
            <motion.div
              key={activeWorkflowStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-cyan-50 to-purple-50 p-8 sm:p-10 border border-cyan-200 shadow-md mb-16"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#06B6D4] flex items-center justify-center shrink-0 border border-cyan-200 shadow-sm">
                    {React.createElement(WORKFLOW_STEPS[activeWorkflowStep].icon, { className: 'w-7 h-7' })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#06B6D4] uppercase tracking-wider mb-1">
                      <span>Step {WORKFLOW_STEPS[activeWorkflowStep].step}</span>
                      <span>•</span>
                      <span>{WORKFLOW_STEPS[activeWorkflowStep].title}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-2">
                      {WORKFLOW_STEPS[activeWorkflowStep].headline}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed max-w-xl">
                      {WORKFLOW_STEPS[activeWorkflowStep].description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-[#06B6D4] flex flex-col gap-1.5 md:min-w-[220px] shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Key Highlights</span>
                  <span className="font-semibold text-[#1E293B]">
                    {WORKFLOW_STEPS[activeWorkflowStep].detail.split('•')[0]}
                  </span>
                  <span className="text-[#64748B] text-[11px]">
                    {WORKFLOW_STEPS[activeWorkflowStep].detail.split('•')[1] || 'Real-time synchronization'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Desktop Connected Timeline Steps */}
            <div className="relative">
              {/* Horizontal Connecting Rail (Desktop) */}
              <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#06B6D4] -z-0 opacity-30" />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
                {WORKFLOW_STEPS.map((item, idx) => {
                  const StepIcon = item.icon;
                  const isActive = activeWorkflowStep === idx;
                  return (
                    <motion.div
                      key={item.step}
                      variants={fadeInUp}
                      custom={idx}
                      onClick={() => setActiveWorkflowStep(idx)}
                      className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-white border-[#06B6D4] shadow-md -translate-y-1'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                            isActive
                              ? 'bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] text-white'
                              : 'bg-slate-100 text-[#64748B]'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-xs font-bold text-[#64748B]">
                          {item.step}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1E293B] mb-1.5">{item.title}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Platform Clarity Note */}
            <div className="mt-12 p-4 rounded-2xl bg-cyan-50 border border-cyan-200 max-w-2xl mx-auto flex items-center gap-3 text-xs text-[#64748B]">
              <Info className="w-4 h-4 text-[#06B6D4] shrink-0" />
              <span>
                <strong className="text-[#1E293B]">Clear Distinction:</strong> Learning certificates reflect academic completion, while affiliate earnings are governed by actual referral activity under platform policies. Earnings are never guaranteed.
              </span>
            </div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 6: WHY CHOOSE COURSEEARN?
            8 Value Propositions Grid
        ═════════════════════════════════════════════════════════════ */}
        <section id="why-choose" className="py-24 relative border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#06B6D4] text-xs font-semibold mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                THE COURSEEARN ADVANTAGE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                Why Choose CourseEarn?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B]">
                Built to replace outdated lecture hubs with an intuitive, achievement-oriented learning environment.
              </p>
            </div>

            {/* 8 Value Propositions Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {VALUE_PROPOSITIONS.map((prop, idx) => {
                const IconComponent = prop.icon;
                return (
                  <motion.div
                    key={prop.title}
                    variants={fadeInUp}
                    custom={idx}
                    className="rounded-3xl bg-white p-6 border border-slate-200 hover:border-cyan-300 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#06B6D4] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-[#1E293B] mb-2 group-hover:text-[#06B6D4] transition-colors">
                        {prop.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                        {prop.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] group-hover:text-[#06B6D4] transition-colors">
                      <Check className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>Verified Standard</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 7: OUR CORE VALUES
            “The Principles Behind Every Step” (4 Core Values)
        ═════════════════════════════════════════════════════════════ */}
        <section id="values" className="py-24 relative border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#8B5CF6] text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                GUIDING ETHOS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                The Principles Behind Every Step
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B]">
                Our culture is grounded in authenticity, straightforward policies, and mutual respect.
              </p>
            </div>

            {/* 4 Core Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CORE_VALUES.map((val, idx) => {
                const ValIcon = val.icon;
                return (
                  <motion.div
                    key={val.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="rounded-3xl bg-white p-7 border border-slate-200 hover:border-cyan-300 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-cyan-200 bg-cyan-50 text-[#06B6D4] mb-6">
                      <ValIcon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-[#1E293B] mb-1">{val.name}</h3>
                    <div className="text-xs font-semibold text-[#8B5CF6] mb-3">{val.quote}</div>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {val.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 8: INTERACTIVE LEARNING + AFFILIATE SHOWCASE
            Dashboard-inspired illustrative UI composition
        ═════════════════════════════════════════════════════════════ */}
        <section id="showcase" className="py-24 relative border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#06B6D4] text-xs font-semibold mb-4">
                <Activity className="w-3.5 h-3.5" />
                INTERACTIVE PLATFORM PREVIEW
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                Learning & Opportunity in Harmony
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B]">
                Experience how our dual-track architecture enables you to develop skills while managing your affiliate opportunities in one unified workspace.
              </p>
            </div>

            {/* Showcase Tab Switcher */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {[
                { id: 'all', label: 'Unified Ecosystem View' },
                { id: 'learning', label: 'Learning Dashboard' },
                { id: 'affiliate', label: 'Affiliate & Wallet' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setShowcaseTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    showcaseTab === tab.id
                      ? 'bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-lg shadow-cyan-200'
                      : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-slate-200 hover:border-[#06B6D4]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Illustrative Dashboard Card Container */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-md max-w-5xl mx-auto">
              
              {/* Top Banner Notice */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 text-xs text-[#64748B] mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-[#1E293B]">Simulated Interface Preview</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-[#64748B]">Live CourseEarn Experience</span>
                </div>
                <span className="text-[11px] text-[#06B6D4] bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200 font-medium">
                  Illustrative UI • Dynamic Mockup
                </span>
              </div>

              {/* Grid Content Based on Tab */}
              {(showcaseTab === 'all' || showcaseTab === 'learning') && (
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#06B6D4] mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Learning & Certification Track</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Course Card 1 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                        <span>Web Engineering</span>
                        <span className="text-[#06B6D4] font-bold">92% Finished</span>
                      </div>
                      <div className="font-bold text-[#1E293B] text-sm mb-2">Full-Stack MERN Mastery</div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-full w-[92%]" />
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready to claim verified certificate
                      </div>
                    </div>

                    {/* Course Card 2 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                        <span>Artificial Intelligence</span>
                        <span className="text-[#8B5CF6] font-bold">48% Finished</span>
                      </div>
                      <div className="font-bold text-[#1E293B] text-sm mb-2">Generative AI Systems & LLMs</div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#FB7185] rounded-full w-[48%]" />
                      </div>
                      <div className="text-[11px] text-[#64748B]">Next: Fine-Tuning Models</div>
                    </div>

                    {/* Milestone Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-purple-50 border border-cyan-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#06B6D4]">Milestones Earned</span>
                          <Award className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-[#1E293B] mt-1">4 Badges</div>
                        <div className="text-[11px] text-[#64748B] mt-1">JavaScript, React, Node, DevOps</div>
                      </div>
                      <div className="text-[11px] text-[#8B5CF6] mt-2 font-semibold">
                        🏆 Top 5% Study Consistency
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(showcaseTab === 'all' || showcaseTab === 'affiliate') && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Affiliate & Partner Performance Overview</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Affiliate Stat 1 */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-xs text-[#64748B] mb-1">Active Referrals (Sample)</div>
                      <div className="text-2xl font-black text-[#1E293B]">42 Learners</div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                        +8 Enrolled this month
                      </div>
                    </div>

                    {/* Affiliate Stat 2 */}
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                      <div className="text-xs text-[#64748B] mb-1">Commission Tier</div>
                      <div className="text-2xl font-black text-[#1E293B]">Level 2 Partner</div>
                      <div className="text-[11px] text-[#8B5CF6] font-semibold mt-1">
                        Qualified for secondary commissions
                      </div>
                    </div>

                    {/* Affiliate Stat 3 */}
                    <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200">
                      <div className="text-xs text-[#64748B] mb-1">Wallet Status</div>
                      <div className="text-2xl font-black text-emerald-600">Verified & Active</div>
                      <div className="text-[11px] text-[#64748B] mt-1">
                        Transparent direct bank settlement
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Notice Disclaimer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                <span>All sample numbers represent illustrative product UI, not guaranteed outcomes or company statistics.</span>
                <Link to="/courses" className="text-[#06B6D4] hover:text-[#8B5CF6] font-semibold flex items-center gap-1">
                  <span>Browse Actual Courses</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 9: TRUST, TRANSPARENCY, AND PLATFORM PRINCIPLES
        ═════════════════════════════════════════════════════════════ */}
        <section id="trust" className="py-24 relative border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                INTEGRITY & TRANSPARENCY
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                Built on Trust & Clear Rules
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#64748B]">
                We believe enduring education platforms are built on honesty, not aggressive hype. Here is our unwavering commitment to our users.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TRUST_PRINCIPLES.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors group shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B] mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}

              {/* Extra Summary Trust Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-cyan-50 to-purple-50 border border-cyan-200 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 text-[#06B6D4] flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1E293B] mb-2">Dedicated Learner Protection</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    Have any questions regarding our course quality, enrollment policies, or affiliate terms? Our support desk is ready to assist.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <Link to="/contact" className="text-xs font-bold text-[#06B6D4] hover:text-[#8B5CF6] flex items-center gap-1">
                    <span>Contact Support Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 10: FREQUENTLY ASKED QUESTIONS (ACCORDION)
        ═════════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-24 relative border-b border-slate-200 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#06B6D4] text-xs font-semibold mb-4">
                <HelpCircle className="w-3.5 h-3.5" />
                COMMON INQUIRIES
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-base text-[#64748B]">
                Transparent answers to help you understand CourseEarn's learning and affiliate architecture.
              </p>
            </div>

            {/* Accordion List */}
            <div className="space-y-3.5">
              {FAQS.map((faq, idx) => (
                <FaqAccordionItem
                  key={faq.q}
                  faq={faq}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  index={idx}
                />
              ))}
            </div>

            {/* Still have questions banner */}
            <div className="mt-12 text-center p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="text-left">
                <div className="text-sm font-bold text-[#1E293B]">Have a specific question not listed here?</div>
                <div className="text-xs text-[#64748B] mt-0.5">Our support team is always glad to assist you.</div>
              </div>
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold transition-all shrink-0 shadow-sm"
              >
                Talk to Support
              </Link>
            </div>

          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            SECTION 11: FINAL CALL TO ACTION
            “Your Next Chapter Starts Here”
        ═════════════════════════════════════════════════════════════ */}
        <section id="cta" className="py-24 relative overflow-hidden">
          {/* Soft gradient ambient highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-200/40 via-purple-200/40 to-cyan-200/30 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl p-10 sm:p-14 lg:p-16 bg-gradient-to-br from-[#06B6D4] via-[#8B5CF6] to-[#FB7185] shadow-2xl shadow-purple-200 text-center overflow-hidden"
            >
              {/* Decorative Corner Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                START YOUR JOURNEY TODAY
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto mb-5">
                Your Next Chapter{' '}
                <span className="text-white/90">
                  Starts Here.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-white/85 max-w-xl mx-auto mb-10 leading-relaxed">
                Build new skills, celebrate your progress, and explore opportunities that help you move forward. Join thousands of dedicated learners today.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <button
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-bold text-sm sm:text-base shadow-xl shadow-black/10 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/courses')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base border border-white/40 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Courses</span>
                  <Compass className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges under CTA */}
              <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Instant Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Free Registration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Transparent Policies
                </span>
              </div>

            </motion.div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <Footer onOpenAuth={(tab) => navigate(`/${tab}`)} />

      {/* ── Floating Back to Top Button ── */}
      <BackToTop />

    </div>
  );
}
