import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Upload, CheckCircle2, XCircle, Clock, User, Lock, Building2, 
  Banknote, ShieldCheck, KeyRound, Save 
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Profile = () => {
  const { user, updateUser } = useAuthStore();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState('kyc'); // 'kyc' | 'personal' | 'bank' | 'security'

  // Personal Info Form
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [personalErrors, setPersonalErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handlePersonalInputChange = (field, value) => {
    setPersonalForm((prev) => ({ ...prev, [field]: value }));
    let error = '';
    switch (field) {
      case 'name':
        if (value && !/^[a-zA-Z\s]+$/.test(value)) error = 'Only letters and spaces allowed';
        break;
      case 'phone':
        if (value && !/^[+]?[0-9\s-]{10,15}$/.test(value)) error = 'Invalid phone number format';
        break;
      default:
        break;
    }
    setPersonalErrors((prev) => ({ ...prev, [field]: error }));
  };

  const [bankForm, setBankForm] = useState({
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });
  const [bankErrors, setBankErrors] = useState({});
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);

  const handleBankInputChange = (field, value) => {
    setBankForm((prev) => ({ ...prev, [field]: value }));
    let error = '';
    switch (field) {
      case 'accountHolder':
        if (value && !/^[a-zA-Z\s]+$/.test(value)) error = 'Only letters and spaces allowed';
        break;
      case 'bankName':
        if (value && !/^[a-zA-Z\s]+$/.test(value)) error = 'Only letters and spaces allowed';
        break;
      case 'accountNumber':
        if (value && !/^\d*$/.test(value)) error = 'Only numbers allowed';
        else if (value && (value.length < 9 || value.length > 18)) error = 'Must be 9 to 18 digits';
        break;
      case 'ifscCode':
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) error = 'Format: 4 letters, a zero, 6 characters';
        break;
      case 'upiId':
        if (value && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value)) error = 'Invalid UPI ID format';
        break;
      default:
        break;
    }
    setBankErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // KYC Form
  const [kycForm, setKycForm] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null,
  });
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  useEffect(() => {
    const loadFullProfile = async () => {
      try {
        const res = await authService.getProfile();
        if (res.data?.user) {
          const u = res.data.user;
          setPersonalForm({ name: u.name || '', phone: u.phone || '' });
          if (u.bankDetails) {
            setBankForm({
              accountHolder: u.bankDetails.accountHolder || '',
              accountNumber: u.bankDetails.accountNumber || '',
              ifscCode: u.bankDetails.ifscCode || '',
              bankName: u.bankDetails.bankName || '',
              upiId: u.bankDetails.upiId || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load profile details', err);
      }
    };
    loadFullProfile();
  }, []);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile(personalForm);
      updateUser(res.data.user);
      toast.success('Personal profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();

    // Validations for professional formatting
    if (bankForm.accountHolder && !/^[a-zA-Z\s]+$/.test(bankForm.accountHolder)) {
      return toast.error('Account Holder Name should only contain letters and spaces');
    }
    if (bankForm.bankName && !/^[a-zA-Z\s]+$/.test(bankForm.bankName)) {
      return toast.error('Bank Name should only contain letters and spaces');
    }
    if (bankForm.accountNumber && !/^\d{9,18}$/.test(bankForm.accountNumber)) {
      return toast.error('Bank Account Number should be 9 to 18 digits');
    }
    if (bankForm.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankForm.ifscCode)) {
      return toast.error('Invalid IFSC Code. Format: 4 letters, a zero, 6 characters');
    }
    if (bankForm.upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(bankForm.upiId)) {
      return toast.error('Invalid UPI ID format (e.g. name@bank)');
    }

    setIsUpdatingBank(true);
    try {
      await authService.updateBankDetails(bankForm);
      toast.success('Bank & UPI details saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setIsUpdatingBank(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setKycForm({ ...kycForm, [field]: e.target.files[0] });
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycForm.aadharFront || !kycForm.aadharBack || !kycForm.panCard) {
      return toast.error('Please upload all 3 documents');
    }

    const formData = new FormData();
    formData.append('aadharFront', kycForm.aadharFront);
    formData.append('aadharBack', kycForm.aadharBack);
    formData.append('panCard', kycForm.panCard);

    setIsSubmittingKyc(true);
    try {
      await authService.submitKyc(formData);
      updateUser({ kycStatus: 'submitted' });
      toast.success('KYC documents submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">Account & Profile Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Manage your personal information, bank payout details, KYC verification, and password.
        </p>
      </div>

      {/* User Quick Info Card */}
      <Card className="border-cyan-200 bg-gradient-to-r from-white to-[#F8FAFC]">
        <CardBody className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-3xl font-bold text-[#1E293B] shadow-xl shadow-indigo-500/20 flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[#1E293B]">{user?.name}</h2>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider self-center sm:self-auto ${
                  user?.kycStatus === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : user?.kycStatus === 'submitted'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {user?.kycStatus === 'approved' ? 'KYC Verified' : user?.kycStatus === 'submitted' ? 'KYC In Review' : 'KYC Pending'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-mono">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-[#64748B]">
              <span>Referral Code: <strong className="text-[#06B6D4]">{user?.referralCode}</strong></span>
              <span>•</span>
              <span>Wallet: <strong className="text-emerald-400">₹{(user?.walletBalance || 0).toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        {[
          { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck },
          { id: 'bank', label: 'Bank & UPI Details', icon: Building2 },
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'security', label: 'Security & Password', icon: KeyRound },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-[#1E293B] shadow-lg shadow-indigo-600/20'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: KYC Verification */}
      {activeTab === 'kyc' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-[#1E293B]">Identity Verification (KYC)</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Government ID verification is required to process bank payouts.</p>
          </CardHeader>
          <CardBody>
            {user?.kycStatus === 'approved' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">KYC Verification Complete</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Your identity has been fully verified. You can now withdraw commissions directly to your registered bank account or UPI ID.
                </p>
              </div>
            ) : user?.kycStatus === 'submitted' ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
                <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">Documents Under Review</h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  Your KYC documents have been submitted and are currently being reviewed by our administrative team. Verification typically takes 2-4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                {user?.kycStatus === 'rejected' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-semibold text-sm">Previous Submission Rejected</h4>
                      <p className="text-red-400/80 text-xs mt-1">
                        Please re-upload clear photos/scans of your Aadhar Card and PAN Card.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'aadharFront', label: 'Aadhar Card (Front Side)' },
                    { id: 'aadharBack', label: 'Aadhar Card (Back Side)' },
                    { id: 'panCard', label: 'PAN Card (Front)' },
                  ].map((field) => (
                    <div key={field.id} className="relative">
                      <label className="block text-xs font-semibold text-[#64748B] mb-2">{field.label}</label>
                      <div
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                          kycForm[field.id]
                            ? 'border-indigo-500 bg-cyan-50'
                            : 'border-[#E2E8F0] hover:border-slate-500 bg-[#F8FAFC]'
                        }`}
                      >
                        {kycForm[field.id] ? (
                          <div>
                            <CheckCircle2 className="w-8 h-8 text-[#06B6D4] mx-auto mb-2" />
                            <p className="text-xs text-[#06B6D4] truncate px-2 font-mono">{kycForm[field.id].name}</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                            <p className="text-xs text-[#64748B]">Upload Image / PDF</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(e, field.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full" isLoading={isSubmittingKyc}>
                  Submit KYC for Approval
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      )}

      {/* Tab 2: Bank & UPI Details */}
      {activeTab === 'bank' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-[#1E293B]">Bank Account & UPI Details</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              These details will be used automatically when you request commission payouts.
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleBankSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account Holder Name"
                  placeholder="e.g. Sitaram Sharma"
                  value={bankForm.accountHolder}
                  onChange={(e) => handleBankInputChange('accountHolder', e.target.value)}
                  error={bankErrors.accountHolder}
                />
                <Input
                  label="Bank Name"
                  placeholder="e.g. State Bank of India / HDFC"
                  value={bankForm.bankName}
                  onChange={(e) => handleBankInputChange('bankName', e.target.value)}
                  error={bankErrors.bankName}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Account Number"
                  placeholder="e.g. 50100234567890"
                  type="password"
                  value={bankForm.accountNumber}
                  onChange={(e) => handleBankInputChange('accountNumber', e.target.value)}
                  error={bankErrors.accountNumber}
                />
                <Input
                  label="IFSC Code"
                  placeholder="e.g. SBIN0001234"
                  value={bankForm.ifscCode}
                  onChange={(e) => handleBankInputChange('ifscCode', e.target.value.toUpperCase())}
                  error={bankErrors.ifscCode}
                />
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                <Input
                  label="UPI ID (VPA)"
                  placeholder="e.g. yourname@okaxis or user@paytm"
                  value={bankForm.upiId}
                  onChange={(e) => handleBankInputChange('upiId', e.target.value)}
                  error={bankErrors.upiId}
                />
              </div>

              <Button type="submit" isLoading={isUpdatingBank} leftIcon={<Save className="w-4 h-4" />}>
                Save Bank & UPI Details
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Tab 3: Personal Information */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-[#1E293B]">Personal Details</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handlePersonalSubmit} className="space-y-4 max-w-lg">
              <Input
                label="Full Name"
                value={personalForm.name}
                onChange={(e) => handlePersonalInputChange('name', e.target.value)}
                error={personalErrors.name}
                required
              />
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={personalForm.phone}
                onChange={(e) => handlePersonalInputChange('phone', e.target.value)}
                error={personalErrors.phone}
              />

              <Button type="submit" isLoading={isUpdatingProfile} leftIcon={<Save className="w-4 h-4" />}>
                Save Profile
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Tab 4: Security & Password */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-[#1E293B]">Change Password</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />

              <Button type="submit" isLoading={isUpdatingPassword} leftIcon={<Lock className="w-4 h-4" />}>
                Update Password
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Profile;
