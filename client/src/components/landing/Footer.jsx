import React, { useState } from 'react';
import { 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import toast from 'react-hot-toast';

const SocialIcon = ({ name }) => {
  if (name === 'Twitter') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (name === 'LinkedIn') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (name === 'GitHub') {
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
    </svg>
  );
};

const Footer = ({ onOpenAuth }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('🎉 Thank you for subscribing to EduPro Tech Insights!');
    setEmail('');
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-[#060a12] text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Edu<span className="text-emerald-500">Pro</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  LMS
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering engineers, designers, and managers with world-class interactive curricula, hands-on production codebases, and industry-verified credentials.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { name: 'Twitter', href: 'https://twitter.com', label: 'Twitter' },
                { name: 'LinkedIn', href: 'https://linkedin.com', label: 'LinkedIn' },
                { name: 'GitHub', href: 'https://github.com', label: 'GitHub' },
                { name: 'YouTube', href: 'https://youtube.com', label: 'YouTube' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-400 transition-colors flex items-center justify-center border border-slate-800"
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="hover:text-emerald-400 transition-colors">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Popular Courses
                </a>
              </li>
              <li>
                <a href="#categories" onClick={(e) => scrollToSection(e, 'categories')} className="hover:text-emerald-400 transition-colors">
                  Explore Categories
                </a>
              </li>
              <li>
                <a href="#instructors" onClick={(e) => scrollToSection(e, 'instructors')} className="hover:text-emerald-400 transition-colors">
                  Top Mentors
                </a>
              </li>
              <li>
                <a href="#why-us" onClick={(e) => scrollToSection(e, 'why-us')} className="hover:text-emerald-400 transition-colors">
                  Why Choose EduPro
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="hover:text-emerald-400 transition-colors">
                  Student Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Programs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Featured Paths
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Full Stack MERN & Next.js
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Generative AI & LLM Systems
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Figma UI/UX Design Tokens
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Cloud & Kubernetes DevOps
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Data Science with Python
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => scrollToSection(e, 'courses')} className="hover:text-emerald-400 transition-colors">
                  Growth Marketing & SEO
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Subscription */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Newsletter
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Get weekly tutorials, free cheatsheets, and early access to newly released courses.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Subscribe Now</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <span className="text-[10px] text-slate-500 mt-2 block">
              🔒 No spam. Unsubscribe anytime in 1 click.
            </span>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} EduPro LMS Platform, Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => toast('Privacy Policy: All student data is stored securely and never sold.', { icon: '🛡️' })}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => toast('Terms of Service: Standard educational platform licensing.', { icon: '📜' })}
              className="hover:text-slate-300 transition-colors"
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => toast('Security: TLS 1.3 encryption & ISO 27001 compliant cloud servers.', { icon: '🔒' })}
              className="hover:text-slate-300 transition-colors"
            >
              Security
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
