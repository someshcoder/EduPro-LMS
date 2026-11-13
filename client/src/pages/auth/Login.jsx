import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setIsLoading(true);
    try {
      const { data } = await authService.login(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#06B6D4] via-[#8B5CF6] to-[#FB7185]">
        {/* Decorative blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-8 border border-white/50 overflow-hidden p-1.5 hover:scale-105 transition-transform" title="Go to Home">
            <img src="/logo.jpg" alt="CourseEarn" className="w-full h-full object-contain" />
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Welcome to <br />
            <span className="text-white/90">CourseEarn LMS</span>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            Learn, earn, and grow with India's most advanced learning management & affiliate platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Learners', value: '50K+' },
              { label: 'Video Courses', value: '200+' },
              { label: 'Avg Earnings', value: '₹15K/mo' },
              { label: 'Affiliates', value: '10K+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#F8FAFC]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-6 sm:mb-8 group" title="Go to Home">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm overflow-hidden p-0.5 group-hover:scale-105 transition-transform">
              <img src="/logo.jpg" alt="CourseEarn" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-[#1E293B]">CourseEarn LMS</span>
          </Link>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              <span className="text-xs font-semibold text-[#06B6D4] uppercase tracking-wider">Sign In</span>
            </div>

            <h2 className="text-2xl font-bold text-[#1E293B] mb-1">Welcome back!</h2>
            <p className="text-[#64748B] text-sm mb-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#06B6D4] hover:text-[#0891B2] font-semibold transition-colors">
                Create one free
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                label="Email address"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                id="login-password"
                name="password"
                autoComplete="current-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-[#1E293B] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <p className="text-xs text-[#64748B] text-center">
                Demo: <span className="text-[#1E293B] font-medium">admin@courseearn.com / admin123</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
