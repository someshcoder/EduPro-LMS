import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Users, Wallet, PlayCircle, Trophy, ArrowRight, TrendingUp, 
  Clock, DollarSign, Award, Copy, CheckCircle2, Share2, Receipt, Sparkles 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { walletService } from '../../services/walletService';
import { courseService } from '../../services/courseService';
import { affiliateService } from '../../services/affiliateService';
import { certificateService } from '../../services/certificateService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import CertificateModal from '../../components/common/CertificateModal';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [data, setData] = useState({
    wallet: null,
    courses: [],
    affiliate: null,
    referralLink: '',
    referralCode: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, coursesRes, affiliateRes] = await Promise.all([
          walletService.getStats(),
          courseService.getMyCourses(),
          affiliateService.getReferralInfo(),
        ]);

        setData({
          wallet: walletRes.data.stats,
          courses: coursesRes.data.courses || [],
          affiliate: affiliateRes.data.stats,
          referralLink: affiliateRes.data.referralLink,
          referralCode: affiliateRes.data.referralCode,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyLink = () => {
    if (data.referralLink) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenCertificate = async (packageId) => {
    try {
      const res = await certificateService.getPackageCertificate(packageId);
      if (res.data?.certificate) {
        setSelectedCert(res.data.certificate);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Certificate not available yet.');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const kycAlert = user?.kycStatus === 'pending' || user?.kycStatus === 'rejected';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your real-time earnings, course completion, and affiliate team growth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/invoices')} leftIcon={<Receipt className="w-4 h-4" />}>
            Invoices & Receipts
          </Button>
          <Button size="sm" onClick={() => navigate('/wallet')} leftIcon={<Wallet className="w-4 h-4" />}>
            Wallet Payouts
          </Button>
        </div>
      </div>

      {/* KYC Alert */}
      {kycAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400 mt-0.5">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-300 font-semibold text-sm">KYC Verification Required</h3>
            <p className="text-slate-300 text-xs mt-0.5 mb-2">
              {user?.kycStatus === 'rejected'
                ? 'Your previous KYC was rejected. Please upload valid documents to enable wallet withdrawals.'
                : 'Complete your simple KYC (Aadhar / PAN) to unlock bank and UPI payouts.'}
            </p>
            <Button size="sm" variant="warning" onClick={() => navigate('/profile')}>
              Verify KYC Documents
            </Button>
          </div>
        </motion.div>
      )}

      {/* Earnings & Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Earnings",
            value: `₹${(data.wallet?.todayEarnings || 0).toLocaleString('en-IN')}`,
            subtext: 'Calculated since 12:00 AM',
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Last 7 Days',
            value: `₹${(data.wallet?.weekEarnings || 0).toLocaleString('en-IN')}`,
            subtext: 'Weekly affiliate commission',
            icon: Clock,
            color: 'text-indigo-400',
            bg: 'bg-indigo-400/10',
            border: 'border-indigo-500/20',
          },
          {
            label: 'Total Lifetime Earnings',
            value: `₹${(data.wallet?.totalEarnings || 0).toLocaleString('en-IN')}`,
            subtext: 'All-time gross commission',
            icon: TrendingUp,
            color: 'text-violet-400',
            bg: 'bg-violet-400/10',
            border: 'border-violet-500/20',
          },
          {
            label: 'Available Balance',
            value: `₹${(data.wallet?.walletBalance || 0).toLocaleString('en-IN')}`,
            subtext: 'Ready for withdrawal',
            icon: Wallet,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-500/20',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card hover className={`border ${stat.border}`}>
              <CardBody className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{stat.subtext}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Referral Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Referral Link</h3>
          </div>
          <p className="text-xs text-slate-300">
            Share and earn up to 40% combined affiliate commissions (Level 1 & Level 2) on every enrollment.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          <div className="px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-700 text-xs font-mono text-indigo-300 select-all truncate max-w-xs">
            {data.referralLink || 'Loading link...'}
          </div>
          <Button size="sm" onClick={handleCopyLink} leftIcon={copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join EduPro LMS and learn high-income digital skills! Enroll here: ${data.referralLink}`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Courses / Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">My Enrolled Courses ({data.courses.length})</h2>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/courses')}>
              View Library
            </Button>
          </div>

          {data.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.courses.map((course) => {
                const percent = course.progress?.progressPercent || 0;
                const isCompleted = course.progress?.isCompleted || percent >= 100;

                return (
                  <Card key={course._id} hover className="flex flex-col justify-between">
                    <div>
                      <div className="aspect-video w-full bg-slate-800 relative overflow-hidden rounded-t-2xl">
                        {course.thumbnail ? (
                          <img
                            src={`http://localhost:5000/${course.thumbnail}`}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayCircle className="w-12 h-12 text-slate-600" />
                          </div>
                        )}
                        <div
                          onClick={() => navigate(`/courses/${course._id}`)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <PlayCircle className="w-12 h-12 text-white" />
                        </div>
                      </div>

                      <CardBody className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-1">{course.title}</h3>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span>Completion Progress</span>
                          <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </CardBody>
                    </div>

                    <div className="px-4 pb-4 pt-0 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        variant={isCompleted ? 'secondary' : 'primary'}
                        onClick={() => navigate(`/courses/${course._id}`)}
                      >
                        {isCompleted ? 'Rewatch' : 'Continue'}
                      </Button>
                      {isCompleted && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleOpenCertificate(course._id)}
                          leftIcon={<Award className="w-3.5 h-3.5" />}
                        >
                          Certificate
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardBody>
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No enrolled courses yet</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                  Explore our premium curriculum, gain digital skills, and unlock affiliate earning opportunities.
                </p>
                <Button onClick={() => navigate('/courses')}>Browse Course Library</Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Affiliate Team & Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Affiliate Summary</h2>
          </div>

          <Card>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400 text-sm">Direct Team (Level 1)</span>
                <span className="font-bold text-white">{data.affiliate?.directReferrals || 0} Members</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400 text-sm">Indirect Team (Level 2)</span>
                <span className="font-bold text-white">{data.affiliate?.indirectReferrals || 0} Members</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-slate-400 text-sm">Total Network</span>
                <span className="font-bold text-indigo-400">{data.affiliate?.totalTeam || 0} Members</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Commissions Earned</span>
                <span className="font-bold text-emerald-400">
                  ₹{(data.affiliate?.totalCommissionEarned || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2">
                <Button className="w-full" onClick={() => navigate('/affiliate')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Full Team List
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};

export default Dashboard;
