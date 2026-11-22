import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlayCircle,
  BookOpen,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import useAuthStore from '../../store/authStore';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'my' | 'all'

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const [allRes, myRes] = await Promise.all([
          courseService.getPackages({ limit: 100 }),
          user ? courseService.getMyCourses().catch(() => ({ data: { courses: [] } })) : { data: { courses: [] } },
        ]);

        const allPkgs = allRes.data.packages || [];
        const userEnrolled = myRes.data.courses || [];

        setCourses(allPkgs);
        setMyCourses(userEnrolled);

        const ids = userEnrolled.map((c) => c._id);
        setEnrolledIds(ids);

        // If user has enrolled courses, default to 'my' tab for better UX, else 'all'
        if (userEnrolled.length > 0) {
          setActiveTab('my');
        } else {
          setActiveTab('all');
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const displayedList = activeTab === 'my' ? myCourses : courses;
  const filtered = displayedList.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Parent Packages Promotion */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 border border-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                New Parent Package System
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#06B6D4] text-white">
                Save up to 70%
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">
              Looking for bundled curricula? Explore our 4 Parent Packages
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Unlock entire tiers (Starter, Intermediate, Advanced, Ultimate) with full 1-year validity and price upgrade adjustments.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/packages')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shrink-0"
        >
          View Parent Packages
        </Button>
      </div>

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">
            {activeTab === 'my' ? 'My Enrolled Courses' : 'Course Library'}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            {activeTab === 'my'
              ? 'All courses unlocked via Parent Packages or individual enrollment with 1-year access validity.'
              : 'Explore and enroll in our 18 individual premium courses.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'my'
                  ? 'bg-white text-[#1E293B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <span>My Courses</span>
              {myCourses.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#06B6D4] text-white text-[10px]">
                  {myCourses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#1E293B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              All Courses ({courses.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <label htmlFor="courses-search" className="sr-only">
              Search courses
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              id="courses-search"
              name="search"
              type="text"
              placeholder="Search courses..."
              aria-label="Search courses"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E2E8F0] rounded-2xl p-6">
          <PlayCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-[#1E293B]">
            {activeTab === 'my' ? 'No Enrolled Courses Yet' : 'No courses found'}
          </h3>
          <p className="text-[#64748B] text-sm mt-1 max-w-sm">
            {activeTab === 'my'
              ? 'Enroll in a Parent Package or purchase an individual course to get instant 1-year learning access.'
              : 'Try clearing your search query to see available courses.'}
          </p>
          {activeTab === 'my' && (
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={() => setActiveTab('all')}>Browse Courses</Button>
              <Button variant="secondary" onClick={() => navigate('/packages')}>
                View Packages
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((course) => {
            const isEnrolled = enrolledIds.includes(course._id) || activeTab === 'my';
            const progress = course.progress?.progressPercent || 0;
            const access = course.accessInfo;
            const isExpired = access?.isExpired;
            const daysRemaining = access?.daysRemaining;

            return (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="group cursor-pointer bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-[#F1F5F9] relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={`http://localhost:5000/${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-[#64748B] group-hover:text-[#06B6D4] transition-colors" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-14 h-14 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                  </div>

                  {/* Enrolled Badge & Access Status */}
                  {isEnrolled && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-emerald-500/90 backdrop-blur-xs rounded-lg text-white text-xs font-semibold shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isExpired ? 'Expired' : 'Enrolled'}</span>
                    </div>
                  )}

                  {/* Days remaining badge */}
                  {isEnrolled && daysRemaining !== undefined && !isExpired && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs rounded-md text-cyan-300 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-[#06B6D4]" />
                      <span>{daysRemaining}d left</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4">
                  {/* Category & Source */}
                  <div className="flex items-center justify-between text-[11px] text-[#06B6D4] font-medium mb-1">
                    <span className="truncate">{course.category || 'General'}</span>
                    {access?.sourceName && (
                      <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded truncate max-w-[130px]" title={access.sourceName}>
                        {access.sourceName}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#1E293B] mb-1 line-clamp-2 group-hover:text-[#06B6D4] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-3 flex-1">
                    {course.shortDescription || course.description || 'Comprehensive digital course.'}
                  </p>

                  {/* Learning Progress Bar (For My Courses) */}
                  {isEnrolled && (
                    <div className="mb-3 space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#64748B]">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#06B6D4] to-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-[#94A3B8] mb-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{course.totalVideos || 0} videos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>1 Year Access</span>
                    </div>
                  </div>

                  {/* Pricing / Action */}
                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      {course.discountPrice && course.discountPrice > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-[#94A3B8] line-through">
                            ₹{course.price?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-lg font-bold text-emerald-600">
                            ₹{course.discountPrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#1E293B]">
                          ₹{course.price?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${course._id}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isEnrolled
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 shadow-xs'
                          : 'bg-cyan-50 hover:bg-cyan-100 text-[#0891B2] border border-cyan-200 hover:border-cyan-300 shadow-xs'
                      }`}
                    >
                      {isEnrolled ? 'Continue' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
