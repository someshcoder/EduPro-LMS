import React, { useEffect, useState } from 'react';
import { 
  Users, Copy, CheckCircle, TrendingUp, DollarSign, Share2, 
  QrCode, Search, Award, BookOpen, UserCheck, Shield, Send, Globe, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { affiliateService } from '../../services/affiliateService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';

const Affiliate = () => {
  const [data, setData] = useState({
    referralCode: '',
    referralLink: '',
    stats: null,
    team1: [],
    team2: [],
    commissions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('level1'); // 'level1' | 'level2' | 'commissions'
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        const [infoRes, teamRes, commRes] = await Promise.all([
          affiliateService.getReferralInfo(),
          affiliateService.getTeam('all'),
          affiliateService.getCommissions({ limit: 50 }),
        ]);

        setData({
          referralCode: infoRes.data.referralCode,
          referralLink: infoRes.data.referralLink,
          stats: infoRes.data.stats,
          team1: teamRes.data.level1 || [],
          team2: teamRes.data.level2 || [],
          commissions: commRes.data.commissions || [],
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
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `🚀 Learn in-demand high-income digital skills with CourseEarn LMS! Enroll today using my referral link: ${data.referralLink}`;

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(data.referralLink)}&text=${encodeURIComponent('Join CourseEarn LMS and start learning!')}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.referralLink)}`,
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredTeam1 = data.team1.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeam2 = data.team2.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">Affiliate Partner Program</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Share your referral link, build your team network, and earn multi-tier affiliate commissions.
        </p>
      </div>

      {/* Top Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Commissions',
            value: `₹${(data.stats?.totalCommissionEarned || 0).toLocaleString('en-IN')}`,
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
          },
          {
            label: 'Total Network',
            value: `${data.stats?.totalTeam || 0} Members`,
            icon: Users,
            color: 'text-[#06B6D4]',
            bg: 'bg-indigo-400/10',
          },
          {
            label: 'Direct Team (L1)',
            value: `${data.stats?.directReferrals || 0} Members`,
            icon: TrendingUp,
            color: 'text-[#8B5CF6]',
            bg: 'bg-violet-50',
          },
          {
            label: 'Indirect Team (L2)',
            value: `${data.stats?.indirectReferrals || 0} Members`,
            icon: Share2,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-[#1E293B]">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Referral Link & Social Sharing Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-cyan-200 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1E293B]">Your Referral Hub</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-[#06B6D4] uppercase">
                Active
              </span>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-xs text-[#64748B] leading-relaxed">
              When anyone registers and purchases a course with your link, you instantly earn Level 1 and Level 2 commissions.
            </p>

            <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] break-all text-xs text-[#06B6D4] font-mono select-all">
              {data.referralLink}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button onClick={handleCopy} leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                {copied ? 'Copied' : 'Copy Link'}
              </Button>
              <Button variant="secondary" onClick={() => setShowQrModal(true)} leftIcon={<QrCode className="w-4 h-4" />}>
                QR Code
              </Button>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0]">
              <p className="text-xs font-semibold text-[#64748B] mb-2.5">1-Click Instant Share:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={shareLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center transition-colors text-xs font-medium"
                >
                  <Share2 className="w-4 h-4 mb-1" /> WhatsApp
                </a>
                <a
                  href={shareLinks.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-400 flex flex-col items-center justify-center transition-colors text-xs font-medium"
                >
                  <Send className="w-4 h-4 mb-1" /> Telegram
                </a>
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-slate-200 flex flex-col items-center justify-center transition-colors text-xs font-medium"
                >
                  <Globe className="w-4 h-4 mb-1" /> X / Twitter
                </a>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 flex flex-col items-center justify-center transition-colors text-xs font-medium"
                >
                  <MessageCircle className="w-4 h-4 mb-1" /> Facebook
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B]">Referral Code:</p>
                <p className="text-xl font-black text-[#1E293B] font-mono tracking-wider">{data.referralCode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#64748B]">Commission Tier:</p>
                <p className="text-xs font-bold text-[#06B6D4]">L1: 30% | L2: 10%</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Team List Directory */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('level1')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === 'level1'
                    ? 'bg-indigo-600 text-[#1E293B] shadow'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Direct Team (L1: {data.team1.length})
              </button>
              <button
                onClick={() => setActiveTab('level2')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === 'level2'
                    ? 'bg-indigo-600 text-[#1E293B] shadow'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Indirect Team (L2: {data.team2.length})
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === 'commissions'
                    ? 'bg-indigo-600 text-[#1E293B] shadow'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                Commission History ({data.commissions.length})
              </button>
            </div>

            {activeTab !== 'commissions' && (
              <div className="relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="affiliate-member-search"
                  name="searchMember"
                  type="text"
                  placeholder="Search member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] w-full sm:w-48"
                />
              </div>
            )}
          </div>

          {/* Tab 1: Level 1 Team */}
          {activeTab === 'level1' && (
            <Card>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member Details</th>
                        <th>Joined Date</th>
                        <th>Courses Enrolled</th>
                        <th>KYC Status</th>
                        <th>Total Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam1.length > 0 ? (
                        filteredTeam1.map((member) => (
                          <tr key={member._id}>
                            <td>
                              <div className="font-semibold text-[#1E293B]">{member.name}</div>
                              <div className="text-xs text-[#64748B]">{member.email}</div>
                              {member.phone && <div className="text-[11px] text-[#94A3B8]">{member.phone}</div>}
                            </td>
                            <td className="text-xs text-[#64748B]">
                              {new Date(member.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-cyan-50 text-[#06B6D4] border border-cyan-200">
                                <BookOpen className="w-3 h-3" /> {member.enrolledPackages?.length || 0} Courses
                              </span>
                            </td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  member.kycStatus === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : member.kycStatus === 'submitted'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {member.kycStatus === 'approved'
                                  ? 'Verified'
                                  : member.kycStatus === 'submitted'
                                  ? 'Under Review'
                                  : 'Pending'}
                              </span>
                            </td>
                            <td className="font-bold text-[#1E293B] text-xs">
                              ₹{(member.totalEarnings || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-[#94A3B8]">
                            {searchQuery ? 'No matching members found.' : 'No direct referrals registered yet.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tab 2: Level 2 Team */}
          {activeTab === 'level2' && (
            <Card>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member Details</th>
                        <th>Invited By (L1)</th>
                        <th>Joined Date</th>
                        <th>KYC Status</th>
                        <th>Total Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeam2.length > 0 ? (
                        filteredTeam2.map((member) => (
                          <tr key={member._id}>
                            <td>
                              <div className="font-semibold text-[#1E293B]">{member.name}</div>
                              <div className="text-xs text-[#64748B]">{member.email}</div>
                            </td>
                            <td>
                              <div className="text-xs font-medium text-[#06B6D4]">
                                {member.referredBy?.name || 'Direct Affiliate'}
                              </div>
                              <div className="text-[11px] text-[#94A3B8]">{member.referredBy?.email}</div>
                            </td>
                            <td className="text-xs text-[#64748B]">
                              {new Date(member.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  member.kycStatus === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {member.kycStatus === 'approved' ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="font-bold text-[#1E293B] text-xs">
                              ₹{(member.totalEarnings || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-[#94A3B8]">
                            {searchQuery ? 'No matching members found.' : 'No indirect (Level 2) referrals yet.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tab 3: Commission History */}
          {activeTab === 'commissions' && (
            <Card>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Source Member</th>
                        <th>Package</th>
                        <th>Tier</th>
                        <th className="text-right">Commission Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.commissions.length > 0 ? (
                        data.commissions.map((comm) => (
                          <tr key={comm._id}>
                            <td className="text-xs text-[#64748B]">
                              {new Date(comm.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td>
                              <div className="font-medium text-[#1E293B] text-xs">{comm.fromUser?.name || 'Customer'}</div>
                              <div className="text-[11px] text-[#64748B]">{comm.fromUser?.email}</div>
                            </td>
                            <td className="text-xs text-[#64748B]">{comm.package?.title || 'Course Package'}</td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  comm.level === 1
                                    ? 'bg-cyan-50 text-[#06B6D4] border border-cyan-200'
                                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                }`}
                              >
                                Level {comm.level || 1}
                              </span>
                            </td>
                            <td className="text-right font-black text-emerald-400 text-sm">
                              +₹{comm.amount?.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-[#94A3B8]">
                            No commissions recorded yet. Start referring to earn!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E293B] mb-1">Your Referral QR Code</h3>
            <p className="text-xs text-[#64748B] mb-6">Scan to enroll directly with your referral link</p>

            <div className="bg-white p-6 rounded-2xl inline-block shadow-inner mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.referralLink)}`}
                alt="Referral QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs font-mono text-[#06B6D4] mb-6 break-all">{data.referralCode}</p>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowQrModal(false)}>
                Close
              </Button>
              <Button className="flex-1" onClick={handleCopy}>
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Affiliate;
