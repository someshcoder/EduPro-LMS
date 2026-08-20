import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { CheckCircle2, Circle, PlayCircle, BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { courseService } from '../../services/courseService';
import useAuthStore from '../../store/authStore';
import Card, { CardBody } from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const playerRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await courseService.getPackage(id);
        setCourse(data.package);
        setProgress(data.progress);
        
        if (data.package.videos?.length > 0) {
          // If progress exists, load last watched or first uncompleted
          const lastVideoId = data.progress?.lastWatchedVideo;
          const targetVideo = data.package.videos.find(v => v._id === lastVideoId) || data.package.videos[0];
          handleVideoSelect(targetVideo);
        }
      } catch (err) {
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  // Animate watermark randomly every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: `${Math.floor(Math.random() * 80) + 10}%`,
        left: `${Math.floor(Math.random() * 70) + 10}%`
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoSelect = async (video) => {
    setActiveVideo(video);
    try {
      const { data } = await courseService.getVideo(id, video._id);
      setVideoData(data);
    } catch (err) {
      toast.error('Could not load video. Ensure you are enrolled.');
    }
  };

  const handleProgress = async ({ playedSeconds }) => {
    if (!activeVideo || playedSeconds < 5) return; // Only update if watched a bit
    
    // Check if near end (95% completion)
    const isCompleted = videoData?.video?.duration ? (playedSeconds / videoData.video.duration) > 0.95 : false;
    
    try {
      // Throttle updates - maybe only every 10 seconds in a real app
      if (Math.floor(playedSeconds) % 10 === 0 || isCompleted) {
        const { data } = await courseService.updateProgress(id, {
          videoId: activeVideo._id,
          watchedSeconds: playedSeconds,
          isCompleted
        });
        setProgress(data.progress);
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  if (isLoading) {
    return <div className="h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-100px)]">
      {/* Video Player Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Button variant="ghost" className="self-start mb-4 text-slate-400" onClick={() => navigate('/courses')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Courses
        </Button>
        
        {videoData ? (
          <Card className="flex-1 flex flex-col overflow-hidden bg-black border-slate-800 rounded-2xl relative group">
            {/* Watermark Overlay */}
            {videoData.watermark?.enabled && (
              <div 
                className="absolute z-10 text-white/30 font-bold text-lg pointer-events-none transition-all duration-[5000ms] ease-linear"
                style={{ top: watermarkPos.top, left: watermarkPos.left }}
              >
                {videoData.watermark.text}
              </div>
            )}
            
            <div className="w-full aspect-video bg-black relative">
              <ReactPlayer
                ref={playerRef}
                url={`/${videoData.video.videoUrl}`}
                width="100%"
                height="100%"
                controls
                playing
                onProgress={handleProgress}
                config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                className="absolute top-0 left-0"
              />
            </div>
            
            <CardBody className="bg-slate-900 flex-1 border-t border-slate-800">
              <h1 className="text-2xl font-bold text-white mb-2">{activeVideo?.title}</h1>
              <p className="text-slate-400">{activeVideo?.description || 'No description available for this video.'}</p>
            </CardBody>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center bg-slate-900 border-slate-800">
            <div className="text-center">
              <PlayCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a video to start watching</p>
            </div>
          </Card>
        )}
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden h-full">
        <Card className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white line-clamp-1">{course?.title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-slate-400">{course?.videos?.length} videos</span>
              <span className="text-xs text-emerald-400">{progress?.progressPercent || 0}% Completed</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress?.progressPercent || 0}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {course?.videos?.map((video, index) => {
              const isActive = activeVideo?._id === video._id;
              const isCompleted = progress?.completedVideos?.includes(video._id);
              
              return (
                <button
                  key={video._id}
                  onClick={() => handleVideoSelect(video)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                    isActive 
                      ? 'bg-indigo-600/20 border border-indigo-500/30' 
                      : 'hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isActive ? (
                      <PlayCircle className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                      {index + 1}. {video.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{Math.floor(video.duration / 60) || 0} mins</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Watch;
