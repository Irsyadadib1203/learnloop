import React from 'react';
import Link from 'next/link';
import { JournalForm } from '@/components/journal/JournalForm';
import { ArrowLeft, BookMarked, Sparkles } from 'lucide-react';

export default function NewJournalPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Riwayat Jurnal
      </Link>

      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Tulis Jurnal Belajar
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Refleksikan sesi belajarmu hari ini
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            +10 XP
          </span>
        </div>

        {/* Form */}
        <JournalForm />
      </div>
    </div>
  );
}
