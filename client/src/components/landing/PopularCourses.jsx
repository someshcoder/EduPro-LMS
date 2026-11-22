import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Crown,
  TrendingUp,
  ShieldCheck,
  Check,
  Lock,
  ChevronRight,
  Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { parentPackageService } from '../../services/parentPackageService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const getThumbnailUrl = (thumb) => {
  if (!thumb) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
    return thumb;
  }
  const clean = thumb.replace(/^\//, '');
  return `${API_BASE}/${clean}`;
};

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

const FALLBACK_PARENT_PACKAGES = [
  {
    _id: 'pkg-starter',
    tier: 'starter',
    tierOrder: 1,
    name: 'Starter / Beginner Level – The Digital Foundations',
    tagline: 'The Digital Foundations',
    description: 'The definitive foundation for your digital journey. Master modern website creation, blogging, Google business profiles, WordPress, and freelancing skills to launch your career.',
    badge: 'Foundation',
    price: 2000,
    discountPrice: 2000,
    thumbnail: 'uploads/thumbnails/1795284230564-srclfm-Starter_Package.png',
    courses: [
      { title: 'WordPress Website Creation' },
      { title: 'Website Creation with Wix' },
      { title: 'Blogging' },
      { title: 'Google my Business' },
      { title: 'Freelancing' },
      { title: 'Digital Logo Design' }
    ],
    highlights: [
      'Essential digital skills for beginners',
      'Step-by-step CMS website setup without code',
      'Freelance client acquisition frameworks'
    ],
    isPublished: true,
  },
  {
    _id: 'pkg-intermediate',
    tier: 'intermediate',
    tierOrder: 2,
    name: 'Intermediate / Growth Level – Traffic & Social Media Mastery',
    tagline: 'Traffic & Social Media Mastery',
    description: 'Scale your audience and engagement with proven traffic generation frameworks. Master Instagram growth, YouTube production, Quora organic authority, UI/UX, and Email Marketing.',
    badge: 'Most Popular',
    price: 4000,
    discountPrice: 4000,
    thumbnail: 'uploads/thumbnails/1795123939135-57s7ne-Intermediate_Package-2.png',
    courses: [
      { title: 'YouTube Marketing' },
      { title: 'Instagram Marketing' },
      { title: 'Email Marketing with Mailchimp' },
      { title: 'Quora Marketing' },
      { title: 'Affiliate Marketing' },
      { title: 'App Design & UI/UX' },
      { title: 'All Starter Level Courses Included' }
    ],
    highlights: [
      'Comprehensive social media funnel blueprints',
      'High-converting organic traffic playbooks',
      'Includes everything from Starter Package'
    ],
    isPublished: true,
  },
  {
    _id: 'pkg-advanced',
    tier: 'advanced',
    tierOrder: 3,
    name: 'Advanced / Performance & Paid Ads Pro',
    tagline: 'Performance & Paid Ads Pro',
    description: 'Master data-driven advertising and high-converting performance campaigns. Dominate Google Search, Google Shopping, Display Network, and Facebook Pixel conversion funnels.',
    badge: 'Pro Marketer',
    price: 6000,
    discountPrice: 6000,
    thumbnail: 'uploads/thumbnails/1795284264181-1p9erc-Advance_Package-3.png',
    courses: [
      { title: 'Google Search Ads' },
      { title: 'Google Shopping Ads' },
      { title: 'Google Display Ads' },
      { title: 'Facebook Pixel - Introduction' },
      { title: 'Google AdSense' },
      { title: 'All Intermediate & Starter Courses Included' }
    ],
    highlights: [
      'Precision audience targeting & retargeting matrices',
      'Multi-channel paid media budget optimization',
      'Includes all Starter and Intermediate courses'
    ],
    isPublished: true,
  },
  {
    _id: 'pkg-ultimate',
    tier: 'ultimate',
    tierOrder: 4,
    name: 'Ultimate / Mega Business Masterclass',
    tagline: 'Mega Business Masterclass',
    description: 'The all-inclusive master pass for serious builders and entrepreneurs. Includes every single course, advanced growth hacks, full affiliate ecosystem access, and VIP priority.',
    badge: 'All-In-One Value',
    price: 8000,
    discountPrice: 8000,
    thumbnail: 'uploads/thumbnails/1795284319445-gwv04t-Ultimate_Package-4.png',
    courses: [
      { title: 'Growth Hack Strategies' },
      { title: 'All Paid Ads & Conversion Funnels' },
      { title: 'All Traffic & Social Media Mastery Courses' },
      { title: 'All Foundation & Website Creation Courses' },
      { title: 'Complete 17+ Course Library Access' }
    ],
    highlights: [
      'Full, unrestricted access to all 17+ courses',
      'Priority mentor office hours & review passes',
      'Maximum affiliate commission eligibility (Tier 4)'
    ],
    isPublished: true,
  }
];

const PopularCourses = ({ onPreviewCourse, onEnrollCourse, externalSearchQuery }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch real parent packages from backend public endpoint
  const { data: serverPackages, isLoading, isError } = useQuery({
    queryKey: ['publicParentPackages'],
    queryFn: async () => {
      const res = await parentPackageService.getParentPackages();
      return res.data?.packages || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Combine server packages or use fallback if server packages list is empty/error
  const parentPackagesList = useMemo(() => {
    if (serverPackages && serverPackages.length > 0) {
      return serverPackages.filter(p => p.isPublished !== false);
    }
    if (!isLoading && (isError || (serverPackages && serverPackages.length === 0))) {
      return FALLBACK_PARENT_PACKAGES;
    }
    return serverPackages && serverPackages.length > 0 ? serverPackages : FALLBACK_PARENT_PACKAGES;
  }, [serverPackages, isLoading, isError]);

  // Synchronize with external search from hero if provided
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchFilter(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const filteredPackages = useMemo(() => {
    return parentPackagesList.filter((pkg) => {
      // Tier match
      const matchesTier = selectedTierFilter === 'all' || pkg.tier === selectedTierFilter;

      // Search match
      const query = searchFilter.toLowerCase().trim();
      const matchesSearch = !query ||
        pkg.name?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query) ||
        pkg.tagline?.toLowerCase().includes(query) ||
        pkg.courses?.some(c => (c.title || c.name || '').toLowerCase().includes(query));

      return matchesTier && matchesSearch;
    });
  }, [parentPackagesList, selectedTierFilter, searchFilter]);

  const handleEnrollClick = (pkg) => {
    if (onEnrollCourse) {
      onEnrollCourse({
        id: pkg._id,
        _id: pkg._id,
        title: pkg.name,
        price: pkg.discountPrice || pkg.price,
      });
      return;
    }

    if (!user) {
      toast('Create an account or login to enroll in this package!', { icon: '🚀' });
      navigate('/signup');
      return;
    }

    navigate(`/packages/${pkg.slug || pkg._id}`);
  };

  const handleDetailsClick = (pkg) => {
    if (onPreviewCourse) {
      onPreviewCourse({
        id: pkg._id,
        _id: pkg._id,
        title: pkg.name,
        description: pkg.description,
        price: pkg.discountPrice || pkg.price,
      });
      return;
    }
    navigate(`/packages/${pkg.slug || pkg._id}`);
  };

  const tierTabs = [
    { id: 'all', label: 'All Packages (4)' },
    { id: 'starter', label: 'Starter' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'ultimate', label: 'Ultimate' },
  ];

  return (
    <section id="courses" className="py-20 bg-[#F8FAFC] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-3 border border-cyan-200/80 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Flagship Learning Paths</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1E293B] tracking-tight">
              Learn From Our Courses
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#64748B] max-w-2xl leading-relaxed">
              Instead of buying isolated courses, unlock complete career tracks with structured curricula, hands-on capstone projects, verified certification, and active community mentorship.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1E293B] shadow-2xs self-start md:self-auto shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>4 Comprehensive Tiers Available</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
            {tierTabs.map((tab) => {
              const isActive = selectedTierFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTierFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-sm shadow-[#06B6D4]/25'
                      : 'bg-white text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <label htmlFor="package-search-input" className="sr-only">
              Search packages
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="package-search-input"
              name="packageSearch"
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search package or skills..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] shadow-xs"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 h-[480px] animate-pulse flex flex-col justify-between shadow-xs">
                <div className="aspect-video bg-slate-100 rounded-2xl mb-4" />
                <div className="space-y-3">
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100/70 rounded w-full" />
                  <div className="h-4 bg-slate-100/70 rounded w-2/3" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-7 bg-slate-100 rounded w-28" />
                  <div className="h-10 bg-slate-100 rounded-xl w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2x2 Parent Packages Grid */}
        {!isLoading && filteredPackages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPackages.map((pkg, idx) => {
              const Icon = TIER_ICONS[pkg.tier] || Layers;
              const gradient = TIER_GRADIENTS[pkg.tier] || 'from-cyan-500 to-blue-600';
              const price = pkg.discountPrice && pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
              const originalPrice = pkg.price;
              const hasDiscount = pkg.discountPrice && pkg.discountPrice > 0 && pkg.discountPrice < pkg.price;

              return (
                <motion.div
                  key={pkg._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-md hover:shadow-2xl hover:border-cyan-300 relative group"
                >
                  {/* Top Tier Gradient Strip */}
                  <div className={`h-2.5 bg-gradient-to-r ${gradient}`} />

                  {/* Header & Badges */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-[#F1F5F9] text-[#1E293B] border border-slate-200 uppercase tracking-wider">
                        <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>{pkg.tier} (Tier {pkg.tierOrder || idx + 1})</span>
                      </span>

                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-[#0891B2] border border-cyan-200 shadow-2xs">
                        {pkg.badge || TIER_BADGES[pkg.tier] || 'Flagship Track'}
                      </span>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="aspect-video w-full rounded-2xl bg-[#F8FAFC] border border-slate-200/90 overflow-hidden mb-4 relative shadow-2xs">
                      {pkg.thumbnail ? (
                        <img
                          src={getThumbnailUrl(pkg.thumbnail)}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50/50">
                          <Layers className="w-12 h-12 text-[#06B6D4]/40 mb-2" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CourseEarn Package</span>
                        </div>
                      )}
                      
                      {pkg.badge && (
                        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold shadow-md">
                          ★ {pkg.badge}
                        </div>
                      )}
                    </div>

                    {/* Titles */}
                    <h3 className="text-xl sm:text-2xl font-black text-[#1E293B] group-hover:text-[#06B6D4] transition-colors line-clamp-1">
                      {pkg.name}
                    </h3>
                    <p className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mt-1">
                      {pkg.tagline || 'Curated Masterclass Series'}
                    </p>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-2.5 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Included Courses Count & Access Bar */}
                  <div className="px-6 py-3 bg-[#F8FAFC] border-y border-slate-200 flex items-center justify-between text-xs text-[#64748B]">
                    <div className="flex items-center gap-2 font-bold text-[#1E293B]">
                      <BookOpen className="w-4 h-4 text-[#06B6D4]" />
                      <span>{pkg.courses?.length || 0} Included Individual Courses</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>365 Days Access</span>
                    </div>
                  </div>

                  {/* Included Courses Preview Snippet */}
                  <div className="p-6 flex-1 space-y-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                      Included in this Package:
                    </p>
                    <div className="space-y-2">
                      {pkg.courses?.slice(0, 4).map((c, i) => (
                        <div
                          key={c._id || i}
                          className="flex items-center gap-2.5 text-xs text-[#1E293B] font-medium"
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="truncate">{c.title || c.name || `Course Module ${i + 1}`}</span>
                        </div>
                      ))}
                      {pkg.courses?.length > 4 && (
                        <p className="text-[11px] text-[#06B6D4] font-bold pl-6.5">
                          +{pkg.courses.length - 4} more courses included in this pass
                        </p>
                      )}
                    </div>

                    {/* Highlights */}
                    {pkg.highlights && pkg.highlights.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        {pkg.highlights.slice(0, 2).map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] text-[#64748B]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate font-medium">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing & Actions */}
                  <div className="p-6 pt-4 bg-white border-t border-slate-200 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                          ₹{price?.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-[#94A3B8] line-through font-semibold">
                            ₹{originalPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-xs text-[#64748B] font-medium">/ 1 Year Access</span>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        Instant Activation
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleDetailsClick(pkg)}
                        className="px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#1E293B] bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-all cursor-pointer text-center"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEnrollClick(pkg)}
                        className="px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] hover:opacity-95 shadow-md shadow-cyan-200 transition-all hover:scale-[1.02] cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPackages.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#1E293B] mb-1">No packages found</h4>
            <p className="text-xs text-[#64748B] mb-4">
              We couldn't find any packages matching your search criteria. Try resetting the filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTierFilter('all');
                setSearchFilter('');
              }}
              className="px-4 py-2 bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Trust Row */}
        <div className="mt-14 pt-8 border-t border-slate-200 text-center flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-[#64748B] font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Official Verifiable Certificates</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
            <span>Full 365 Days Access with Continuous Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
            <span>Direct Level 1 & Indirect Level 2 Affiliate Eligibility</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PopularCourses;
