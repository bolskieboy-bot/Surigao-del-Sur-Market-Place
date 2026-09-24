import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const ReportModal: React.FC = () => {
  const { reportModal, setReportModal, currentUser, showToast } = useApp();

  const [reason, setReason] = useState<'fake_listing' | 'scam' | 'prohibited_item' | 'misleading' | 'other'>('misleading');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!reportModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      showToast('Please provide details for the provincial moderation team.');
      return;
    }

    setLoading(true);
    try {
      await api.submitReport({
        reporterId: currentUser?.id || 'guest_buyer',
        reporterName: currentUser?.fullName || 'Community Member',
        targetType: reportModal.targetType,
        targetId: reportModal.targetId,
        targetTitle: reportModal.targetTitle,
        reason,
        details: details.trim()
      });
      showToast('Report submitted. Provincial administrator will review shortly.');
      setReportModal(null);
    } catch {
      showToast('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={() => setReportModal(null)}
          className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Submit Community Report
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[240px]">
              Item: {reportModal.targetTitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Reason for Report
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden font-medium"
            >
              <option value="misleading">Misleading Price or Description</option>
              <option value="fake_listing">Fake or Non-Existent Listing</option>
              <option value="scam">Suspected Fraud or Scam</option>
              <option value="prohibited_item">Prohibited Good (Illegal / Hazardous)</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Provide Detailed Explanation *
            </label>
            <textarea
              rows={4}
              placeholder="Explain the issue to help our provincial administrators investigate..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs disabled:opacity-50"
          >
            {loading ? 'Submitting Report...' : 'SUBMIT REPORT TO ADMINISTRATOR'}
          </button>
        </form>
      </div>
    </div>
  );
};
