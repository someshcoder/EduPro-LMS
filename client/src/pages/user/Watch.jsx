import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, PlayCircle, BookOpen, Clock, ArrowLeft, 
  Award, ShieldCheck, ShoppingCart, Sparkles, Receipt, SkipForward, SkipBack, RefreshCw, AlertTriangle
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { invoiceService } from '../../services/invoiceService';
import { certificateService } from '../../services/certificateService';
import useAuthStore from '../../store/authStore';
import Card, { CardBody } from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import CertificateModal from '../../components/common/CertificateModal';
import InvoiceModal from '../../components/common/InvoiceModal';
import toast from 'react-hot-toast';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '15%' });

  const fetchCourse = async () => {
    try {
      const { data } = await courseService.getPackage(id);
      setCourse(data.package);
      setIsEnrolled(data.isEnrolled);
      setProgress(data.progress);

      if (data.isEnrolled && data.package.videos?.length > 0) {
        const lastVideoId = data.progress?.lastWatchedVideo;
        const targetVideo = data.package.videos.find((v) => v._id === lastVideoId) || data.package.videos[0];
        handleVideoSelect(targetVideo);
      }
    } catch (err) {
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // Animate dynamic floating anti-piracy watermark every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: `${Math.floor(Math.random() * 70) + 15}%`,
        left: `${Math.floor(Math.random() * 60) + 15}%`,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoSelect = async (video) => {
    if (!video) return;
    setActiveVideo(video);
    setIsVideoLoading(true);
    setVideoError(false);

    try {
      const { data } = await courseService.getVideo(id, video._id);
      setVideoData(data);
    } catch (err) {
      if (isEnrolled) {
        toast.error('Could not load video player');
        setVideoError(true);
      }
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleTimeUpdate = async () => {
    if (!videoRef.current || !activeVideo) return;
    const playedSeconds = videoRef.current.currentTime;
    const duration = videoRef.current.duration || videoData?.video?.duration || 0;

    if (playedSeconds < 3) return;
    const isCompleted = duration > 0 ? playedSeconds / duration > 0.92 : false;

    // Send update every 10 seconds or when video finishes
    if (Math.floor(playedSeconds) % 10 === 0 || isCompleted) {
      try {
        const { data } = await courseService.updateProgress(id, {
          videoId: activeVideo._id,
          watchedSeconds: playedSeconds,
          isCompleted,
        });
        setProgress(data.progress);
      } catch (err) {
        console.error('Failed to update progress', err);
      }
    }
  };

  const handleVideoEnded = async () => {
    if (!activeVideo) return;
    try {
      const { data } = await courseService.updateProgress(id, {
        videoId: activeVideo._id,
        watchedSeconds: videoRef.current?.duration || 0,
        isCompleted: true,
      });
      setProgress(data.progress);
      toast.success('Lecture completed! 🎉');

      // Auto-advance to next video if available
      const currentIndex = course?.videos?.findIndex((v) => v._id === activeVideo._id);
      if (currentIndex !== -1 && currentIndex < (course?.videos?.length - 1)) {
        const nextVid = course.videos[currentIndex + 1];
        handleVideoSelect(nextVid);
      }
    } catch (err) {
      console.error('Failed to mark video completed', err);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleEnrollNow = async () => {
    setIsPurchasing(true);
    try {
      const res = await invoiceService.purchasePackage({
        packageId: id,
        paymentMethod: 'Online',
        billingDetails: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });

      toast.success('Enrolled successfully! Invoice generated.');
      setNewInvoice(res.data.invoice);
      setIsEnrolled(true);
      fetchCourse();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClaimCertificate = async () => {
    try {
      const res = await certificateService.getPackageCertificate(id);
      if (res.data?.certificate) {
        setCertificate(res.data.certificate);
        setShowCertModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Certificate not ready yet');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const percent = progress?.progressPercent || 0;
  const isCompleted = progress?.isCompleted || percent >= 100;
  const finalPrice = course?.discountPrice && course?.discountPrice > 0 ? course.discountPrice : course?.price;
  
  // Clean forward slash URL
  const videoUrlRaw = videoData?.video?.videoUrl;
  const cleanVideoUrl = videoUrlRaw ? `http://localhost:5000/${videoUrlRaw.replace(/\\/g, '/')}` : null;

  const currentIndex = course?.videos?.findIndex((v) => v._id === activeVideo?._id) ?? -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < (course?.videos?.length - 1);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/courses')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Courses
        </Button>

        {isCompleted && (
          <Button
            variant="warning"
            size="sm"
            onClick={handleClaimCertificate}
            leftIcon={<Award className="w-4 h-4" />}
          >
            Download Verified Certificate
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Certificate Achieved Banner */}
          {isCompleted && (
            <div className="mb-4 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E293B] text-sm">Congratulations! Course Completed (100%)</h3>
                  <p className="text-xs text-[#64748B]">Your verified certificate of completion is ready to download.</p>
                </div>
              </div>
              <Button size="sm" variant="warning" className="w-full sm:w-auto" onClick={handleClaimCertificate}>
                View Certificate
              </Button>
            </div>
          )}

          {/* If Not Enrolled */}
          {!isEnrolled ? (
            <Card className="overflow-hidden border-cyan-200">
              <div className="p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-cyan-200 flex items-center justify-center mx-auto text-[#06B6D4]">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">{course?.title}</h1>
                  <p className="text-[#64748B] text-sm mt-2 leading-relaxed">
                    {course?.description || 'Unlock full lifetime access to all course lectures and verified completion certificate.'}
                  </p>
                </div>

                {/* Pricing Box */}
                <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] inline-block w-full max-w-md">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {course?.discountPrice > 0 && (
                      <span className="text-[#94A3B8] line-through text-lg">₹{course?.price}</span>
                    )}
                    <span className="text-3xl font-black text-emerald-400">₹{finalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-[#64748B]">Inclusive of all applicable GST & Taxes</p>

                  <div className="my-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B] space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{course?.videos?.length || 0} Full HD Video Lectures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Instant Official GST Invoice & Tax Receipt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified Certificate of Excellence on Completion</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2"
                    size="lg"
                    onClick={handleEnrollNow}
                    isLoading={isPurchasing}
                    leftIcon={<ShoppingCart className="w-5 h-5" />}
                  >
                    Enroll Now (Instant Access)
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* Video Player Card */
            <Card className="flex-1 flex flex-col overflow-hidden bg-black border-[#E2E8F0] rounded-2xl">
              <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                {/* Dynamic Watermark */}
                {videoData?.watermark?.enabled && (
                  <div
                    className="absolute z-20 pointer-events-none select-none px-3 py-1 bg-black/30 backdrop-blur-[1px] rounded-lg text-[#1E293B]/30 font-semibold text-xs transition-all duration-[4000ms] ease-in-out border border-white/5"
                    style={{ top: watermarkPos.top, left: watermarkPos.left }}
                  >
                    {videoData.watermark.text || user?.email}
                  </div>
                )}

                {isVideoLoading && (
                  <div className="absolute inset-0 bg-[#F1F5F9] backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Spinner size="lg" />
                    <p className="text-xs text-[#64748B] mt-3">Loading video stream...</p>
                  </div>
                )}

                {videoError ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
                    <p className="text-sm font-semibold text-[#1E293B]">Failed to load video</p>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm">There was an issue streaming this video file.</p>
                    <Button size="sm" className="mt-4" onClick={() => activeVideo && handleVideoSelect(activeVideo)} leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Retry Video
                    </Button>
                  </div>
                ) : cleanVideoUrl ? (
                  <video
                    ref={videoRef}
                    key={cleanVideoUrl}
                    src={cleanVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    controlsList="nodownload"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    onError={(e) => {
                      console.error('Video error:', e);
                      setVideoError(true);
                    }}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support HTML5 video playback.
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] p-8">
                    <PlayCircle className="w-16 h-16 text-slate-700 mb-3" />
                    <p className="text-sm font-medium text-[#64748B]">Select a video from the playlist to begin watching</p>
                  </div>
                )}
              </div>

              {/* Bottom Video Info & Quick Controls */}
              <CardBody className="bg-white border-t border-[#E2E8F0]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-[#1E293B] mb-0.5">
                      {activeVideo?.title || course?.title}
                    </h1>
                    <p className="text-[#64748B] text-xs">
                      {activeVideo?.description || course?.description || 'Lecture details and notes.'}
                    </p>
                  </div>

                  {/* Player Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Speed Selector */}
                    <div className="flex items-center bg-[#F1F5F9]/80 rounded-xl p-1 border border-[#E2E8F0] text-xs text-[#64748B]">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-1 rounded-lg font-medium transition-all ${
                            playbackSpeed === spd
                              ? 'bg-indigo-600 text-[#1E293B] font-bold'
                              : 'hover:text-[#1E293B] hover:bg-[#E2E8F0]/50'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    {/* Prev & Next Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={!hasPrev}
                        onClick={() => hasPrev && handleVideoSelect(course.videos[currentIndex - 1])}
                        className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] disabled:opacity-40 disabled:hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] transition-all border border-[#E2E8F0]"
                        title="Previous Lecture"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        disabled={!hasNext}
                        onClick={() => hasNext && handleVideoSelect(course.videos[currentIndex + 1])}
                        className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] disabled:opacity-40 disabled:hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] transition-all border border-[#E2E8F0]"
                        title="Next Lecture"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Playlist & Progress Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-[#E2E8F0]">
              <h2 className="text-base font-bold text-[#1E293B] line-clamp-1">{course?.title}</h2>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-[#64748B]">{course?.videos?.length || 0} lectures</span>
                <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-[#06B6D4]'}>
                  {percent}% Completed
                </span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[60vh]">
              {course?.videos?.map((video, index) => {
                const isActive = activeVideo?._id === video._id;
                const isVideoCompleted = progress?.completedVideos?.includes(video._id);

                return (
                  <button
                    key={video._id}
                    disabled={!isEnrolled}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                      !isEnrolled
                        ? 'opacity-60 cursor-not-allowed'
                        : isActive
                        ? 'bg-indigo-600/20 border border-cyan-200 shadow-md shadow-indigo-500/5'
                        : 'hover:bg-[#F1F5F9] border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isVideoCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isActive ? (
                        <PlayCircle className="w-5 h-5 text-[#06B6D4] animate-pulse" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#64748B]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium line-clamp-2 ${isActive ? 'text-[#06B6D4] font-bold' : 'text-[#334155]'}`}>
                        {index + 1}. {video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {video.duration > 0 && (
                          <p className="text-[11px] text-[#94A3B8]">{Math.floor((video.duration || 0) / 60)} mins</p>
                        )}
                        {isVideoCompleted && (
                          <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.2 rounded">Done</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && certificate && (
        <CertificateModal certificate={certificate} onClose={() => setShowCertModal(false)} />
      )}

      {/* Instant Invoice Modal after purchase */}
      {newInvoice && (
        <InvoiceModal invoice={newInvoice} onClose={() => setNewInvoice(null)} />
      )}
    </div>
  );
};

export default Watch;
