import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Crown,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  UserCheck,
  Filter,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

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

const defaultPackageForm = {
  name: '',
  slug: '',
  tagline: '',
  tier: 'starter',
  tierOrder: 1,
  description: '',
  shortDescription: '',
  price: '',
  discountPrice: '',
  badge: '',
  highlights: '',
  isPublished: true,
  level1Percent: 30,
  level2Percent: 10,
};

const AdminParentPackages = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('packages'); // 'packages' | 'purchases'

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [form, setForm] = useState(defaultPackageForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Course Assignment Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [targetPkgForCourses, setTargetPkgForCourses] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');

  // Refund / Cancel Modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [targetPurchaseForRefund, setTargetPurchaseForRefund] = useState(null);
  const [refundAction, setRefundAction] = useState('refund'); // 'refund' | 'cancel'
  const [adminRemarks, setAdminRemarks] = useState('');

  // User Access Overview Modal
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedUserIdForAccess, setSelectedUserIdForAccess] = useState(null);

  // Delete Confirmation
  const [deleteConfirmPkg, setDeleteConfirmPkg] = useState(null);

  // Purchases Filters
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('all');
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState('all');
  const [purchasePage, setPurchasePage] = useState(1);

  // 1. Fetch Parent Packages
  const { data: parentPackages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ['adminParentPackages'],
    queryFn: async () => {
      const res = await adminService.getParentPackages();
      return res.data.packages || [];
    },
  });

  // 2. Fetch All LMS Individual Courses
  const { data: allCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['adminAllCourses'],
    queryFn: async () => {
      const res = await adminService.getPackages();
      return res.data.packages || [];
    },
  });

  // 3. Fetch Purchases
  const { data: purchasesData, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['adminPurchases', purchaseSearch, purchaseStatusFilter, purchaseTypeFilter, purchasePage],
    queryFn: async () => {
      const res = await adminService.getAllPurchases({
        search: purchaseSearch,
        status: purchaseStatusFilter,
        itemType: purchaseTypeFilter,
        page: purchasePage,
        limit: 15,
      });
      return res.data;
    },
    enabled: activeTab === 'purchases',
  });

  // 4. Fetch User Access Overview
  const { data: userAccessData, isLoading: isLoadingAccess } = useQuery({
    queryKey: ['adminUserAccess', selectedUserIdForAccess],
    queryFn: async () => {
      if (!selectedUserIdForAccess) return null;
      const res = await adminService.getUserAccessOverview(selectedUserIdForAccess);
      return res.data;
    },
    enabled: !!selectedUserIdForAccess,
  });

  // Mutations
  const savePackageMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return id
        ? adminService.updateParentPackage(id, formData)
        : adminService.createParentPackage(formData);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['adminParentPackages']);
      toast.success(res.data?.message || 'Parent Package saved successfully!');
      closeEditModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save parent package');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: (id) => adminService.togglePublishParentPackage(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['adminParentPackages']);
      toast.success(res.data?.message || 'Publish status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update publish status');
    },
  });

  const updateCoursesMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updatePackageCourses(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminParentPackages']);
      toast.success('Course assignment updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update course assignment');
    },
  });

  const syncUltimateMutation = useMutation({
    mutationFn: () => adminService.syncUltimatePackage(),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['adminParentPackages']);
      toast.success(res.data?.message || 'Ultimate Package synchronized successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to sync Ultimate package');
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id) => adminService.deleteParentPackage(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['adminParentPackages']);
      toast.success(res.data?.message || 'Package deleted');
      setDeleteConfirmPkg(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete package');
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.refundOrCancelPurchase(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['adminPurchases']);
      if (selectedUserIdForAccess) {
        queryClient.invalidateQueries(['adminUserAccess', selectedUserIdForAccess]);
      }
      toast.success(res.data?.message || 'Purchase status updated and user access recalculated!');
      setShowRefundModal(false);
      setTargetPurchaseForRefund(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    },
  });

  // Handlers
  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedPkg(null);
    setForm(defaultPackageForm);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setShowEditModal(true);
  };

  const openEditModal = (pkg) => {
    setIsEditing(true);
    setSelectedPkg(pkg);
    setForm({
      name: pkg.name || '',
      slug: pkg.slug || '',
      tagline: pkg.tagline || '',
      tier: pkg.tier || 'starter',
      tierOrder: pkg.tierOrder || 1,
      description: pkg.description || '',
      shortDescription: pkg.shortDescription || '',
      price: pkg.price || '',
      discountPrice: pkg.discountPrice || '',
      badge: pkg.badge || '',
      highlights: pkg.highlights ? pkg.highlights.join('\n') : '',
      isPublished: pkg.isPublished ?? true,
      level1Percent: pkg.commissionRules?.level1Percent ?? 30,
      level2Percent: pkg.commissionRules?.level2Percent ?? 10,
    });
    setThumbnailFile(null);
    setThumbnailPreview(pkg.thumbnail ? (pkg.thumbnail.startsWith('http') ? pkg.thumbnail : `http://localhost:5000/${pkg.thumbnail}`) : '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPkg(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handlePackageFormSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('slug', form.slug);
    fd.append('tagline', form.tagline);
    fd.append('tier', form.tier);
    fd.append('tierOrder', form.tierOrder);
    fd.append('description', form.description);
    fd.append('shortDescription', form.shortDescription);
    fd.append('price', form.price);
    if (form.discountPrice) fd.append('discountPrice', form.discountPrice);
    fd.append('badge', form.badge);
    fd.append('isPublished', form.isPublished);
    fd.append('level1Percent', form.level1Percent);
    fd.append('level2Percent', form.level2Percent);

    const highlightsArray = form.highlights
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);
    fd.append('highlights', JSON.stringify(highlightsArray));

    if (thumbnailFile) {
      fd.append('thumbnail', thumbnailFile);
    }

    savePackageMutation.mutate({
      id: isEditing ? selectedPkg._id : null,
      formData: fd,
    });
  };

  const openCourseManager = (pkg) => {
    setTargetPkgForCourses(pkg);
    setCourseSearch('');
    setShowCourseModal(true);
  };

  const toggleCourseInPackage = (courseId) => {
    if (!targetPkgForCourses) return;
    const isCurrentlyAssigned = targetPkgForCourses.courses?.some(
      (c) => (c._id || c).toString() === courseId.toString()
    );

    const action = isCurrentlyAssigned ? 'remove' : 'add';
    updateCoursesMutation.mutate(
      {
        id: targetPkgForCourses._id,
        data: { action, courseId },
      },
      {
        onSuccess: (res) => {
          setTargetPkgForCourses(res.data.package);
        },
      }
    );
  };

  const handleOpenRefund = (purchase) => {
    setTargetPurchaseForRefund(purchase);
    setRefundAction('refund');
    setAdminRemarks('');
    setShowRefundModal(true);
  };

  const handleConfirmRefund = () => {
    if (!targetPurchaseForRefund) return;
    refundMutation.mutate({
      id: targetPurchaseForRefund._id,
      data: {
        action: refundAction,
        adminRemarks,
      },
    });
  };

  const openUserAccessInspector = (userId) => {
    setSelectedUserIdForAccess(userId);
    setShowAccessModal(true);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4]">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              Parent Package Management
            </h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Configure and manage Starter, Intermediate, Advanced, and Ultimate tiers, dynamically assign individual courses, set pricing, and oversee student purchases & access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'packages' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => syncUltimateMutation.mutate()}
                isLoading={syncUltimateMutation.isPending}
                leftIcon={<RefreshCw className="w-4 h-4 text-[#06B6D4]" />}
                title="Automatically combines all courses from Starter, Intermediate, Advanced, plus Growth Hack Strategies into Ultimate"
              >
                Sync Ultimate Package
              </Button>
              <Button
                size="sm"
                onClick={openCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Parent Package
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'packages'
              ? 'bg-white text-[#1E293B] shadow-xs'
              : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Parent Packages ({parentPackages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'purchases'
              ? 'bg-white text-[#1E293B] shadow-xs'
              : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Purchases & Refund Management</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: PARENT PACKAGES LIST & MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {isLoadingPackages ? (
            <div className="h-64 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : parentPackages.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <Layers className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#1E293B]">No Parent Packages Configured</h3>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto mb-4">
                Create Starter, Intermediate, Advanced or Ultimate packages to offer bundled curricula.
              </p>
              <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
                Create Parent Package
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parentPackages.map((pkg) => {
                const Icon = TIER_ICONS[pkg.tier] || Layers;
                const gradient = TIER_GRADIENTS[pkg.tier] || 'from-cyan-500 to-blue-600';
                const hasDiscount = pkg.discountPrice && pkg.discountPrice > 0 && pkg.discountPrice < pkg.price;

                return (
                  <div
                    key={pkg._id}
                    className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col shadow-xs hover:border-cyan-300 transition-all relative group"
                  >
                    {/* Top Tier Strip */}
                    <div className={`h-2.5 bg-gradient-to-r ${gradient}`} />

                    {/* Thumbnail & Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] uppercase tracking-wider">
                          <Icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                          {pkg.tier} (Tier {pkg.tierOrder})
                        </span>

                        <button
                          onClick={() => togglePublishMutation.mutate(pkg._id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            pkg.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {pkg.isPublished ? '● Published' : '○ Draft'}
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="aspect-video w-full rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden mb-3 relative">
                        {pkg.thumbnail ? (
                          <img
                            src={pkg.thumbnail.startsWith('http') ? pkg.thumbnail : `http://localhost:5000/${pkg.thumbnail}`}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layers className="w-10 h-10 text-slate-300" />
                          </div>
                        )}
                        {pkg.badge && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                            {pkg.badge}
                          </div>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#1E293B] line-clamp-1">
                        {pkg.name}
                      </h3>
                      {pkg.tagline && (
                        <p className="text-xs text-[#06B6D4] font-medium line-clamp-1">
                          {pkg.tagline}
                        </p>
                      )}
                      <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="px-5 py-2.5 bg-[#F8FAFC] border-y border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                      <div className="flex items-center gap-1.5 font-bold text-[#1E293B]">
                        <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>{pkg.courses?.length || 0} Courses</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{pkg.activePurchasersCount || 0} Active Enrolled</span>
                      </div>
                    </div>

                    {/* Assigned Courses List Preview */}
                    <div className="p-5 flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                          Assigned Courses:
                        </span>
                        <button
                          onClick={() => openCourseManager(pkg)}
                          className="text-[11px] font-bold text-[#06B6D4] hover:underline"
                        >
                          Manage Courses
                        </button>
                      </div>

                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {pkg.courses?.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No courses linked yet</p>
                        ) : (
                          pkg.courses?.map((c) => (
                            <div
                              key={c._id}
                              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                            >
                              <span className="truncate pr-2 font-medium text-[#1E293B]">{c.title}</span>
                              <button
                                onClick={() =>
                                  updateCoursesMutation.mutate({
                                    id: pkg._id,
                                    data: { action: 'remove', courseId: c._id },
                                  })
                                }
                                className="text-slate-400 hover:text-rose-500 shrink-0"
                                title="Unlink course from package"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="p-5 pt-3 bg-white border-t border-[#E2E8F0] space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-extrabold text-[#1E293B]">
                            ₹{(pkg.discountPrice || pkg.price)?.toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-[#94A3B8] line-through ml-1.5 font-medium">
                              ₹{pkg.price?.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#64748B] font-mono">
                          L1: {pkg.commissionRules?.level1Percent}% | L2: {pkg.commissionRules?.level2Percent}%
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => openCourseManager(pkg)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Courses</span>
                        </button>
                      </div>

                      {pkg.tier === 'ultimate' && (
                        <button
                          onClick={() => syncUltimateMutation.mutate()}
                          disabled={syncUltimateMutation.isPending}
                          className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-[#0891B2] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Sync with Starter, Inter & Adv</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PURCHASES & REFUND MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                id="admin-purchase-search"
                name="purchaseSearch"
                type="text"
                value={purchaseSearch}
                onChange={(e) => {
                  setPurchaseSearch(e.target.value);
                  setPurchasePage(1);
                }}
                placeholder="Search by student name, email, or invoice..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                id="admin-purchase-status-filter"
                name="purchaseStatusFilter"
                value={purchaseStatusFilter}
                onChange={(e) => {
                  setPurchaseStatusFilter(e.target.value);
                  setPurchasePage(1);
                }}
                className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="refunded">Refunded Only</option>
                <option value="cancelled">Cancelled Only</option>
                <option value="upgraded">Upgraded Only</option>
              </select>

              <select
                id="admin-purchase-type-filter"
                name="purchaseTypeFilter"
                value={purchaseTypeFilter}
                onChange={(e) => {
                  setPurchaseTypeFilter(e.target.value);
                  setPurchasePage(1);
                }}
                className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              >
                <option value="all">All Types</option>
                <option value="parent_package">Parent Packages</option>
                <option value="package_upgrade">Package Upgrades</option>
                <option value="course">Individual Courses</option>
              </select>
            </div>
          </div>

          {/* Purchases Table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-lg font-bold text-[#1E293B]">
                  Purchases & Enrollments ({purchasesData?.total || 0})
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {isLoadingPurchases ? (
                <div className="h-48 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : purchasesData?.purchases?.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <RotateCcw className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#1E293B]">No Purchases Found</h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    No transactions match your current search and filter criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Purchased Item</th>
                        <th>Type</th>
                        <th>Date & Expiry (1-Yr)</th>
                        <th>Amount Paid</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasesData?.purchases?.map((p) => {
                        const isExpired = p.effectiveStatus === 'expired' || p.isExpired;
                        const isUpgraded = p.status === 'upgraded';
                        const isRefunded = p.status === 'refunded' || p.status === 'cancelled';

                        return (
                          <tr key={p._id}>
                            <td>
                              <div className="font-bold text-[#1E293B]">{p.user?.name || 'User'}</div>
                              <div className="text-xs text-[#64748B]">{p.user?.email}</div>
                              <div className="text-[10px] text-[#94A3B8] font-mono">
                                #{p.invoiceNumber}
                              </div>
                            </td>
                            <td>
                              <div className="font-semibold text-[#1E293B]">
                                {p.parentPackage?.name || p.course?.title || 'Course Package'}
                              </div>
                              <div className="text-xs text-[#94A3B8]">Ref: {p.paymentRef}</div>
                            </td>
                            <td>
                              {p.itemType === 'parent_package' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-[#0891B2] border border-cyan-200">
                                  <Layers className="w-3 h-3" /> Parent Package
                                </span>
                              ) : p.itemType === 'package_upgrade' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Zap className="w-3 h-3" /> Upgrade
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#64748B]">
                                  <BookOpen className="w-3 h-3" /> Course
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="text-xs text-[#64748B]">
                                Purchased: {new Date(p.purchaseDate).toLocaleDateString('en-IN')}
                              </div>
                              <div className="text-xs font-semibold text-[#1E293B]">
                                Expires: {new Date(p.expiresAt).toLocaleDateString('en-IN')}
                              </div>
                              {!isExpired && !isUpgraded && !isRefunded && (
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  {p.daysRemaining} days remaining
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="font-bold text-emerald-600">
                                ₹{p.totalAmount?.toLocaleString('en-IN')}
                              </div>
                              {p.previousPaidAdjusted > 0 && (
                                <div className="text-[10px] text-[#06B6D4]">
                                  (Adjusted ₹{p.previousPaidAdjusted})
                                </div>
                              )}
                            </td>
                            <td>
                              {isUpgraded ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Upgraded
                                </span>
                              ) : isRefunded ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  {p.status.toUpperCase()}
                                </span>
                              ) : isExpired ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#64748B]">
                                  Expired
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openUserAccessInspector(p.user?._id)}
                                  title="Inspect full student access"
                                >
                                  Inspect Access
                                </Button>
                                {!isRefunded && !isUpgraded && (
                                  <button
                                    onClick={() => handleOpenRefund(p)}
                                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                  >
                                    Refund / Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CREATE / EDIT PARENT PACKAGE */}
      {/* ============================================================ */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title={isEditing ? `Edit Parent Package: ${selectedPkg?.name}` : 'Create New Parent Package'}
        size="lg"
      >
        <form onSubmit={handlePackageFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pkg-name" className="block text-[#1E293B] font-bold mb-1">Package Name *</label>
              <input
                id="pkg-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Starter / Beginner Level – The Digital Foundations"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div>
              <label htmlFor="pkg-tagline" className="block text-[#1E293B] font-bold mb-1">Package Tagline</label>
              <input
                id="pkg-tagline"
                name="tagline"
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Essential digital marketing & web foundations"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pkg-tier" className="block text-[#1E293B] font-bold mb-1">Tier *</label>
              <select
                id="pkg-tier"
                name="tier"
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              >
                <option value="starter">Starter</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="ultimate">Ultimate</option>
              </select>
            </div>

            <div>
              <label htmlFor="pkg-tier-order" className="block text-[#1E293B] font-bold mb-1">Tier Order (1-4)</label>
              <input
                id="pkg-tier-order"
                name="tierOrder"
                type="number"
                min="1"
                max="10"
                value={form.tierOrder}
                onChange={(e) => setForm({ ...form, tierOrder: e.target.value })}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div>
              <label htmlFor="pkg-badge" className="block text-[#1E293B] font-bold mb-1">Badge Text</label>
              <input
                id="pkg-badge"
                name="badge"
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. Best Value / Career Starter"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pkg-price" className="block text-[#1E293B] font-bold mb-1">Standard Price (₹) *</label>
              <input
                id="pkg-price"
                name="price"
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="2000"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>

            <div>
              <label htmlFor="pkg-discount-price" className="block text-[#1E293B] font-bold mb-1">Discount Price (₹)</label>
              <input
                id="pkg-discount-price"
                name="discountPrice"
                type="number"
                min="0"
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                placeholder="1999"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="pkg-description" className="block text-[#1E293B] font-bold mb-1">Description *</label>
            <textarea
              id="pkg-description"
              name="description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of what this curriculum offers..."
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div>
            <label htmlFor="pkg-highlights" className="block text-[#1E293B] font-bold mb-1">Highlights (One per line)</label>
            <textarea
              id="pkg-highlights"
              name="highlights"
              rows={2}
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              placeholder="100% Practical Coursework&#10;Verified Completion Certificate&#10;Direct Live Mentorship"
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label htmlFor="pkg-thumbnail-file" className="block text-[#1E293B] font-bold mb-1">Package Thumbnail</label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="w-20 h-14 object-cover rounded-xl border border-[#CBD5E1]"
                />
              )}
              <input
                id="pkg-thumbnail-file"
                name="thumbnailFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setThumbnailFile(file);
                    setThumbnailPreview(URL.createObjectURL(file));
                  }
                }}
                className="text-xs text-[#64748B]"
              />
            </div>
          </div>

          {/* Commission Rules & Publish Toggle */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label htmlFor="pkg-l1-percent" className="block text-[#1E293B] font-semibold mb-0.5">L1 Commission %</label>
              <input
                id="pkg-l1-percent"
                name="level1Percent"
                type="number"
                min="0"
                max="100"
                value={form.level1Percent}
                onChange={(e) => setForm({ ...form, level1Percent: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs"
              />
            </div>

            <div>
              <label htmlFor="pkg-l2-percent" className="block text-[#1E293B] font-semibold mb-0.5">L2 Commission %</label>
              <input
                id="pkg-l2-percent"
                name="level2Percent"
                type="number"
                min="0"
                max="100"
                value={form.level2Percent}
                onChange={(e) => setForm({ ...form, level2Percent: e.target.value })}
                className="w-full px-2 py-1 bg-white border border-[#CBD5E1] rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <input
                type="checkbox"
                id="pkg-published"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 text-[#06B6D4] rounded"
              />
              <label htmlFor="pkg-published" className="font-bold text-[#1E293B] cursor-pointer">
                Publish Package
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={closeEditModal} disabled={savePackageMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={savePackageMutation.isPending}>
              {isEditing ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: DYNAMIC COURSE ASSIGNMENT & UNLINK */}
      {/* ============================================================ */}
      <Modal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        title={`Assign Courses to: ${targetPkgForCourses?.name}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-900 leading-relaxed">
            Select individual courses to include in this Parent Package. When a student purchases this package, they automatically receive 1-year access to all selected courses.
            <div className="mt-1 text-[11px] text-cyan-700">
              *Unlinking a course only removes its reference from this package. The original course and videos are <strong>never deleted</strong>.
            </div>
          </div>

          {/* Search courses */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              id="admin-course-search"
              name="courseSearch"
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Search individual courses to link..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          {/* Course List Checkboxes */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {allCourses
              .filter((c) => !courseSearch || c.title?.toLowerCase().includes(courseSearch.toLowerCase()))
              .map((course) => {
                const isAssigned = targetPkgForCourses?.courses?.some(
                  (c) => (c._id || c).toString() === course._id.toString()
                );

                return (
                  <div
                    key={course._id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isAssigned
                        ? 'bg-cyan-50/60 border-cyan-300 ring-1 ring-cyan-200'
                        : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-9 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] overflow-hidden shrink-0">
                        {course.thumbnail ? (
                          <img
                            src={`http://localhost:5000/${course.thumbnail}`}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-5 h-5 text-slate-300 m-auto mt-2" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#1E293B] truncate">{course.title}</h4>
                        <p className="text-[11px] text-[#64748B]">
                          {course.totalVideos || 0} videos • ₹{course.price?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCourseInPackage(course._id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                        isAssigned
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-[#06B6D4] text-white hover:bg-[#0891B2]'
                      }`}
                    >
                      {isAssigned ? 'Unlink' : '+ Link Course'}
                    </button>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
            <Button onClick={() => setShowCourseModal(false)}>Done</Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: PROCESS REFUND / CANCELLATION */}
      {/* ============================================================ */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Process Refund / Cancellation"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Access Recalculation Notice</span>
            </div>
            <p className="text-amber-800">
              Refunding or cancelling this purchase will revoke access granted by this transaction. However, if the user has another valid active purchase for any included course, that course will <strong>remain unlocked</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Student:</span>
              <span className="font-bold text-[#1E293B]">{targetPurchaseForRefund?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Item:</span>
              <span className="font-bold text-[#1E293B]">
                {targetPurchaseForRefund?.parentPackage?.name || targetPurchaseForRefund?.course?.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Amount to Refund:</span>
              <span className="font-bold text-rose-600">
                ₹{targetPurchaseForRefund?.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[#1E293B] font-bold mb-1.5">Action Type</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundAction"
                  value="refund"
                  checked={refundAction === 'refund'}
                  onChange={() => setRefundAction('refund')}
                  className="text-[#06B6D4]"
                />
                <span className="font-medium text-[#1E293B]">Refund Payment</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundAction"
                  value="cancel"
                  checked={refundAction === 'cancel'}
                  onChange={() => setRefundAction('cancel')}
                  className="text-[#06B6D4]"
                />
                <span className="font-medium text-[#1E293B]">Cancel Access (Administrative)</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="admin-refund-remarks" className="block text-[#1E293B] font-bold mb-1">Administrative Remarks / Reason</label>
            <textarea
              id="admin-refund-remarks"
              name="adminRemarks"
              rows={2}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="e.g. Student requested full refund within 24h grace period..."
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#1E293B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="secondary" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmRefund}
              isLoading={refundMutation.isPending}
            >
              Confirm {refundAction === 'cancel' ? 'Cancellation' : 'Refund'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: USER ACCESS OVERVIEW INSPECTOR */}
      {/* ============================================================ */}
      <Modal
        isOpen={showAccessModal}
        onClose={() => {
          setShowAccessModal(false);
          setSelectedUserIdForAccess(null);
        }}
        title={`Student Course Access: ${userAccessData?.user?.name || 'Inspection'}`}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {isLoadingAccess ? (
            <div className="h-40 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {/* User Bio Bar */}
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">{userAccessData?.user?.name}</h4>
                  <p className="text-[#64748B]">{userAccessData?.user?.email} • {userAccessData?.user?.phone || 'No Phone'}</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {userAccessData?.totalActiveCourses || 0} Active Courses Unlocked
                  </span>
                </div>
              </div>

              {/* Active Courses */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px]">
                  Currently Unlocked Courses & 1-Year Expiry:
                </h4>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {userAccessData?.activeCourses?.length === 0 ? (
                    <p className="text-[#94A3B8] italic">No active courses unlocked.</p>
                  ) : (
                    userAccessData?.activeCourses?.map((course) => (
                      <div
                        key={course._id}
                        className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-[#1E293B]">{course.title}</p>
                          <p className="text-[11px] text-[#06B6D4]">
                            Granted via: <strong>{course.accessInfo?.sourceName || 'Purchase'}</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#1E293B] block">
                            Expires: {new Date(course.accessInfo?.expiresAt).toLocaleDateString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold">
                            {course.accessInfo?.daysRemaining} days left
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                <h4 className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px]">
                  Purchase Transaction History:
                </h4>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {userAccessData?.purchases?.map((p) => (
                    <div
                      key={p._id}
                      className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-[#1E293B]">
                          {p.parentPackage?.name || p.course?.title}
                        </span>
                        <span className="text-[#94A3B8] ml-2">({p.itemType})</span>
                        <div className="text-[#64748B] text-[10px]">
                          Invoice #{p.invoiceNumber} • Paid: ₹{p.totalAmount}
                        </div>
                      </div>
                      <Badge
                        variant={
                          p.status === 'active'
                            ? 'success'
                            : p.status === 'refunded' || p.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setShowAccessModal(false)}>Close Inspector</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminParentPackages;
