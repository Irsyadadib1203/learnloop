'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export const ChangePasswordForm: React.FC = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengganti password.');
        return;
      }

      setSuccess(true);
      // Invalidate session redirects to login
      setTimeout(() => {
        router.push('/login');
        router.refresh();
      }, 1500);
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Password Saat Ini
        </label>
        <input
          type="password"
          required
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Password Baru
        </label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Konfirmasi Password Baru
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ulangi password baru"
          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
        />
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2 rounded-xl">
          {error}
        </p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Password berhasil diubah! Mengalihkan ke login...</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        Simpan Password Baru
      </button>
    </form>
  );
};
