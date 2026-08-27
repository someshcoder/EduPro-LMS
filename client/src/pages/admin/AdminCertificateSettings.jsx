import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Save, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import CertificateModal from '../../components/common/CertificateModal';
import toast from 'react-hot-toast';

const AdminCertificateSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    orgName: 'EduPro Learning Platform',
    signatoryName: 'Dr. Rajesh Sharma',
    signatoryTitle: 'Director of Academic Affairs',
    certificateTitle: 'Certificate of Completion',
    autoIssueCertificate: true,
  });
  const [showPreview, setShowPreview] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['adminCertificateSettings'],
    queryFn: async () => {
      const res = await certificateService.getCertificateSettings();
      return res.data.settings;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        orgName: data.orgName || 'EduPro Learning Platform',
        signatoryName: data.signatoryName || 'Dr. Rajesh Sharma',
        signatoryTitle: data.signatoryTitle || 'Director of Academic Affairs',
        certificateTitle: data.certificateTitle || 'Certificate of Completion',
        autoIssueCertificate: data.autoIssueCertificate !== false,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (formData) => certificateService.updateCertificateSettings(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCertificateSettings']);
      toast.success('Certificate settings saved successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save certificate settings'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const sampleCert = {
    certificateId: 'CERT-EDP-SAMPLE999',
    userName: 'Sample Student Name',
    courseTitle: 'Full-Stack Digital Marketing & Development Mastery',
    issuedAt: new Date(),
    organizationName: form.orgName,
    signatoryName: form.signatoryName,
    signatoryTitle: form.signatoryTitle,
  };

  if (isLoading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Certificate Manager</h1>
            <p className="text-slate-400 text-sm">
              Customize course completion certificate template, authorized signatures, and issuer details.
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={() => setShowPreview(true)} leftIcon={<Eye className="w-4 h-4" />}>
          Preview Certificate
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-white">Signatory & Organization Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Issuing Organization Name"
                placeholder="e.g. EduPro Learning Academy"
                value={form.orgName}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                required
              />
              <Input
                label="Certificate Title"
                placeholder="e.g. Certificate of Completion & Excellence"
                value={form.certificateTitle}
                onChange={(e) => setForm({ ...form, certificateTitle: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Authorized Signatory Name"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={form.signatoryName}
                onChange={(e) => setForm({ ...form, signatoryName: e.target.value })}
                required
              />
              <Input
                label="Signatory Title / Designation"
                placeholder="e.g. Director of Academic Affairs"
                value={form.signatoryTitle}
                onChange={(e) => setForm({ ...form, signatoryTitle: e.target.value })}
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoIssue"
                checked={form.autoIssueCertificate}
                onChange={(e) => setForm({ ...form, autoIssueCertificate: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <label htmlFor="autoIssue" className="text-sm font-medium text-slate-300 cursor-pointer">
                Automatically issue certificate when user reaches 100% video completion
              </label>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
            size="lg"
          >
            Save Certificate Settings
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <CertificateModal certificate={sampleCert} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default AdminCertificateSettings;
