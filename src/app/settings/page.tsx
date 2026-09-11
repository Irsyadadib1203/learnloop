'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import {
  Settings,
  Moon,
  Lock,
  Download,
  Database,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setDownloading(true);
      setDownloadSuccess(false);
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnloop-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal mengekspor data.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
          <Settings className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Pengaturan Aplikasi
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Kelola preferensi tema, keamanan akun, dan backup data Anda.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Tema Tampilan */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1 text-stone-900 dark:text-stone-100 font-bold">
            <Moon className="w-4 h-4 text-orange-500" />
            <h2>Tema Tampilan</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Pilih preferensi mode tampilan yang nyaman untuk matamu saat belajar.
          </p>
          <ThemeToggle />
        </div>

        {/* Section 2: Ganti Password */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1 text-stone-900 dark:text-stone-100 font-bold">
            <Lock className="w-4 h-4 text-orange-500" />
            <h2>Keamanan & Password</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Ganti password akun pribadimu. Setelah berhasil, kamu akan diarahkan untuk login ulang.
          </p>
          <ChangePasswordForm />
        </div>

        {/* Section 3: Ekspor Data Backup */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1 text-stone-900 dark:text-stone-100 font-bold">
            <Database className="w-4 h-4 text-orange-500" />
            <h2>Backup & Ekspor Data</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Unduh seluruh catatan, review card, progress roadmap, jurnal, dan riwayat XP dalam format file JSON.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? 'Mengekspor...' : 'Ekspor Semua Data (JSON)'}
            </button>

            {downloadSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Data berhasil diunduh!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
