import { useEffect, useState } from 'react';
import { Users, Copy, CheckCircle, TrendingUp, DollarSign, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { affiliateService } from '../../services/affiliateService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const Affiliate = () => {
  const [data, setData] = useState({
    referralCode: '',
    referralLink: '',
    stats: null,
    team1: [],
    team2: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        const [infoRes, teamRes] = await Promise.all([
          affiliateService.getReferralInfo(),
          affiliateService.getTeam('all')
        ]);
        
        setData({
          referralCode: infoRes.data.referralCode,
          referralLink: infoRes.data.referralLink,
          stats: infoRes.data.stats,
          team1: teamRes.data.level1 || [],
          team2: teamRes.data.level2 || []
        });
      } catch (err) {
        toast.error('Failed to load affiliate data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAffiliateData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your referrals and view team performance.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Commissions', value: `₹${(data.stats?.totalCommissionEarned || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Team', value: data.stats?.totalTeam || 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Direct Referrals', value: data.stats?.directReferrals || 0, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { label: 'Indirect Referrals', value: data.stats?.indirectReferrals || 0, icon: Share2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((stat, i) => (
          <Card key={stat.label}>
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Link Box */}
        <Card className="lg:col-span-1 border-indigo-500/30">
          <CardHeader>
            <h2 className="text-lg font-bold text-white">Your Referral Link</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-slate-400">Share this link to invite others and earn commissions when they purchase a course.</p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700/50 break-all text-sm text-indigo-300 font-mono">
              {data.referralLink}
            </div>
            <Button className="w-full" onClick={handleCopy} leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400 mb-2">Referral Code:</p>
              <div className="text-2xl font-black text-white tracking-widest">{data.referralCode}</div>
            </div>
          </CardBody>
        </Card>

        {/* Team Tables */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white">Direct Team (Level 1)</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.team1.length > 0 ? (
                    data.team1.map(member => (
                      <tr key={member._id}>
                        <td className="font-medium">{member.name}</td>
                        <td>{member.email}</td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs ${member.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {member.kycStatus === 'approved' ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="text-center py-6 text-slate-500">No direct referrals yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white">Indirect Team (Level 2)</h2>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Joined At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.team2.length > 0 ? (
                    data.team2.map(member => (
                      <tr key={member._id}>
                        <td className="font-medium">{member.name}</td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs ${member.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {member.kycStatus === 'approved' ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center py-6 text-slate-500">No indirect referrals yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Affiliate;
