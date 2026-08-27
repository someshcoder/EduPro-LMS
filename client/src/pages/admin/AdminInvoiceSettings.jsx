import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Save, Building2, Percent, FileText, CheckCircle2 } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const AdminInvoiceSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    companyName: '',
    companyGstin: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    taxRatePercent: 18,
    invoicePrefix: 'INV-EDP',
    invoiceNotes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['adminGstSettings'],
    queryFn: async () => {
      const res = await invoiceService.getGstSettings();
      return res.data.settings;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        companyName: data.companyName || '',
        companyGstin: data.companyGstin || '',
        companyAddress: data.companyAddress || '',
        companyEmail: data.companyEmail || '',
        companyPhone: data.companyPhone || '',
        taxRatePercent: data.taxRatePercent ?? 18,
        invoicePrefix: data.invoicePrefix || 'INV-EDP',
        invoiceNotes: data.invoiceNotes || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (formData) => invoiceService.updateGstSettings(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminGstSettings']);
      toast.success('GST & Invoice settings updated successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save settings'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Invoice & GST Tax Settings</h1>
          <p className="text-slate-400 text-sm">
            Configure legal company details, GSTIN tax identification, and automated invoice format.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company & GST Details */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-white">Company & Legal Information</h2>
            <p className="text-xs text-slate-400">These details will appear on all student tax receipts.</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Legal Registered Entity Name"
                placeholder="e.g. EduPro Learning Technologies Pvt. Ltd."
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
              <Input
                label="GSTIN / Tax Identification Number"
                placeholder="e.g. 07AAAAA0000A1Z5"
                value={form.companyGstin}
                onChange={(e) => setForm({ ...form, companyGstin: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Registered Office Address</label>
              <textarea
                rows={2}
                value={form.companyAddress}
                onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                placeholder="Complete company address with PIN code..."
                className="w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Billing Support Email"
                type="email"
                placeholder="billing@edupro.com"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              />
              <Input
                label="Support Contact Phone"
                placeholder="+91 98765 43210"
                value={form.companyPhone}
                onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
              />
            </div>
          </CardBody>
        </Card>

        {/* Invoice Format & Tax Rates */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-white">Tax Rate & Invoice Numbering</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  GST Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.taxRatePercent}
                    onChange={(e) => setForm({ ...form, taxRatePercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Split as 50% CGST + 50% SGST (e.g. 18% = 9% CGST + 9% SGST)</p>
              </div>

              <Input
                label="Invoice Number Prefix"
                placeholder="e.g. INV-EDP or INV-2026"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Invoice Terms & Notes</label>
              <textarea
                rows={2}
                value={form.invoiceNotes}
                onChange={(e) => setForm({ ...form, invoiceNotes: e.target.value })}
                placeholder="Notes displayed at the bottom of the invoice..."
                className="w-full px-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
            size="lg"
          >
            Save GST & Invoice Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminInvoiceSettings;
