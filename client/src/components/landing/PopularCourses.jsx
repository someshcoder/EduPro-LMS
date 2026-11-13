import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Layers,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CourseCard from './CourseCard';
import { courseService } from '../../services/courseService';
import { POPULAR_COURSES } from '../../data/landingData';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const inferCategory = (title = '', desc = '', customCategory) => {
  if (customCategory && customCategory.trim()) {
    return { name: customCategory.trim(), id: customCategory.trim().toLowerCase().replace(/\s+/g, '-') };
  }
  const t = (title + ' ' + (desc || '')).toLowerCase();
  if (t.includes('web') || t.includes('word') || t.includes('wix') || t.includes('blog') || t.includes('lms')) {
    return { name: 'Web & Content', id: 'web-content' };
  }
  if (t.includes('google') || t.includes('ad') || t.includes('pixel') || t.includes('search ads') || t.includes('shopping') || t.includes('adsense')) {
    return { name: 'Ads & Traffic', id: 'ads-traffic' };
  }
  if (t.includes('market') || t.includes('youtube') || t.includes('instagram') || t.includes('quora') || t.includes('affiliate') || t.includes('growth') || t.includes('mailchimp') || t.includes('email')) {
    return { name: 'Social & Marketing', id: 'social-marketing' };
  }
  if (t.includes('design') || t.includes('app') || t.includes('ui') || t.includes('ux')) {
    return { name: 'Design & UI/UX', id: 'design-ui' };
  }
  if (t.includes('freelanc') || t.includes('career') || t.includes('business')) {
    return { name: 'Freelance & Business', id: 'freelance-business' };
  }
  return { name: 'Digital Skills', id: 'digital-skills' };
};

const MENTORS = [
  { name: 'Aarav Sharma', role: 'Digital Growth Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { name: 'Priya Patel', role: 'Full-Stack & Web Mentor', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80' },
  { name: 'Rohan Verma', role: 'Performance Ads Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { name: 'Ananya Deshmukh', role: 'UI/UX & Product Mentor', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
];

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

const transformPackage = (pkg, index) => {
  const cat = inferCategory(pkg.title, pkg.description, pkg.category);
  const mentor = MENTORS[index % MENTORS.length];
  const ratings = [4.88, 4.92, 4.95, 4.85, 4.90];
  const rating = pkg.rating && pkg.rating > 0 ? pkg.rating : ratings[index % ratings.length];
  const reviewsCount = pkg.ratingCount && pkg.ratingCount > 0 ? pkg.ratingCount : (320 + ((index * 83) % 950));
  const studentsCount = pkg.enrolledCount && pkg.enrolledCount > 0 ? pkg.enrolledCount.toLocaleString() : (1450 + ((index * 310) % 8000)).toLocaleString();

  const badges = ['Bestseller', 'Top Rated', 'Hot & Trending', 'Popular', 'Editor\'s Choice'];
  const badge = pkg.isFeatured ? 'Featured' : badges[index % badges.length];

  const levelStr = pkg.level
    ? pkg.level.charAt(0).toUpperCase() + pkg.level.slice(1)
    : 'All Levels';

  return {
    id: pkg._id,
    _id: pkg._id,
    title: pkg.title,
    description: pkg.description,
    image: getThumbnailUrl(pkg.thumbnail),
    category: cat.name,
    categoryId: cat.id,
    badge,
    level: levelStr,
    rating,
    reviewsCount,
    studentsCount,
    duration: pkg.totalDuration > 0 ? `${pkg.totalDuration} Mins` : `${Math.max(1, pkg.totalVideos || 0) * 2} Hours`,
    totalLessons: pkg.totalVideos || 0,
    instructor: mentor,
    price: pkg.price || 4999,
    originalPrice: pkg.discountPrice || (pkg.price ? Math.round(pkg.price * 1.5) : 7499),
    features: [
      'Full lifetime access & regular updates',
      'Verified Certificate of Completion',
      'Actionable step-by-step practical modules',
      'Expert mentorship & community support'
    ],
    curriculum: [
      `Module 1: Foundations & Architecture of ${pkg.title}`,
      `Module 2: Practical Setup & Workflow Execution`,
      `Module 3: Advanced Optimization & Scaling Strategies`
    ]
  };
};

const PopularCourses = ({ onPreviewCourse, onEnrollCourse, externalSearchQuery }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Fetch real packages from backend public endpoint
  const { data: serverPackages, isLoading, isError } = useQuery({
    queryKey: ['publicPackages'],
    queryFn: async () => {
      const res = await courseService.getPublicPackages();
      return res.data?.packages || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Transform server packages or fallback to POPULAR_COURSES if empty or error
  const coursesList = useMemo(() => {
    if (serverPackages && serverPackages.length > 0) {
      return serverPackages.map((pkg, idx) => transformPackage(pkg, idx));
    }
    if (!isLoading && (isError || (serverPackages && serverPackages.length === 0))) {
      return POPULAR_COURSES;
    }
    return [];
  }, [serverPackages, isLoading, isError]);

  // Compute dynamic tabs based on actual available courses
  const categoryTabs = useMemo(() => {
    const map = new Map();
    coursesList.forEach((c) => {
      if (c.categoryId && c.category) {
        map.set(c.categoryId, c.category);
      }
    });

    const tabs = [{ id: 'all', label: 'All Courses' }];
    map.forEach((label, id) => {
      tabs.push({ id, label });
    });
    return tabs;
  }, [coursesList]);

  // Synchronize with external search from hero if provided
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchFilter(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const filteredCourses = useMemo(() => {
    return coursesList.filter((course) => {
      // Category match
      const matchesCategory = selectedTab === 'all' || course.categoryId === selectedTab;

      // Search term match
      const query = searchFilter.toLowerCase().trim();
      const matchesSearch = !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.instructor?.name?.toLowerCase().includes(query);

      // Level match
      const matchesLevel = selectedLevel === 'all' ||
        (selectedLevel === 'Beginner' && (course.level.includes('Beginner') || course.level.includes('All'))) ||
        (selectedLevel === 'Intermediate' && (course.level.includes('Intermediate') || course.level.includes('All'))) ||
        (selectedLevel === 'Advanced' && (course.level.includes('Advanced') || course.level.includes('All')));

      return matchesCategory && matchesSearch && matchesLevel;
    });
  }, [coursesList, selectedTab, searchFilter, selectedLevel]);

  return (
    <section id="courses" className="py-20 bg-[#F8FAFC] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-3 border border-cyan-200/70">
              <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Curated Curricula</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Learn From the Best Courses
            </h2>
            <p className="mt-2 text-base text-[#64748B] max-w-xl">
              Explore our most popular courses and start building skills that matter in modern industry.
            </p>
          </div>

          {/* Quick Level Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-[#64748B] hidden sm:inline">Level:</span>
            <select
              id="course-level-filter"
              name="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#06B6D4] shadow-xs cursor-pointer"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="Beginner">Beginner Friendly</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced Engineering</option>
            </select>
          </div>
        </div>

        {/* Category Tabs & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">

          {/* Category Tabs Pill List */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar scroll-smooth">
            {categoryTabs.map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${isActive
                      ? 'bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] text-white shadow-sm shadow-[#06B6D4]/20'
                      : 'bg-white text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* In-Section Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="course-filter-search"
              name="searchFilter"
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter courses..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] shadow-xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-96 animate-pulse flex flex-col justify-between shadow-xs">
                <div className="h-44 bg-slate-100 rounded-xl mb-4" />
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100/70 rounded w-full" />
                  <div className="h-3 bg-slate-100/70 rounded w-2/3" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-6 bg-slate-100 rounded w-20" />
                  <div className="h-9 bg-slate-100 rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPreview={onPreviewCourse}
                onEnroll={onEnrollCourse}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#1E293B] mb-1">No courses found</h4>
            <p className="text-xs text-[#64748B] mb-4">
              We couldn't find any courses matching your current filters. Try changing your search keywords or category.
            </p>
            <button
              onClick={() => {
                setSelectedTab('all');
                setSearchFilter('');
                setSelectedLevel('all');
              }}
              className="px-4 py-2 bg-linear-to-r from-[#06B6D4] to-[#8B5CF6] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Bottom Explorer Banner */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#64748B] font-medium mb-3">
            Looking for something specific? We add new expert-led courses every month.
          </p>
          <a
            href="#categories"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#06B6D4] hover:text-[#8B5CF6] hover:underline transition-colors"
          >
            <span>Browse all course categories</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default PopularCourses;
