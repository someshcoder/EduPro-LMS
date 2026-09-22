import React, { useRef } from 'react';
import { X, Download, Printer, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from './Button';

const CertificateModal = ({ certificate, onClose }) => {
  const certRef = useRef(null);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Course Completion Certificate</h2>
              <p className="text-xs text-slate-400">ID: {certificate.certificateId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Frame (Printable View) */}
        <div className="p-6 md:p-8 flex items-center justify-center bg-slate-950/50">
          <div
            ref={certRef}
            id="printable-certificate"
            className="w-full bg-[#0a0f1d] text-slate-100 rounded-2xl border-4 border-amber-500/60 p-8 md:p-12 relative overflow-hidden shadow-2xl font-serif text-center"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.5) 0%, rgba(10, 15, 29, 0.95) 100%)',
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-400/80" />
            <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-400/80" />
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-400/80" />
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-400/80" />

            {/* Top Emblem */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-1 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#0a0f1d] rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400/90 font-sans mt-3 font-semibold">
                {certificate.organizationName || 'CourseEarn Learning Platform'}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-white mt-1 uppercase font-serif">
                Certificate of Completion
              </h1>
            </div>

            <p className="text-sm text-slate-300 font-sans italic max-w-md mx-auto mb-4">
              This is proudly presented to verify that
            </p>

            {/* Student Name */}
            <div className="my-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase tracking-wide underline decoration-amber-500/30 underline-offset-8">
                {certificate.userName}
              </h2>
            </div>

            <p className="text-sm text-slate-300 font-sans max-w-xl mx-auto mb-6 leading-relaxed">
              has successfully completed all lectures, curriculum requirements, and assessments for the professional course:
            </p>

            {/* Course Title */}
            <div className="p-4 bg-slate-900/80 border border-amber-500/20 rounded-xl max-w-xl mx-auto mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-amber-300 font-sans tracking-wide">
                {certificate.courseTitle}
              </h3>
            </div>

            {/* Footer Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800 items-end font-sans">
              {/* Issued Date */}
              <div className="text-center md:text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Date of Issue</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <div className="mt-2 flex items-center justify-center md:justify-start gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Credential
                </div>
              </div>

              {/* Center Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center p-1 bg-amber-500/10">
                  <div className="text-center">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mx-auto" />
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-tighter">OFFICIAL SEAL</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{certificate.certificateId}</p>
              </div>

              {/* Signature */}
              <div className="text-center md:text-right">
                <div className="inline-block border-b border-slate-600 pb-1 px-4 mb-1">
                  <p className="font-serif italic text-lg text-amber-200 font-bold tracking-wider">
                    {certificate.signatoryName || 'Dr. Rajesh Sharma'}
                  </p>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {certificate.signatoryTitle || 'Director of Academic Affairs'}
                </p>
                <p className="text-[10px] text-slate-500">CourseEarn Academic Board</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital verification code: <strong className="text-white font-mono">{certificate.certificateId}</strong></span>
          </div>
          <Button onClick={handlePrint} leftIcon={<Download className="w-4 h-4" />}>
            Download / Print Certificate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
