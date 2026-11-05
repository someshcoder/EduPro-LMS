import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, GraduationCap, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1E293B]">CourseEarn LMS</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 flex items-center justify-center mx-auto mb-5 border border-[#06B6D4]/20">
                <Mail className="w-7 h-7 text-[#06B6D4]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B] mb-2 text-center">Forgot Password?</h2>
              <p className="text-[#64748B] text-sm mb-6 text-center">
                No worries! Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={<Send className="w-4 h-4" />}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">Check your email</h3>
              <p className="text-[#64748B] text-sm">
                We've sent a password reset link to{' '}
                <span className="text-[#1E293B] font-semibold">{email}</span>
              </p>
            </motion.div>
          )}

          <Link to="/login" className="flex items-center gap-2 justify-center mt-6 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
