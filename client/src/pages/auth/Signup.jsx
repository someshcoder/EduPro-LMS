import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, GraduationCap, ArrowRight, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';
import useAuthStore from '../../store/authStore';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    referralCode: searchParams.get('ref') || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.phone && form.phone.length !== 10) return toast.error('Please enter a valid 10-digit phone number');
    setIsLoading(true);
    try {
      const { data } = await authService.signup(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome to CourseEarn, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              CourseEarn LMS
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Learn, earn, and grow with India's most advanced learning management & affiliate platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Learners', value: '50K+' },
              { label: 'Video Courses', value: '200+' },
              { label: 'Avg Earnings', value: '₹15K/mo' },
              { label: 'Affiliates', value: '10K+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CourseEarn LMS</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Get started for free</h2>
          <p className="text-slate-400 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Your Name"
                leftIcon={<User className="w-4 h-4" />}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+91 9876543210"
                leftIcon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: val });
                }}
              />
            </div>
            <Input
              label="Email address *"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Input
              label="Referral Code (Optional)"
              placeholder="CE-XXXXXX"
              leftIcon={<Gift className="w-4 h-4" />}
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
              hint="Enter a referral code to get bonus benefits"
            />

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            By signing up, you agree to our{' '}
            <span className="text-indigo-400 cursor-pointer hover:underline">Terms of Service</span> and{' '}
            <span className="text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
