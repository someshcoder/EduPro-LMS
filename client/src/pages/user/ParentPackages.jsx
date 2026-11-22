import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Clock,
  TrendingUp,
  Receipt,
  PlayCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { parentPackageService } from '../../services/parentPackageService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

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

const TIER_BADGES = {
  starter: 'Starter Foundation',
  intermediate: 'Growth & Traffic',
  advanced: 'Performance Pro',
  ultimate: 'Ultimate Masterclass',
};

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

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

const ParentPackages = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [packages, setPackages] = useState([]);
  const [currentActivePackage, setCurrentActivePackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-packages'
  const [purchasedPackages, setPurchasedPackages] = useState([]);

  // Checkout Modal State
  const [selectedPkgForCheckout, setSelectedPkgForCheckout] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: 'India',
    state: 'Delhi',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pkgsRes, purchasedRes] = await Promise.all([
        parentPackageService.getParentPackages(),
        user ? parentPackageService.getMyPurchasedPackages().catch(() => ({ data: { purchases: [] } })) : { data: { purchases: [] } },
      ]);

      setPackages(pkgsRes.data.packages || []);
      setCurrentActivePackage(pkgsRes.data.currentActivePackage || null);
      setPurchasedPackages(purchasedRes.data.purchasedPackages || purchasedRes.data.purchases || []);
    } catch (err) {
      console.error('Failed to load parent packages:', err);
      toast.error('Failed to load packages. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenCheckout = (pkg) => {
    if (!user) {
      toast('Please login to enroll in a package', { icon: '🔒' });
      navigate('/login');
      return;
    }
    setSelectedPkgForCheckout(pkg);
    setBillingDetails({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: 'India',
      state: 'Delhi',
    });
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPkgForCheckout) return;
    try {
      setIsPurchasing(true);
      const res = await parentPackageService.purchaseParentPackage({
        parentPackageId: selectedPkgForCheckout._id,
        billingDetails,
      });

      toast.success(res.data.message || 'Package unlocked successfully!');
      setSelectedPkgForCheckout(null);
      await fetchData();
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

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-[#0891B2] border border-cyan-200 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Parent Curriculum & Access System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Parent Packages
          </h1>
          <p className="text-[#64748B] text-sm mt-1 max-w-2xl">
            Choose a comprehensive package to unlock multiple professional courses simultaneously with full 1-year access, progress tracking, and upgrade flexibility.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            All Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('my-packages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my-packages'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <span>My Packages</span>
            {purchasedPackages.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#06B6D4] text-white text-[10px] flex items-center justify-center font-bold">
                {purchasedPackages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Package Banner (If user owns any package) */}
      {currentActivePackage && activeTab === 'catalog' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                  Current Active Plan
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1E293B]">
                {currentActivePackage.name}
              </h3>
              <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                1-Year Validity active till{' '}
                {new Date(currentActivePackage.expiresAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveTab('my-packages')}
            >
              View My Purchased Courses
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: CATALOG OF PARENT PACKAGES */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => {
            const Icon = TIER_ICONS[pkg.tier] || BookOpen;
            const gradient = TIER_GRADIENTS[pkg.tier] || 'from-cyan-500 to-blue-600';
            const price = pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
            const originalPrice = pkg.price;
            const hasDiscount = pkg.discountPrice && pkg.discountPrice > 0 && pkg.discountPrice < pkg.price;
            const isUnlocked = pkg.isPurchased;
            const isUpgrade = pkg.upgradeEligible;

            return (
              <div
                key={pkg._id}
                className={`bg-white border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 relative group ${
                  isUnlocked
                    ? 'border-emerald-300 shadow-md ring-1 ring-emerald-200'
                    : isUpgrade
                    ? 'border-cyan-300 hover:shadow-xl hover:border-cyan-400'
                    : 'border-[#E2E8F0] hover:shadow-xl hover:border-indigo-300'
                }`}
              >
                {/* Top Badge Strip */}
                <div className={`h-2 bg-gradient-to-r ${gradient}`} />

                {/* Thumbnail / Header Area */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0]">
                      <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                      {pkg.badge || TIER_BADGES[pkg.tier]}
                    </span>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : isUpgrade ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-[#0891B2] border border-cyan-200 animate-pulse">
                        <Zap className="w-3 h-3" /> Upgrade Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#64748B]">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="h-44 w-full rounded-xl bg-[#F8FAFC] border border-slate-200 overflow-hidden mb-3 relative shadow-2xs">
                    <img
                      src={getThumbnailUrl(pkg.thumbnail, pkg.tier)}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getThumbnailUrl(null, pkg.tier);
                      }}
                    />
                    {pkg.badge && (
                      <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        ★ {pkg.badge}
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[#1E293B] line-clamp-1 group-hover:text-[#06B6D4] transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#06B6D4] font-medium mt-0.5 line-clamp-1">
                    {pkg.tagline || 'Curated Masterclass Series'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                    {pkg.shortDescription || pkg.description}
                  </p>
                </div>

                {/* Course Count & Validity Bar */}
                <div className="px-5 py-2.5 bg-[#F8FAFC] border-y border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-1.5 font-medium text-[#1E293B]">
                    <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span>{pkg.courses?.length || 0} Included Courses</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#64748B]">
                    <Clock className="w-3 h-3 text-[#94A3B8]" />
                    <span>365 Days Access</span>
                  </div>
                </div>

                {/* Included Courses Preview Snippet */}
                <div className="p-5 flex-1 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Included in this Package:
                  </p>
                  <div className="space-y-1.5">
                    {pkg.courses?.slice(0, 4).map((c, idx) => (
                      <div
                        key={c._id || idx}
                        className="flex items-center gap-2 text-xs text-[#1E293B]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{c.title}</span>
                      </div>
                    ))}
                    {pkg.courses?.length > 4 && (
                      <p className="text-[11px] text-[#06B6D4] font-medium pl-5.5">
                        +{pkg.courses.length - 4} more courses included
                      </p>
                    )}
                  </div>

                  {/* Highlights */}
                  {pkg.highlights && pkg.highlights.length > 0 && (
                    <div className="pt-3 border-t border-[#F1F5F9] space-y-1">
                      {pkg.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing & Upgrade Box */}
                <div className="p-5 pt-3 bg-white border-t border-[#E2E8F0] space-y-3">
                  {/* Pricing Display */}
                  {isUnlocked ? (
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 block">
                        Full Access Active
                      </span>
                      <p className="text-[11px] text-[#64748B]">
                        {pkg.daysRemaining !== null
                          ? `${pkg.daysRemaining} days remaining in your subscription`
                          : 'Valid for 1 year'}
                      </p>
                    </div>
                  ) : isUpgrade ? (
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-cyan-900">Upgrade Price:</span>
                        <span className="text-base font-extrabold text-[#0891B2]">
                          ₹{pkg.upgradePrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[10px] text-cyan-700 mt-0.5 flex justify-between">
                        <span>Adjusted previous payment:</span>
                        <span className="font-semibold">-₹{pkg.previouslyPaidAdjusted?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-[#1E293B]">
                        ₹{price?.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-[#94A3B8] line-through font-medium">
                          ₹{originalPrice?.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[11px] text-[#64748B] font-medium">/ 1 Year Access</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/packages/${pkg.slug || pkg._id}`)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] transition-all cursor-pointer text-center"
                    >
                      View Syllabus
                    </button>

                    {isUnlocked ? (
                      <button
                        onClick={() => navigate(`/packages/${pkg.slug || pkg._id}`)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : isUpgrade ? (
                      <button
                        onClick={() => handleOpenCheckout(pkg)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#06B6D4] to-[#0284C7] hover:opacity-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Upgrade</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenCheckout(pkg)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MY PURCHASED PACKAGES */}
      {activeTab === 'my-packages' && (
        <div className="space-y-6">
          {purchasedPackages.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
                <Layers className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B] mb-1">No Parent Packages Purchased Yet</h3>
              <p className="text-[#64748B] text-sm max-w-md mx-auto mb-6">
                Enroll in one of our 4 Parent Packages to instantly unlock bundles of premium courses with 1-year continuous validity and certified completion badges.
              </p>
              <Button onClick={() => setActiveTab('catalog')} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Parent Packages
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchasedPackages.map((purchase) => {
                const pkg = purchase.parentPackage;
                if (!pkg) return null;
                const isExpired = purchase.effectiveStatus === 'expired' || purchase.isExpired;
                const isUpgraded = purchase.status === 'upgraded';

                return (
                  <div
                    key={purchase._id}
                    className="p-5 sm:p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:border-cyan-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#06B6D4] shrink-0 overflow-hidden">
                        {pkg.thumbnail ? (
                          <img
                            src={pkg.thumbnail.startsWith('http') ? pkg.thumbnail : `http://localhost:5000/${pkg.thumbnail}`}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-8 h-8" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-[#1E293B]">
                            {pkg.name}
                          </h3>
                          {isUpgraded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Upgraded to Higher Tier
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active Access
                            </span>
                          )}
                          <span className="text-xs text-[#94A3B8] font-mono">
                            #{purchase.invoiceNumber}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748B]">
                          Purchased on{' '}
                          {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          • Amount Paid: <strong className="text-[#1E293B]">₹{purchase.totalAmount?.toLocaleString('en-IN')}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-2">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
                            {pkg.courses?.length || purchase.grantedCourses?.length || 0} Included Courses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {isExpired
                              ? 'Access expired'
                              : `Expires on ${new Date(purchase.expiresAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })} (${purchase.daysRemaining} days left)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full lg:w-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/packages/${pkg.slug || pkg._id}`)}
                      >
                        View Syllabus & Courses
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate('/courses')}
                        rightIcon={<PlayCircle className="w-4 h-4" />}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT / UPGRADE MODAL */}
      {selectedPkgForCheckout && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-wider">
                  {selectedPkgForCheckout.upgradeEligible ? 'Package Upgrade Confirmation' : 'Package Enrollment'}
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">
                  {selectedPkgForCheckout.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPkgForCheckout(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Price Calculation Summary */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Standard Package Price:</span>
                <span className="font-semibold text-[#1E293B]">
                  ₹{(selectedPkgForCheckout.discountPrice || selectedPkgForCheckout.price)?.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedPkgForCheckout.upgradeEligible && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Previous Package Adjusted ({selectedPkgForCheckout.upgradingFromPackage?.name}):</span>
                  <span>-₹{selectedPkgForCheckout.previouslyPaidAdjusted?.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                <span>Access Validity:</span>
                <span className="font-semibold text-[#1E293B]">365 Days (1 Full Year)</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Courses Granted:</span>
                <span className="font-semibold text-[#06B6D4]">
                  {selectedPkgForCheckout.courses?.length || 0} Individual Courses
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#CBD5E1] text-[#1E293B] font-bold">
                <span className="text-sm">Net Payable Amount:</span>
                <span className="text-xl font-extrabold text-[#06B6D4]">
                  ₹
                  {(selectedPkgForCheckout.upgradeEligible
                    ? selectedPkgForCheckout.upgradePrice
                    : selectedPkgForCheckout.discountPrice || selectedPkgForCheckout.price
                  )?.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-[#94A3B8] text-right">
                *Inclusive of 18% GST (Official tax invoice generated instantly)
              </p>
            </div>

            {/* Billing Details Inputs */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                Billing Details (For GST Receipt)
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="catalog-billing-name" className="text-[#64748B] mb-1 block">Full Name</label>
                  <input
                    id="catalog-billing-name"
                    name="name"
                    type="text"
                    value={billingDetails.name}
                    onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label htmlFor="catalog-billing-phone" className="text-[#64748B] mb-1 block">Phone Number</label>
                  <input
                    id="catalog-billing-phone"
                    name="phone"
                    type="text"
                    value={billingDetails.phone}
                    onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label htmlFor="catalog-billing-state" className="text-[#64748B] mb-1 block">State / Region</label>
                  <input
                    id="catalog-billing-state"
                    name="state"
                    type="text"
                    value={billingDetails.state}
                    onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label htmlFor="catalog-billing-email" className="text-[#64748B] mb-1 block">Email</label>
                  <input
                    id="catalog-billing-email"
                    name="email"
                    type="email"
                    disabled
                    value={billingDetails.email}
                    className="w-full px-3 py-2 bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl text-[#64748B] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedPkgForCheckout(null)}
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
                {selectedPkgForCheckout.upgradeEligible ? 'Pay & Upgrade' : 'Pay & Unlock'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPackages;
