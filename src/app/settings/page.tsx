'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { TelegramSettings } from '@/components/settings/TelegramSettings';
import { ImportDataButton } from '@/components/settings/ImportDataButton';
import {
  Settings,
  Moon,
  Lock,
  Download,
  Database,
  Send,
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
            Kelola preferensi tema, notifikasi bot Telegram, keamanan akun, dan backup data Anda.
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

        {/* Section 2: Telegram Bot Reminder */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1 text-stone-900 dark:text-stone-100 font-bold">
            <Send className="w-4 h-4 text-sky-500" />
            <h2>Pengingat Telegram Bot</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Terima pesan pengingat otomatis di Telegram saat ada kartu flashcard yang jatuh tempo dan streak hampir putus.
          </p>
          <TelegramSettings />
        </div>

        {/* Section 3: Ganti Password */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1 text-stone-900 dark:text-stone-100 font-bold">
            <Lock className="w-4 h-4 text-orange-500" />
            <h2>Keamanan & Password</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Ganti password akun pribadimu. Dilengkapi proteksi brute-force (kunci 15 menit jika 5x salah).
          </p>
          <ChangePasswordForm />
        </div>

        {/* Section 4: Backup & Restore Data */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1 text-stone-900 dark:text-stone-100 font-bold">
            <Database className="w-4 h-4 text-orange-500" />
            <h2>Backup & Pemulihan Data</h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Unduh seluruh catatan belajar, progress roadmap, jurnal, dan statistik sebagai cadangan file JSON, atau pulihkan data dari file sebelumnya.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            {/* Export Button */}
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

            {/* Import Button */}
            <ImportDataButton />
          </div>

          {downloadSuccess && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3">
              <CheckCircle2 className="w-4 h-4" />
              Data berhasil diunduh ke komputer Anda!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
