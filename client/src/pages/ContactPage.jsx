import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  GraduationCap,
  MessageSquare,
  Headphones,
  Globe,
  ArrowLeft,
  Loader2,
  Sparkles,
  Star,
  Zap,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────
const WA_NUMBER = '918533002305'; // +91 8533002305
const WA_DEFAULT_MSG = encodeURIComponent(
  'Hello CourseEarn! 👋 I came from your website and would like to know more about your courses.'
);

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'support@courseearn.io',
    sub: 'We reply within 24 hours',
    gradient: 'from-[#06B6D4] to-[#8B5CF6]',
    bg: 'bg-white',
    border: 'border-slate-200 shadow-xs',
    href: 'mailto:support@courseearn.io',
  },
  {
    icon: Phone,
    label: 'Call / WhatsApp',
    value: '+91 85330 02305',
    sub: 'Mon – Sat, 9 AM – 7 PM IST',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-white',
    border: 'border-slate-200 shadow-xs',
    href: `https://wa.me/${WA_NUMBER}?text=${WA_DEFAULT_MSG}`,
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Sector 62, Noida',
    sub: 'Uttar Pradesh – 201301',
    gradient: 'from-[#FB7185] to-pink-600',
    bg: 'bg-white',
    border: 'border-slate-200 shadow-xs',
    href: 'https://maps.google.com/?q=Sector+62+Noida',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: 'Mon – Sat',
    sub: '9:00 AM – 7:00 PM IST',
    gradient: 'from-[#FDBA74] to-amber-600',
    bg: 'bg-white',
    border: 'border-slate-200 shadow-xs',
    href: null,
  },
];

const DEPARTMENTS = [
  { icon: MessageSquare, label: 'General Enquiry', color: 'indigo' },
  { icon: Headphones, label: 'Technical Support', color: 'violet' },
  { icon: GraduationCap, label: 'Course & Admissions', color: 'emerald' },
  { icon: Globe, label: 'Partnership / B2B', color: 'amber' },
];

const FAQS = [
  { q: 'How can I enroll in a course?', a: 'Simply create a free account, browse our course library, and click Enroll. Our team will guide you through the process.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, Net Banking, Credit / Debit Cards, and Wallets (PhonePe, Paytm, GPay).' },
  { q: 'Is there a refund policy?', a: 'Yes! We offer a 7-day no-questions-asked refund policy. Just drop us a message on WhatsApp or email.' },
  { q: 'How does the affiliate program work?', a: 'Refer friends and earn up to 40% commission (Level 1 + Level 2) on every successful enrollment through your unique referral link.' },
];

// ─── Animation Variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Floating Orb ─────────────────────────────────────────────────
const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`}
    animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ─── WhatsApp Button ──────────────────────────────────────────────
const WhatsAppButton = ({ message }) => {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message || 'Hello CourseEarn!')}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="relative inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/50 active:translate-y-0"
    >
      {/* Ping rings */}
      <span className="absolute -inset-0.5 rounded-2xl bg-emerald-400/30 animate-ping opacity-60 pointer-events-none" />
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      Chat on WhatsApp
    </a>
  );
};

// ─── FAQ Item ──────────────────────────────────────────────────────
const FaqItem = ({ q, a, idx }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      custom={idx}
      className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${open ? 'border-[#06B6D4]/40 bg-cyan-50/20' : 'border-slate-200 bg-white shadow-xs'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#1E293B]">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <p className="px-6 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', department: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.department) e.department = 'Please select a department';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'At least 20 characters required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-[#06B6D4]/20 selection:text-[#06B6D4] overflow-x-hidden">

      {/* ── Sticky Navbar ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center overflow-hidden p-0.5 group-hover:scale-105 transition-transform">
              <img src="/logo.jpg" alt="CourseEarn" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#1E293B]">
              Course<span className="text-[#06B6D4]">Earn</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#1E293B] hover:text-[#06B6D4] bg-white hover:bg-slate-100 border border-slate-200 transition-all hover:-translate-x-0.5 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        {/* Animated background orbs */}
        <FloatingOrb className="w-[600px] h-[600px] bg-[#06B6D4]/10 top-0 left-1/4" delay={0} />
        <FloatingOrb className="w-[400px] h-[400px] bg-[#8B5CF6]/10 bottom-0 right-1/4" delay={3} />
        <FloatingOrb className="w-[300px] h-[300px] bg-[#FB7185]/10 top-1/4 right-0" delay={5} />

        {/* Noise grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04)_0%,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-cyan-50 border border-cyan-100 text-[#06B6D4] text-sm font-semibold shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            We're Here to Help
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-[#1E293B]"
          >
            Let's{' '}
            <span style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 50%, #FB7185 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Connect
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Questions, feedback, or partnership ideas? We'd love to hear from you.
            Reach out via the form, email, or chat directly on WhatsApp!
          </motion.p>

          {/* Hero CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <WhatsAppButton message="Hello CourseEarn! I'd like to know more." />
            <a
              href="mailto:support@courseearn.io"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-[#1E293B] text-sm font-bold transition-all hover:-translate-y-0.5 shadow-xs"
            >
              <Mail className="w-4 h-4 text-[#06B6D4]" />
              Send an Email
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="flex flex-wrap items-center justify-center gap-6 mt-12"
          >
            {[
              { icon: Star, text: '4.9★ Rated Support' },
              { icon: Zap, text: 'Avg Reply < 2 hrs' },
              { icon: Shield, text: '100% Secure & Private' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[#64748B]">
                <Icon className="w-4 h-4 text-[#06B6D4]" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Quick Contact Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_INFO.map((item, i) => {
            const Icon = item.icon;
            const cardContent = (
              <motion.div
                key={item.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`group relative ${item.bg} border ${item.border} hover:border-opacity-60 rounded-2xl p-6 transition-all duration-300 overflow-hidden cursor-pointer`}
              >
                {/* Glow sweep on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-1">{item.label}</p>
                <p className="text-base font-bold text-[#1E293B] leading-snug">{item.value}</p>
                <p className="text-xs text-[#64748B] mt-1">{item.sub}</p>

                {item.href && (
                  <div className="mt-4 text-xs font-semibold text-[#06B6D4] group-hover:text-[#0891B2] transition-colors">
                    {item.href.startsWith('mailto') ? 'Send email →' : item.href.includes('wa.me') ? 'Open WhatsApp →' : 'Open Maps →'}
                  </div>
                )}
              </motion.div>
            );

            return item.href ? (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="block">{cardContent}</a>
            ) : (
              <div key={item.label}>{cardContent}</div>
            );
          })}
        </div>
      </section>

      {/* ── Form + Right Panel ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Contact Form ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0}
            className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-10 backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-12 gap-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Message Sent! 🎉</h2>
                    <p className="text-slate-400 max-w-xs text-sm">
                      Thanks for writing in! Our team will get back to you within 24 hours.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', department: '', message: '' }); }}
                      className="flex-1 px-5 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                      Send Another
                    </button>
                    <WhatsAppButton message="Hello! I just sent a message via your website." />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <Send className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Send Us a Message</h2>
                      <p className="text-xs text-slate-400 mt-0.5">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="c-name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="c-name" name="name" type="text" autoComplete="name"
                          placeholder="Rahul Sharma"
                          value={form.name} onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/40 ${errors.name ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="c-email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="c-email" name="email" type="email" autoComplete="email"
                          placeholder="rahul@example.com"
                          value={form.email} onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/40 ${errors.email ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                        />
                        {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Department selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Department <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {DEPARTMENTS.map(dept => {
                          const Icon = dept.icon;
                          const active = form.department === dept.label;
                          return (
                            <motion.button
                              key={dept.label}
                              type="button"
                              whileTap={{ scale: 0.97 }}
                              onClick={() => { setForm(p => ({ ...p, department: dept.label })); setErrors(p => ({ ...p, department: '' })); }}
                              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${active ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/10' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-800'}`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate text-xs">{dept.label}</span>
                              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                            </motion.button>
                          );
                        })}
                      </div>
                      {errors.department && <p className="mt-1 text-xs text-rose-400">{errors.department}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="c-message" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="c-message" name="message" rows={5}
                        placeholder="Tell us what's on your mind..."
                        value={form.message} onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-indigo-500/40 resize-none ${errors.message ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
                      />
                      <div className="flex items-center justify-between mt-1">
                        {errors.message ? <p className="text-xs text-rose-400">{errors.message}</p> : <span />}
                        <p className={`text-xs ${form.message.length >= 20 ? 'text-emerald-400' : 'text-slate-600'}`}>{form.message.length}/500</p>
                      </div>
                    </div>

                    {/* Submit row */}
                    <div className="pt-1">
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileTap={{ scale: 0.98 }}
                        id="contact-submit-btn"
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                      >
                        {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Sending…</>) : (<><Send className="w-4 h-4" />Send Message</>)}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Right Panel ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* WhatsApp CTA Card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/25 rounded-3xl p-7 overflow-hidden"
            >
              {/* BG glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {/* Live dot */}
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Chat on WhatsApp</h3>
                    <p className="text-xs text-emerald-400 font-semibold">● Online — replies instantly</p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                  Get instant help from our support team. We reply within minutes on WhatsApp, Mon–Sat, 9 AM–7 PM IST.
                </p>

                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${WA_DEFAULT_MSG}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Start WhatsApp Chat
                </a>

                <p className="text-center text-xs text-slate-500 mt-3">
                  +91 85330 02305 · No app install required
                </p>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="relative rounded-3xl overflow-hidden border border-slate-800 flex-1 min-h-[220px]"
            >
              <iframe
                title="CourseEarn Office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.4978!2d77.3655!3d28.6270!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a43173357b%3A0x37ffce30c87cc03f!2sSector%2062%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%" height="100%"
                className="absolute inset-0 w-full h-full grayscale brightness-50"
                style={{ border: 0, minHeight: '220px' }}
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://maps.google.com/?q=Sector+62+Noida"
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-2.5 flex items-center gap-3 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">CourseEarn HQ</p>
                  <p className="text-[10px] text-slate-400">Sector 62, Noida – 201301</p>
                </div>
                <span className="text-xs text-indigo-400 font-semibold group-hover:text-indigo-300 whitespace-nowrap">Open Maps →</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-cyan-50 border border-cyan-100 text-[#06B6D4] text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            Quick Answers
          </div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} idx={i} />)}
        </div>

      </section>

      {/* ── Footer ── */}
      <div className="border-t border-slate-200 py-6 text-center">
        <p className="text-xs text-[#64748B]">
          © {new Date().getFullYear()} CourseEarn LMS · Made with ♥ in India ·{' '}
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors">WhatsApp</a>
          {' · '}
          <a href="mailto:support@courseearn.io" className="text-[#06B6D4] hover:text-[#0891B2] transition-colors">support@courseearn.io</a>
        </p>
      </div>
    </div>
  );
}
