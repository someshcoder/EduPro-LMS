import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Pencil, Trash2, X, Package, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', price: '', level1Percent: 30, level2Percent: 10, isPublished: false };

const AdminPackages = () => {
  const [showModal, setShowModal] = useState(false);
  const [editPkg, setEditPkg] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: async () => {
      const res = await adminService.getPackages();
      return res.data.packages;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (formData) => editPkg
      ? adminService.updatePackage(editPkg._id, formData)
      : adminService.createPackage(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      queryClient.invalidateQueries(['adminDashboardStats']);
      toast.success(editPkg ? 'Package updated!' : 'Package created!');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save package'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      toast.success('Package deleted');
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete package'),
  });

  const commissionMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.setCommissionRules(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      toast.success('Commission rules updated!');
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setEditPkg(null);
    setForm(emptyForm);
    setThumbnail(null);
  };

  const openEdit = (pkg) => {
    setEditPkg(pkg);
    setForm({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      level1Percent: pkg.commissionRules?.level1Percent || 30,
      level2Percent: pkg.commissionRules?.level2Percent || 10,
      isPublished: pkg.isPublished || false,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('commissionRules[level1Percent]', form.level1Percent);
    fd.append('commissionRules[level2Percent]', form.level2Percent);
    fd.append('isPublished', form.isPublished);
    if (thumbnail) fd.append('thumbnail', thumbnail);
    saveMutation.mutate(fd);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Packages</h1>
            <p className="text-[#64748B] text-xs sm:text-sm">{data?.length || 0} packages in catalog</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> New Package
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="stat-card h-48 animate-pulse bg-[#F8FAFC]" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-16 text-center">
          <Package className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
          <p className="text-[#64748B]">No packages yet. Create your first package.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((pkg) => (
            <div key={pkg._id} className="stat-card flex flex-col gap-4 relative">
              <div className="absolute top-3 right-3 z-10">
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${pkg.isPublished ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {pkg.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              {pkg.thumbnail && (
                <img
                  src={`http://localhost:5000/${pkg.thumbnail}`}
                  alt={pkg.title}
                  className="w-full h-36 object-cover rounded-xl"
                />
              )}
              {!pkg.thumbnail && (
                <div className="w-full h-36 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-cyan-200 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-[#06B6D4] opacity-40" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-[#1E293B] font-semibold pr-16">{pkg.title}</h3>
                <p className="text-[#64748B] text-sm mt-1 line-clamp-2">{pkg.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-emerald-400 font-bold text-lg">₹{pkg.price?.toLocaleString()}</span>
                  <span className="text-[#94A3B8] text-xs">{pkg.totalVideos || 0} videos</span>
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-[#94A3B8]">L1: <span className="text-[#06B6D4]">{pkg.commissionRules?.level1Percent || 0}%</span></span>
                  <span className="text-xs text-[#94A3B8]">L2: <span className="text-[#8B5CF6]">{pkg.commissionRules?.level2Percent || 0}%</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-[#E2E8F0]/70 border border-[#E2E8F0] text-[#64748B] text-xs font-medium transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(pkg)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1E293B]">{editPkg ? 'Edit Package' : 'Create Package'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Title</label>
                <input
                  id="pkg-title"
                  name="title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                  placeholder="Package title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Description</label>
                <textarea
                  id="pkg-description"
                  name="description"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors resize-none"
                  placeholder="Package description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Price (₹)</label>
                <input
                  id="pkg-price"
                  name="price"
                  required
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#06B6D4] transition-colors"
                  placeholder="4999"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1.5">Level 1 Commission (%)</label>
                  <input
                    id="pkg-level1"
                    name="level1Percent"
                    type="number"
                    value={form.level1Percent}
                    onChange={(e) => setForm({ ...form, level1Percent: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#64748B] mb-1.5">Level 2 Commission (%)</label>
                  <input
                    id="pkg-level2"
                    name="level2Percent"
                    type="number"
                    value={form.level2Percent}
                    onChange={(e) => setForm({ ...form, level2Percent: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#06B6D4] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-1.5">Thumbnail</label>
                <input
                  id="pkg-thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#06B6D4] transition-colors file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-[#1E293B]"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-[#64748B]">
                  Publish Course (make it visible to users)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] text-sm font-medium transition-colors disabled:opacity-60">
                  {saveMutation.isPending ? 'Saving...' : editPkg ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl border border-rose-500/30 p-6 w-full max-w-sm mx-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#1E293B] text-center mb-2">Delete Package?</h3>
            <p className="text-[#64748B] text-sm text-center mb-6">
              This will permanently delete <strong className="text-[#1E293B]">"{deleteConfirm.title}"</strong> and all its videos.
            </p>
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

export default AdminPackages;
