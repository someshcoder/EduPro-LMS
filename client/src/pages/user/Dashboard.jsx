import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Wallet, PlayCircle, Trophy, ArrowRight, TrendingUp } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { walletService } from '../../services/walletService';
import { courseService } from '../../services/courseService';
import { affiliateService } from '../../services/affiliateService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    wallet: null,
    courses: [],
    affiliate: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, coursesRes, affiliateRes] = await Promise.all([
          walletService.getStats(),
          courseService.getMyCourses(),
          affiliateService.getReferralInfo()
        ]);
        
        setData({
          wallet: walletRes.data.stats,
          courses: coursesRes.data.courses.slice(0, 3), // Top 3 recent
          affiliate: affiliateRes.data.stats
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const kycAlert = user?.kycStatus === 'pending' || user?.kycStatus === 'rejected';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name}! 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here is what's happening with your account today.</p>
        </div>
      </div>

      {kycAlert && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="bg-amber-500/20 p-2 rounded-lg mt-0.5">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-amber-400 font-semibold">KYC Verification Required</h3>
            <p className="text-amber-500/80 text-sm mt-1 mb-3">
              {user?.kycStatus === 'rejected' 
                ? 'Your previous KYC submission was rejected. Please re-submit your documents to continue earning.'
                : 'Please complete your KYC verification to withdraw your earnings.'}
            </p>
            <Button size="sm" variant="warning" onClick={() => navigate('/profile')}>
              Complete KYC Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Wallet Balance', value: `₹${(data.wallet?.walletBalance || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Earnings', value: `₹${(data.wallet?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Total Team', value: data.affiliate?.totalTeam || 0, icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { label: 'Enrolled Courses', value: data.courses?.length || 0, icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card hover>
              <CardBody className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Continue Learning</h2>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/courses')}>
              View All
            </Button>
          </div>
          
          {data.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.courses.map(course => (
                <Card key={course._id} hover onClick={() => navigate(`/courses/${course._id}`)}>
                  <div className="aspect-video w-full bg-slate-800 relative overflow-hidden rounded-t-2xl">
                    {course.thumbnail ? (
                      <img src={`/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardBody>
                    <h3 className="font-semibold text-white mb-3 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{course.progress?.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${course.progress?.progressPercent || 0}%` }}
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardBody>
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No courses yet</h3>
                <p className="text-slate-400 mb-6">Explore our library and start learning today.</p>
                <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Quick Links / Affiliate */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Affiliate Summary</h2>
          <Card>
            <CardBody className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                <span className="text-slate-400 text-sm">Direct Team</span>
                <span className="font-semibold text-white">{data.affiliate?.directReferrals || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                <span className="text-slate-400 text-sm">Indirect Team</span>
                <span className="font-semibold text-white">{data.affiliate?.indirectReferrals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Commissions</span>
                <span className="font-semibold text-emerald-400">₹{(data.affiliate?.totalCommissionEarned || 0).toLocaleString('en-IN')}</span>
              </div>
              
              <Button className="w-full mt-4" onClick={() => navigate('/affiliate')}>
                Go to Affiliate Dashboard
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
