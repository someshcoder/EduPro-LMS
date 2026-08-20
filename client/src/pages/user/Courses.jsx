import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, BookOpen, Clock, Users } from 'lucide-react';
import { courseService } from '../../services/courseService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await courseService.getPackages();
        setCourses(data.packages || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (isLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Library</h1>
          <p className="text-slate-400 text-sm mt-1">Explore and enroll in our premium courses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => (
          <Card key={course._id} className="overflow-hidden flex flex-col" hover onClick={() => navigate(`/courses/${course._id}`)}>
            <div className="aspect-video bg-slate-800 relative">
              {course.thumbnail ? (
                <img src={`/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center group">
                <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100" />
              </div>
            </div>
            
            <CardBody className="flex flex-col flex-1">
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                {course.shortDescription || course.description}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.totalVideos} videos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolledCount} enrolled</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                <div>
                  {course.discountPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 line-through">₹{course.price}</span>
                      <span className="text-lg font-bold text-emerald-400">₹{course.discountPrice}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-white">₹{course.price}</span>
                  )}
                </div>
                <Button size="sm">View Details</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Courses;
