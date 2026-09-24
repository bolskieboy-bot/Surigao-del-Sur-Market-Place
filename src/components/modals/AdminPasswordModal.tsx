import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AdminPasswordModal: React.FC = () => {
  const { currentAdmin, setCurrentAdmin, adminPasswordModalOpen, setAdminPasswordModalOpen, showToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('Surigao2026AdminSecret!');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!adminPasswordModalOpen || !currentAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminChangePassword(currentAdmin.id, currentPassword, newPassword);
      setCurrentAdmin(res.admin);
      setAdminPasswordModalOpen(false);
      showToast('Admin password changed successfully. Account is now secure!');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              First-Time Admin Password Change
            </h3>
            <p className="text-xs text-slate-500">
              Account: <span className="font-bold text-slate-800">{currentAdmin.username}</span>
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5 text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center space-x-1">
            <span>Mandatory Security Requirement</span>
          </p>
          <p>
            You are logged in with the initial deployment bootstrap secret. To protect Surigao del Sur Marketplace records and platform commission operations, you must choose a new personal administrator password.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Current Bootstrap Secret / Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Personal Administrator Password
            </label>
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-rose-600 outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Securing Account...' : 'Update Password & Activate Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
