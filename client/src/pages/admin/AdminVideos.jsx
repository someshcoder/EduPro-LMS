import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Upload, Trash2, AlertCircle, X, Play, Eye, Clock } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';


const AdminVideos = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', packageId: '', order: 0, watermarkEnabled: true });
  const [videoFile, setVideoFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const queryClient = useQueryClient();

  const { data: packages } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: async () => {
      const res = await adminService.getPackages();
      return res.data.packages;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (fd) => adminService.uploadVideo(fd),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      toast.success('Video uploaded successfully!');
      setShowUpload(false);
      setForm({ title: '', description: '', packageId: '', order: 0, watermarkEnabled: true });
      setVideoFile(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      toast.success('Video deleted');
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete video'),
  });

  const toggleWatermarkMutation = useMutation({
    mutationFn: ({ id, watermarkEnabled }) =>
      adminService.toggleVideoWatermark(id, watermarkEnabled),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(['adminPackages']);
      toast.success(res.data?.message || `Watermark ${variables.watermarkEnabled ? 'enabled' : 'disabled'}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update watermark'),
  });

  const handleToggleWatermark = (video) => {
    const nextState = video.watermarkEnabled === false;
    toggleWatermarkMutation.mutate({
      id: video._id,
      watermarkEnabled: nextState,
    });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!videoFile) { toast.error('Please select a video file'); return; }
    if (!form.packageId) { toast.error('Please select a package'); return; }
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('packageId', form.packageId);
    fd.append('order', Math.max(0, parseInt(form.order, 10) || 0));
    fd.append('watermarkEnabled', form.watermarkEnabled);
    fd.append('video', videoFile);
    uploadMutation.mutate(fd);
  };

  const allVideos = packages?.flatMap((pkg) => 
    (pkg.videos || []).map((v) => ({ ...v, packageTitle: pkg.title, packageId: pkg._id }))
  ) || [];

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Video className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Videos</h1>
            <p className="text-[#64748B] text-sm">Manage course video content</p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          <Upload className="w-4 h-4" /> Upload Video
        </button>
      </div>

      {/* Videos grouped by package */}
      {packages?.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-16 text-center">
          <Video className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
          <p className="text-[#64748B]">Create packages first before uploading videos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {packages?.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]/60 bg-white/40">
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-[#06B6D4]" />
                  <h3 className="text-[#1E293B] font-semibold">{pkg.title}</h3>
                  <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{pkg.totalVideos || 0} videos</span>
                </div>
              </div>
              {(!pkg.videos || pkg.videos.length === 0) ? (
                <div className="py-8 text-center text-[#94A3B8] text-sm">No videos in this package yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Order</th>
                        <th>Watermark</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pkg.videos?.map((video) => (
                        <tr key={video._id || video}>
                          <td>
                            <div>
                              <p className="text-[#1E293B] font-medium text-sm">{video.title || 'Video'}</p>
                              {video.duration > 0 && (
                                <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')} min
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="text-[#64748B] font-medium">{video.order ?? 0}</td>
                          <td>
                            <button
                              type="button"
                              disabled={toggleWatermarkMutation.isPending && toggleWatermarkMutation.variables?.id === video._id}
                              onClick={() => handleToggleWatermark(video)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                video.watermarkEnabled !== false
                                  ? 'bg-cyan-50 text-[#06B6D4] border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 shadow-xs'
                                  : 'bg-slate-100 text-[#64748B] border-slate-200 hover:bg-slate-200 hover:border-slate-300'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={video.watermarkEnabled !== false ? 'Click to disable watermark' : 'Click to enable watermark'}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  video.watermarkEnabled !== false ? 'bg-[#06B6D4]' : 'bg-slate-400'
                                }`}
                              />
                              <span>{video.watermarkEnabled !== false ? 'Enabled' : 'Disabled'}</span>
                            </button>
                          </td>
                          <td className="text-[#64748B] text-xs">
                            {video.createdAt ? new Date(video.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewVideo(video)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-50 text-[#06B6D4] hover:bg-cyan-50 border border-cyan-200 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Preview
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(video)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1E293B]">Upload Video</h3>
              <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Package</label>
                <select
                  required
                  value={form.packageId}
                  onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] transition-colors"
                >
                  <option value="">Select a package</option>
                  {packages?.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>{pkg.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Video Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                  placeholder="Video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors resize-none"
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1.5">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setForm({ ...form, order: '' });
                      } else {
                        const parsed = parseInt(val, 10);
                        setForm({ ...form, order: isNaN(parsed) ? 0 : Math.max(0, parsed) });
                      }
                    }}
                    onBlur={() => {
                      if (form.order === '' || isNaN(form.order) || Number(form.order) < 0) {
                        setForm({ ...form, order: 0 });
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1.5">Watermark</label>
                  <select
                    value={form.watermarkEnabled}
                    onChange={(e) => setForm({ ...form, watermarkEnabled: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] transition-colors"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#06B6D4] transition-colors file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-[#1E293B]"
                />
                {videoFile && <p className="text-xs text-[#06B6D4] mt-1">{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" disabled={uploadMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] text-sm font-medium transition-colors disabled:opacity-60">
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-semibold text-[#1E293B]">{previewVideo.title}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Admin Preview — Users see this with watermark</p>
              </div>
              <button onClick={() => setPreviewVideo(null)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black">
              <video
                src={`http://localhost:5000/${previewVideo.videoUrl}`}
                controls
                className="w-full max-h-[60vh]"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="px-5 py-3 border-t border-[#E2E8F0] flex items-center gap-4 text-xs text-[#64748B]">
              <span>Order: #{previewVideo.order ?? 0}</span>
              <span>Watermark: {previewVideo.watermarkEnabled !== false ? 'Enabled' : 'Disabled'}</span>
              <span>Uploaded: {previewVideo.createdAt ? new Date(previewVideo.createdAt).toLocaleDateString('en-IN') : '—'}</span>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl border border-rose-500/30 p-6 w-full max-w-sm mx-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#1E293B] text-center mb-2">Delete Video?</h3>
            <p className="text-[#64748B] text-sm text-center mb-6">This will permanently delete this video.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors text-sm font-medium">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteConfirm._id)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-[#1E293B] text-sm font-medium transition-colors disabled:opacity-60">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideos;
