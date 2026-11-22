import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Clock,
  PlayCircle,
  Video,
  Award,
  Users,
} from 'lucide-react';
import { parentPackageService } from '../../services/parentPackageService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const TIER_ICONS = {
  starter: Sparkles,
  intermediate: TrendingUp,
  advanced: Zap,
  ultimate: Crown,
};

const TIER_GRADIENTS = {
  starter: 'from-sky-500 to-cyan-500',
  intermediate: 'from-cyan-500 to-blue-600',
  advanced: 'from-indigo-500 to-purple-600',
  ultimate: 'from-amber-500 via-rose-500 to-purple-600',
};

const TIER_FALLBACK_THUMBNAILS = {
  starter: 'uploads/thumbnails/1795284230564-srclfm-Starter_Package.png',
  intermediate: 'uploads/thumbnails/1795123939135-57s7ne-Intermediate_Package-2.png',
  advanced: 'uploads/thumbnails/1795284264181-1p9erc-Advance_Package-3.png',
  ultimate: 'uploads/thumbnails/1795284319445-gwv04t-Ultimate_Package-4.png',
};

const getThumbnailUrl = (thumb, tier) => {
  const target = thumb || TIER_FALLBACK_THUMBNAILS[tier] || TIER_FALLBACK_THUMBNAILS.starter;
  if (!target) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }
  const clean = target.replace(/^\//, '');
  return `${API_BASE}/${clean}`;
};

const ParentPackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pkg, setPkg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: 'India',
    state: 'Delhi',
  });

  const fetchPackageDetail = async () => {
    try {
      setIsLoading(true);
      const res = await parentPackageService.getParentPackage(id);
      setPkg(res.data.package);
    } catch (err) {
      console.error('Failed to load parent package detail:', err);
      toast.error('Parent package not found');
      navigate('/packages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageDetail();
  }, [id, user]);

  const handleOpenCheckout = () => {
    if (!user) {
      toast('Please login to enroll in a package', { icon: '🔒' });
      navigate('/login');
      return;
    }
    setShowCheckout(true);
    setBillingDetails({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: 'India',
      state: 'Delhi',
    });
  };

  const handleConfirmPurchase = async () => {
    try {
      setIsPurchasing(true);
      const res = await parentPackageService.purchaseParentPackage({
        parentPackageId: pkg._id,
        billingDetails,
      });

      toast.success(res.data.message || 'Package unlocked successfully!');
      setShowCheckout(false);
      await fetchPackageDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!pkg) return null;

  const Icon = TIER_ICONS[pkg.tier] || Layers;
  const price = pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
  const isUnlocked = pkg.isPurchased;
  const isUpgrade = pkg.upgradeEligible;

  return (
    <div className="space-y-8 pb-16">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-3 text-sm text-[#64748B]">
        <button
          onClick={() => navigate('/packages')}
          className="flex items-center gap-1.5 hover:text-[#1E293B] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Packages</span>
        </button>
        <span>/</span>
        <span className="text-[#1E293B] font-semibold">{pkg.name}</span>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Top Tier Gradient Accent Strip */}
        <div className={`h-2.5 bg-gradient-to-r ${TIER_GRADIENTS[pkg.tier] || 'from-cyan-500 to-blue-600'} -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6 sm:mb-8`} />

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Package Thumbnail (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <div className="aspect-video w-full rounded-2xl bg-[#F8FAFC] border border-slate-200/90 overflow-hidden relative shadow-md group">
              <img
                src={getThumbnailUrl(pkg.thumbnail, pkg.tier)}
                alt={pkg.name}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getThumbnailUrl(null, pkg.tier);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />

              {pkg.badge && (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-xs font-bold shadow-md">
                  ★ {pkg.badge}
                </div>
              )}

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-[#1E293B] text-[11px] font-extrabold uppercase tracking-wider shadow-sm border border-slate-200/80">
                {pkg.tier} Tier
              </div>
            </div>
          </div>

          {/* Center Column: Package Info (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                {pkg.badge || 'Parent Master Package'}
              </span>

              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Access Active ({pkg.daysRemaining} days left)
                </span>
              ) : isUpgrade ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-[#0891B2] border border-cyan-200 animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  Upgrade Eligible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#64748B]">
                  <Lock className="w-3.5 h-3.5" />
                  Locked Package
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
              {pkg.name}
            </h1>

            {pkg.tagline && (
              <p className="text-xs sm:text-sm font-bold text-[#8B5CF6] uppercase tracking-wider">
                {pkg.tagline}
              </p>
            )}

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {pkg.description}
            </p>

            {/* Quick Stats Grid */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-[#1E293B]">
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                <BookOpen className="w-4 h-4 text-[#06B6D4]" />
                <span className="font-bold">{pkg.courses?.length || 0}</span>
                <span className="text-[#64748B]">Courses</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                <Clock className="w-4 h-4 text-[#06B6D4]" />
                <span className="font-bold">365 Days</span>
                <span className="text-[#64748B]">Access</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                <Award className="w-4 h-4 text-[#06B6D4]" />
                <span className="font-bold">Verified</span>
                <span className="text-[#64748B]">Certificates</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & CTA Card (3 cols) */}
          <div className="lg:col-span-3 w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-5 space-y-4 shrink-0 shadow-xs">
            {isUnlocked ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You own this package</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    All {pkg.courses?.length || 0} individual courses are unlocked and ready for learning.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate('/courses')}
                  rightIcon={<PlayCircle className="w-4 h-4" />}
                >
                  Go to My Courses
                </Button>
              </div>
            ) : isUpgrade ? (
              <div className="space-y-3">
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800">
                    Smart Package Upgrade
                  </span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#64748B]">Upgrade Price:</span>
                    <span className="text-2xl font-extrabold text-[#0891B2]">
                      ₹{pkg.upgradePrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-700">
                    Adjusted ₹{pkg.previouslyPaidAdjusted?.toLocaleString('en-IN')} from your {pkg.upgradingFromPackage?.name} purchase!
                  </p>
                </div>

                <Button
                  className="w-full shadow-md bg-gradient-to-r from-[#06B6D4] to-[#0284C7]"
                  onClick={handleOpenCheckout}
                  leftIcon={<Zap className="w-4 h-4" />}
                >
                  Upgrade to this Package
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-semibold">
                    Package Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-[#1E293B]">
                      ₹{price?.toLocaleString('en-IN')}
                    </span>
                    {pkg.discountPrice && pkg.discountPrice > 0 && pkg.discountPrice < pkg.price && (
                      <span className="text-sm text-[#94A3B8] line-through font-medium">
                        ₹{pkg.price?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    One-time payment for 1-year unlimited access to all courses.
                  </p>
                </div>

                <Button
                  className="w-full shadow-md"
                  onClick={handleOpenCheckout}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enroll in Package
                </Button>
              </div>
            )}

            <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5 text-xs text-[#64748B]">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant Course Access</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>GST Tax Receipt Included</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Upgrade Credit Protected</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Highlights */}
      {pkg.highlights && pkg.highlights.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Key Competencies & Highlights</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pkg.highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#1E293B] font-medium leading-relaxed">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Included Courses Section (Syllabus) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#06B6D4]" />
              <span>Included Courses ({pkg.courses?.length || 0})</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Every course below is included with your purchase. You will receive 1-year independent access to each course.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pkg.courses?.map((course) => {
            const hasAccess = course.isUnlocked || isUnlocked;

            return (
              <div
                key={course._id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                  hasAccess
                    ? 'border-emerald-200 hover:border-emerald-300 shadow-xs'
                    : 'border-[#E2E8F0] hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start gap-4">
                    {/* Course Thumbnail */}
                    <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] shrink-0 overflow-hidden relative">
                      {course.thumbnail ? (
                        <img
                          src={getThumbnailUrl(course.thumbnail)}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PlayCircle className="w-8 h-8 text-[#94A3B8]" />
                        </div>
                      )}
                    {hasAccess && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-bold">
                        Unlocked
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] uppercase">
                        {course.level || 'All Levels'}
                      </span>
                      {course.category && (
                        <span className="text-[11px] text-[#06B6D4] font-medium truncate">
                          {course.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1E293B] truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2">
                      {course.description || 'Comprehensive modular training.'}
                    </p>
                  </div>
                </div>

                {/* Course Bottom Bar */}
                <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {course.totalVideos || 0} videos
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span>Single course price: ₹{course.price?.toLocaleString('en-IN')}</span>
                  </div>

                  {hasAccess ? (
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Watch</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#06B6D4]">
                      Included in Package
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-wider">
                  {pkg.upgradeEligible ? 'Upgrade Package' : 'Enroll in Package'}
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">
                  {pkg.name}
                </h2>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Standard Package Price:</span>
                <span className="font-semibold text-[#1E293B]">
                  ₹{(pkg.discountPrice || pkg.price)?.toLocaleString('en-IN')}
                </span>
              </div>

              {pkg.upgradeEligible && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Previous Package Adjusted ({pkg.upgradingFromPackage?.name}):</span>
                  <span>-₹{pkg.previouslyPaidAdjusted?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                <span>Validity Duration:</span>
                <span className="font-semibold text-[#1E293B]">1 Full Year (365 Days)</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Courses Granted:</span>
                <span className="font-semibold text-[#06B6D4]">
                  All {pkg.courses?.length || 0} Individual Courses
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#CBD5E1] text-[#1E293B] font-bold">
                <span className="text-sm">Final Payable Amount:</span>
                <span className="text-xl font-extrabold text-[#06B6D4]">
                  ₹
                  {(pkg.upgradeEligible
                    ? pkg.upgradePrice
                    : pkg.discountPrice || pkg.price
                  )?.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] text-right">
                *Inclusive of 18% GST (Official tax receipt generated immediately)
              </p>
            </div>

            {/* Billing Details */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                Billing Details (For GST Invoice)
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="detail-billing-name" className="text-[#64748B] mb-1 block">Full Name</label>
                  <input
                    id="detail-billing-name"
                    name="name"
                    type="text"
                    value={billingDetails.name}
                    onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label htmlFor="detail-billing-phone" className="text-[#64748B] mb-1 block">Phone Number</label>
                  <input
                    id="detail-billing-phone"
                    name="phone"
                    type="text"
                    value={billingDetails.phone}
                    onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label htmlFor="detail-billing-state" className="text-[#64748B] mb-1 block">State / Region</label>
                  <input
                    id="detail-billing-state"
                    name="state"
                    type="text"
                    value={billingDetails.state}
                    onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label htmlFor="detail-billing-email" className="text-[#64748B] mb-1 block">Email</label>
                  <input
                    id="detail-billing-email"
                    name="email"
                    type="email"
                    disabled
                    value={billingDetails.email}
                    className="w-full px-3 py-2 bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl text-[#64748B] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowCheckout(false)}
                disabled={isPurchasing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                isLoading={isPurchasing}
                className="shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {pkg.upgradeEligible ? 'Pay & Complete Upgrade' : 'Pay & Unlock All Courses'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPackageDetail;
