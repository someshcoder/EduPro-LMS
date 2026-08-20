import { useState } from 'react';
import { Upload, CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services/authService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [kycForm, setKycForm] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      await authService.submitKyc(formData);
      updateUser({ kycStatus: 'submitted' });
      toast.success('KYC documents submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderKycStatus = () => {
    switch (user?.kycStatus) {
      case 'approved':
        return (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">KYC Verified</h3>
            <p className="text-slate-400 text-sm">Your identity has been verified. You can now request payouts.</p>
          </div>
        );
      case 'submitted':
        return (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Under Review</h3>
            <p className="text-slate-400 text-sm">Your documents have been submitted and are being reviewed by our team.</p>
          </div>
        );
      case 'rejected':
      case 'pending':
      default:
        return (
          <form onSubmit={handleKycSubmit} className="space-y-6">
            {user?.kycStatus === 'rejected' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="text-red-400 font-semibold">Previous Submission Rejected</h4>
                  <p className="text-red-400/80 text-sm mt-1">Please ensure your documents are clear and match your profile details.</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'aadharFront', label: 'Aadhar Card (Front)' },
                { id: 'aadharBack', label: 'Aadhar Card (Back)' },
                { id: 'panCard', label: 'PAN Card' }
              ].map(field => (
                <div key={field.id} className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    kycForm[field.id] ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                  }`}>
                    {kycForm[field.id] ? (
                      <div>
                        <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <p className="text-xs text-indigo-300 truncate px-2">{kycForm[field.id].name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Click to upload image/PDF</p>
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
            
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Submit KYC Documents
            </Button>
          </form>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile & KYC</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account details and identity verification.</p>
      </div>

      <Card>
        <CardBody className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
            <p className="text-slate-400">{user?.email}</p>
            {user?.phone && <p className="text-slate-400 text-sm mt-1">{user.phone}</p>}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-white">Identity Verification (KYC)</h2>
        </CardHeader>
        <CardBody>
          {renderKycStatus()}
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
