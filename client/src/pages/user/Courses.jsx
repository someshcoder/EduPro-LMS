import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, BookOpen, Users, CheckCircle2, Lock } from 'lucide-react';
import { courseService } from '../../services/courseService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import useAuthStore from '../../store/authStore';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all published courses
        const { data } = await courseService.getPackages({ limit: 100 });
        setCourses(data.packages || []);

        // Track enrolled course IDs from user's enrolledPackages (if available in auth store)
        if (user?.enrolledPackages) {
          setEnrolledIds(user.enrolledPackages.map(p => p?._id || p));
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Course Library</h1>
          <p className="text-[#64748B] text-sm mt-1">Explore and enroll in our premium courses.</p>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            id="courses-search"
            name="search"
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PlayCircle className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-[#64748B]">No courses available</h3>
          <p className="text-[#94A3B8] text-sm mt-1">Check back later for new content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map(course => {
            const isEnrolled = enrolledIds.includes(course._id);
            return (
              <div
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="group cursor-pointer bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
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
                      <PlayCircle className="w-12 h-12 text-[#64748B] group-hover:text-indigo-500 transition-colors" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-14 h-14 text-[#1E293B] opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" />
                  </div>
                  {/* Enrolled Badge */}
                  {isEnrolled && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-lg text-[#1E293B] text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Enrolled
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="text-base font-bold text-[#1E293B] mb-1 line-clamp-2 group-hover:text-[#06B6D4] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-4 flex-1">
                    {course.shortDescription || course.description || 'Premium course content.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#94A3B8] mb-4">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{course.totalVideos || 0} videos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{course.enrolledCount || 0} enrolled</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      {course.discountPrice && course.discountPrice > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-[#94A3B8] line-through">₹{course.price?.toLocaleString('en-IN')}</span>
                          <span className="text-lg font-bold text-emerald-400">₹{course.discountPrice?.toLocaleString('en-IN')}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#1E293B]">₹{course.price?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/courses/${course._id}`); }}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isEnrolled
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-[#1E293B]'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-[#1E293B]'
                      }`}
                    >
                      {isEnrolled ? 'Watch Now' : 'View Details'}
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
