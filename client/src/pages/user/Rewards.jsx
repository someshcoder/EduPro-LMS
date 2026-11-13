import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, BookOpen, MessageCircle, ThumbsUp, Flame, Target,
  Copy, CheckCircle2, Lock, Crown, Gift, Award, ChevronRight,
  Sparkles, TrendingUp, Bell, Download, ArrowRight, ChevronDown, Check,
  Video, Layout, Users, FileText
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import toast from 'react-hot-toast';

// ─── Mock data (replace with real API later) ────────────────────────────────
const MOCK_USER_DATA = {
  package: 'diamond', // 'basic' | 'advanced' | 'diamond'
  points: 2850,
  nextMilestonePoints: 5000,
  nextMilestone: 'gold',
  currentBadge: 'silver',
  loginStreak: 12,
  courseProgress: 68,
  communityAnswers: 24,
  badges: [
    { id: 'bronze', label: 'Bronze', icon: '🥉', points: 500,  color: 'text-amber-600', bg: 'bg-amber-600/15 border-amber-600/30', unlocked: true,  rewardPct: 10, coupon: 'BRONZE-K3M12', couponUsed: true  },
    { id: 'silver', label: 'Silver', icon: '🥈', points: 1500, color: 'text-[#64748B]', bg: 'bg-slate-400/15 border-slate-400/30', unlocked: true,  rewardPct: 20, coupon: 'SILVER-X7K29', couponUsed: false },
    { id: 'gold',   label: 'Gold',   icon: '🥇', points: 5000, color: 'text-amber-400', bg: 'bg-amber-400/15 border-amber-400/30', unlocked: false, rewardPct: 30, coupon: null,           couponUsed: false },
  ],
  activities: [
    { id: 'module',   icon: BookOpen,      label: 'Course Module Completion', desc: 'Complete any lesson or module',                  pts: '+50 pts',       color: 'text-[#06B6D4]', bg: 'bg-cyan-50', status: 'active' },
    { id: 'question', icon: MessageCircle, label: 'Community Questions',      desc: 'Ask a meaningful question in the forum',          pts: '+25 pts',       color: 'text-[#8B5CF6]', bg: 'bg-violet-500/10', status: 'active' },
    { id: 'answer',   icon: ThumbsUp,      label: 'Helpful Answers',          desc: 'Get your answer upvoted by peers',                pts: '+40 pts/upvote',color: 'text-emerald-400',bg: 'bg-emerald-500/10',status: 'active' },
    { id: 'streak',   icon: Flame,         label: 'Daily Login Streak',       desc: 'Maintain consecutive daily logins',               pts: '+10–100 pts',   color: 'text-orange-400', bg: 'bg-orange-500/10', status: 'streak' },
    { id: 'quiz',     icon: Target,        label: 'Quiz Clearance',           desc: 'Score 70%+ on a module quiz',                     pts: '+75 pts',       color: 'text-sky-400',    bg: 'bg-sky-500/10',    status: 'active' },
  ],
  diamondPerks: [
    { icon: FileText,    label: 'Advanced Cheat Sheets',    desc: 'Condensed premium reference sheets for every topic'       },
    { icon: Download,    label: 'Actionable PDF Guides',     desc: 'In-depth practical guides you can download and keep'      },
    { icon: Video,       label: 'Exclusive Video Breakdowns',desc: 'Deep-dive video explanations from industry experts'       },
    { icon: Layout,      label: 'Premium Templates',         desc: 'Ready-to-use professional project templates'             },
    { icon: Users,       label: '1-on-1 Mentorship Sessions',desc: 'Book personal mentorship with top instructors'           },
    { icon: Bell,        label: 'Live Q&A Workshops',        desc: 'Access premium live workshops and open Q&A sessions'     },
    { icon: Zap,         label: 'Early Access',              desc: 'Be first to access new courses, features & resources'    },
  ],
  journey: [
    { step: 'Register',              done: true  },
    { step: 'Choose Package',        done: true  },
    { step: 'Access Courses',        done: true  },
    { step: 'Complete Modules',      done: true  },
    { step: 'Earn Points',           done: true  },
    { step: 'Reach Milestone',       done: true  },
    { step: 'Unlock Badge',          done: true  },
    { step: 'Receive Coupon',        done: false },
    { step: 'Redeem Reward',         done: false },
  ],
};

// ─── Animated number counter ─────────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.ceil((value - start) / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString('en-IN')}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-4 my-2">
    <div className="flex-1 h-px bg-[#E2E8F0]/60" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] px-2">{label}</span>
    <div className="flex-1 h-px bg-[#E2E8F0]/60" />
  </div>
);

const PackageTag = ({ pkg }) => {
  const cfg = {
    basic:    { label: 'Basic',        color: 'bg-slate-600/20 text-[#64748B] border-slate-500/30'   },
    advanced: { label: 'Advanced',     color: 'bg-cyan-50 text-[#06B6D4] border-cyan-200' },
    diamond:  { label: '💎 Diamond',   color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  };
  const c = cfg[pkg] || cfg.basic;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${c.color}`}>
      {c.label}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════
const Rewards = () => {
  const { user } = useAuthStore();
  const d = MOCK_USER_DATA;
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [expandJourney, setExpandJourney] = useState(false);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon ${code} copied!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const progressPct = Math.min(100, Math.round((d.points / d.nextMilestonePoints) * 100));
  const isDiamond = d.package === 'diamond';

  return (
    <div className="space-y-8 pb-12">

      {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] tracking-tight">Rewards</h1>
          <PackageTag pkg={d.package} />
        </div>
        <p className="text-[#64748B] text-sm max-w-2xl">
          Turn your learning progress, community engagement, and achievements into meaningful rewards and exclusive perks.
        </p>
      </motion.div>

      {/* ── OVERVIEW CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Points card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card className="border-cyan-200 bg-gradient-to-br from-indigo-950/60 to-slate-800/60 h-full">
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Current Points</p>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#06B6D4]" />
                </div>
              </div>
              <p className="text-4xl font-black text-[#1E293B]">
                <AnimatedNumber value={d.points} />
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#64748B]">
                  <span>{d.points.toLocaleString()} / {d.nextMilestonePoints.toLocaleString()} pts</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 bg-[#E2E8F0]/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-[#06B6D4]">
                  {(d.nextMilestonePoints - d.points).toLocaleString()} pts to unlock <span className="font-bold capitalize">{d.nextMilestone}</span>
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Badge card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <Card className="border-slate-600/30 h-full">
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Current Badge</p>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-5xl">🥈</span>
                <div>
                  <p className="text-2xl font-black text-[#1E293B]">Silver</p>
                  <p className="text-xs text-[#64748B]">Earned at 1,500 points</p>
                </div>
              </div>
              <div className="flex gap-3 pt-1 flex-wrap">
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-400">🔥 {d.loginStreak}</p>
                  <p className="text-[10px] text-[#94A3B8]">Day Streak</p>
                </div>
                <div className="w-px bg-[#E2E8F0]" />
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">{d.courseProgress}%</p>
                  <p className="text-[10px] text-[#94A3B8]">Progress</p>
                </div>
                <div className="w-px bg-[#E2E8F0]" />
                <div className="text-center">
                  <p className="text-lg font-bold text-[#06B6D4]">{d.communityAnswers}</p>
                  <p className="text-[10px] text-[#94A3B8]">Answers</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Package card */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <Card className={`h-full ${isDiamond ? 'border-violet-500/30 bg-gradient-to-br from-violet-950/40 to-slate-800/60' : 'border-slate-600/30'}`}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Your Package</p>
                <PackageTag pkg={d.package} />
              </div>
              {isDiamond ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">💎</div>
                    <div>
                      <p className="font-black text-[#1E293B] text-lg">Diamond Member</p>
                      <p className="text-xs text-violet-300">All perks unlocked</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    You have full access to mentorship, exclusive content, early access features, and premium rewards.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-black text-[#1E293B] text-lg capitalize">{d.package} Package</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">Earn points through courses, community, and streaks to unlock badges and rewards.</p>
                  <button className="text-xs text-[#06B6D4] font-semibold hover:underline flex items-center gap-1">
                    Upgrade Package <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* ── HOW TO EARN POINTS ────────────────────────────────────────── */}
      <SectionDivider label="How to Earn Points" />

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#06B6D4]" />
          <h2 className="text-lg font-bold text-[#1E293B]">Earn Points Through Learning & Engagement</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.activities.map((act, i) => (
            <motion.div key={act.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Card hover className="h-full group">
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center flex-shrink-0`}>
                      <act.icon className={`w-5 h-5 ${act.color}`} />
                    </div>
                    {act.status === 'streak' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-bold">
                        <Flame className="w-3 h-3" /> {d.loginStreak} Day Streak
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#1E293B] text-sm">{act.label}</p>
                    <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{act.desc}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${act.bg} text-xs font-black ${act.color}`}>
                    <Zap className="w-3 h-3" /> {act.pts}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── MILESTONES & BADGES ───────────────────────────────────────── */}
      <SectionDivider label="Milestones & Badges" />

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-[#1E293B]">Milestones & Badges</h2>
          <span className="text-xs text-[#94A3B8] ml-1">— Auto-unlocked at point thresholds</span>
        </div>

        {/* Progress flow */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-5 flex-wrap">
          {['Points', 'Milestone', 'Badge', 'Reward Coupon', 'Redeem'].map((s, i, arr) => (
            <React.Fragment key={s}>
              <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] font-medium">{s}</span>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-[#64748B] flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {d.badges.map((badge, i) => (
            <motion.div key={badge.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Card className={`border relative overflow-hidden ${badge.unlocked ? badge.bg : 'border-[#E2E8F0]/40 opacity-60'}`}>
                {/* Status tag */}
                <div className="absolute top-3 right-3">
                  {badge.unlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2E8F0]/50 text-[#94A3B8] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <CardBody className="space-y-3">
                  <div className="text-5xl mb-1">{badge.icon}</div>
                  <div>
                    <p className={`font-black text-xl ${badge.unlocked ? badge.color : 'text-[#94A3B8]'}`}>{badge.label}</p>
                    <p className="text-xs text-[#64748B]">Requires {badge.points.toLocaleString()} points</p>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Reward: <span className="text-[#1E293B] font-bold">{badge.rewardPct}% OFF</span> on next course purchase or upgrade
                  </p>

                  {/* Coupon display */}
                  {badge.unlocked && badge.coupon && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#E2E8F0]">
                        <span className="font-mono text-sm font-bold text-[#1E293B] tracking-widest">{badge.coupon}</span>
                        <button
                          onClick={() => handleCopyCoupon(badge.coupon)}
                          className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors"
                        >
                          {copiedCoupon === badge.coupon
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <Copy className="w-4 h-4 text-[#64748B] hover:text-[#1E293B]" />}
                        </button>
                      </div>
                      {badge.couponUsed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E2E8F0]/40 text-[#94A3B8] text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Coupon Used
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          <Gift className="w-3 h-3" /> Valid — Ready to Redeem
                        </span>
                      )}
                    </div>
                  )}

                  {!badge.unlocked && (
                    <p className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                      Earn {(badge.points - d.points).toLocaleString()} more points to unlock
                    </p>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── YOUR REWARDS ──────────────────────────────────────────────── */}
      <SectionDivider label="Your Rewards" />

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-[#1E293B]">Your Rewards</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Active reward cards */}
          {d.badges.filter(b => b.unlocked && b.coupon && !b.couponUsed).map((badge, i) => (
            <motion.div key={badge.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <Card className={`border ${badge.bg} relative overflow-hidden`}>
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 ${badge.id === 'silver' ? 'bg-slate-400' : 'bg-amber-400'}`} />
                <CardBody className="relative space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{badge.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{badge.label} Reward</p>
                        <p className="text-2xl font-black text-[#1E293B]">{badge.rewardPct}% OFF</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex-shrink-0">
                      🎉 Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Congratulations! You unlocked your {badge.label} Badge reward. Use this coupon on your next eligible course purchase or package upgrade.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#E2E8F0]">
                      <span className="font-mono text-base font-black text-[#1E293B] tracking-widest">{badge.coupon}</span>
                      <button
                        onClick={() => handleCopyCoupon(badge.coupon)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] text-xs font-bold transition-all hover:scale-105 flex-shrink-0"
                      >
                        {copiedCoupon === badge.coupon
                          ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied</>
                          : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#94A3B8]">
                    Valid for next eligible course purchase or package upgrade. Cannot be combined with other offers.
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          ))}

          {/* All coupons summary */}
          <Card className="border-[#E2E8F0]/40">
            <CardHeader>
              <h3 className="font-bold text-[#1E293B] text-sm">All Coupons</h3>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-[#E2E8F0]/50">
                {d.badges.map(badge => (
                  <div key={badge.id} className="flex items-center justify-between px-6 py-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{badge.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E293B]">{badge.label} — {badge.rewardPct}% OFF</p>
                        <p className="text-xs text-[#64748B] font-mono truncate">{badge.coupon || 'Not yet generated'}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {!badge.unlocked && (
                        <span className="px-2 py-0.5 rounded-full bg-[#E2E8F0]/50 text-[#94A3B8] text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      {badge.unlocked && badge.couponUsed && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-600/30 text-[#64748B] text-[10px] font-bold">Used</span>
                      )}
                      {badge.unlocked && badge.coupon && !badge.couponUsed && (
                        <button onClick={() => handleCopyCoupon(badge.coupon)} className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors">
                          {copiedCoupon === badge.coupon
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            : <Copy className="w-4 h-4 text-[#64748B] hover:text-[#1E293B]" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </motion.div>

      {/* ── DIAMOND EXCLUSIVE PERKS ───────────────────────────────────── */}
      {isDiamond && (
        <>
          <SectionDivider label="Diamond Exclusive Perks" />
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>

            {/* Diamond hero */}
            <div className="relative rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-slate-900 to-indigo-950/40 overflow-hidden mb-6 p-6">
              <div className="absolute -right-10 -top-10 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex items-center gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/10">
                  💎
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mb-0.5">Exclusive Member Status</p>
                  <h2 className="text-2xl font-extrabold text-[#1E293B]">Diamond Member</h2>
                  <p className="text-sm text-[#64748B] mt-0.5">All premium perks unlocked · Highest tier benefits active</p>
                </div>
                <div className="ml-auto flex gap-1 flex-shrink-0">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-lg font-bold text-[#1E293B]">Diamond Exclusive Perks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {d.diamondPerks.map((perk, i) => (
                <motion.div key={perk.label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                  <Card hover className="h-full group border-violet-500/10 hover:border-violet-500/30">
                    <CardBody className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                        <perk.icon className="w-5 h-5 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1E293B] text-sm">{perk.label}</p>
                        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{perk.desc}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-[#8B5CF6] text-[10px] font-bold border border-violet-200">
                        <Check className="w-3 h-3" /> Included
                      </span>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* ── LEARNING JOURNEY ──────────────────────────────────────────── */}
      <SectionDivider label="Learning Journey" />

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#06B6D4]" />
            <h2 className="text-lg font-bold text-[#1E293B]">Your Learning → Reward Journey</h2>
          </div>
          <button
            onClick={() => setExpandJourney(!expandJourney)}
            className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            {expandJourney ? 'Collapse' : 'Show Steps'}
            <ChevronDown className={`w-4 h-4 transition-transform ${expandJourney ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <Card>
          <CardBody className={expandJourney ? 'space-y-4' : ''}>
            {/* Compact horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 flex-nowrap no-scrollbar scroll-smooth">
              {d.journey.map((step, i) => (
                <React.Fragment key={step.step}>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-indigo-600' : 'bg-[#E2E8F0]'}`}>
                      {step.done ? <Check className="w-3.5 h-3.5 text-[#1E293B]" /> : <span className="text-[10px] text-[#94A3B8] font-bold">{i + 1}</span>}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${step.done ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{step.step}</span>
                  </div>
                  {i < d.journey.length - 1 && <ArrowRight className="w-3 h-3 text-slate-700 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>

            {/* Expanded detail */}
            <AnimatePresence>
              {expandJourney && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
                    {d.journey.map((step, i) => (
                      <div key={step.step} className="flex items-center gap-2 text-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-indigo-600' : 'bg-[#E2E8F0]'}`}>
                          {step.done ? <Check className="w-3 h-3 text-[#1E293B]" /> : <span className="text-[9px] text-[#94A3B8]">{i + 1}</span>}
                        </div>
                        <span className={step.done ? 'text-[#64748B]' : 'text-[#64748B]'}>{step.step}</span>
                        {step.done && <span className="ml-auto text-[10px] text-[#06B6D4] font-semibold">Done</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </motion.div>

      {/* ── HOW REWARDS WORK ──────────────────────────────────────────── */}
      <SectionDivider label="Reward System Info" />

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-cyan-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#06B6D4]" />
                <h3 className="font-bold text-[#1E293B] text-sm">LMS Reward Points</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-xs text-[#64748B] leading-relaxed">
                Points are your <span className="text-[#1E293B] font-semibold">LMS learning currency</span>. Earned through platform activities, converted into badges and discount coupons.
              </p>
              <ul className="space-y-1.5 text-xs text-[#64748B]">
                {['Earned through learning activities', 'Converted to badges at thresholds', 'Badges unlock discount coupons', 'Coupons apply to purchases or upgrades', 'Points are never equal to real money'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card className="border-emerald-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-[#1E293B] text-sm">Automatic Reward Flow</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-xs text-[#64748B] leading-relaxed">
                The reward system is <span className="text-[#1E293B] font-semibold">fully automated</span>. No manual action required to unlock badges or receive coupons.
              </p>
              <div className="space-y-2">
                {[
                  { step: 'Reach point threshold', icon: TrendingUp },
                  { step: 'Badge automatically unlocked', icon: Trophy },
                  { step: 'Unique coupon auto-generated', icon: Gift },
                  { step: 'Coupon added to your profile', icon: Award },
                  { step: 'Coupon sent to your email', icon: Bell },
                ].map(({ step, icon: Icon }, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-[10px] font-black text-emerald-400 flex-shrink-0">{i + 1}</div>
                    <Icon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-[#64748B]">{step}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </motion.div>

    </div>
  );
};

export default Rewards;
