import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  Menu, 
  X, 
  BookOpen, 
  Sparkles, 
  User, 
  LogIn, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Forum', href: '/forum' },
];

const Navbar = ({ onOpenAuth, onSearchClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link 
              to="/" 
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center overflow-hidden p-0.5 group-hover:scale-105 transition-transform">
                <img src="/logo.jpg" alt="CourseEarn" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-[#1E293B]">
                    Course<span className="text-[#06B6D4]">Earn</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 text-[#06B6D4] border border-cyan-200/70">
                    LMS
                  </span>
                </div>
                <span className="text-[11px] text-[#64748B] font-medium tracking-normal -mt-0.5 hidden sm:block">
                  Next-Gen Learning Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Home, About Us, Contact) */}
            <nav className="hidden lg:flex items-center gap-2 bg-white/85 p-1.5 rounded-full border border-slate-200/90 shadow-sm backdrop-blur-md">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => {
                      if (location.pathname === link.href) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 relative ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100/70'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activePill"
                        className="absolute inset-0 bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-full -z-10 shadow-sm"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Quick Search trigger */}
              <button
                onClick={onSearchClick}
                className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                title="Search courses"
              >
                <Search className="w-4 h-4" />
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1E293B] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#06B6D4]" />
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-95 active:opacity-90 rounded-xl shadow-md shadow-cyan-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={onSearchClick}
                className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 rounded-lg cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 rounded-lg focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[65px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl p-6 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (location.pathname === link.href) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-50 text-[#06B6D4] font-bold border border-cyan-100'
                        : 'text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
                    }}
                    className="w-full py-3 text-center text-sm font-semibold text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2.5 text-center text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-3 text-center text-sm font-semibold text-[#64748B] hover:text-[#1E293B] bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="w-full py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] rounded-xl shadow-md shadow-cyan-500/20"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
