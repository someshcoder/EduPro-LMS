import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    
    setIsLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#06B6D4]/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center group" title="Go to Home">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center overflow-hidden p-1 group-hover:scale-105 transition-transform">
            <img src="/logo.jpg" alt="CourseEarn" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-[#1E293B]">CourseEarn LMS</span>
        </Link>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5 sm:p-8">
          {!success ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-5 border border-[#8B5CF6]/20">
                <Lock className="w-7 h-7 text-[#8B5CF6]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B] mb-2 text-center">Set new password</h2>
              <p className="text-[#64748B] text-sm mb-6 text-center">
                Please enter your new password below.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="reset-password"
                  name="password"
                  autoComplete="new-password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
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
                <Input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">Password Reset Successful</h3>
              <p className="text-[#64748B] text-sm mb-6">
                Your password has been changed successfully. Redirecting to login...
              </p>
              <Link to="/login">
                <Button className="w-full" variant="outline">
                  Go to Login Now
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
