'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCw, AlertTriangle, CheckCircle2, ArrowRight, Plus } from 'lucide-react';

interface ReviewSummaryWidgetProps {
  totalDue: number;
  staleTopicsCount: number;
  staleTopics: string[];
}

export const ReviewSummaryWidget: React.FC<ReviewSummaryWidgetProps> = ({
  totalDue = 0,
  staleTopicsCount = 0,
  staleTopics = [],
}) => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <RotateCw className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Ringkasan Review Hari Ini
            </h3>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Spaced Repetition
          </span>
        </div>

        {/* Due Cards Indicator */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            {totalDue}
          </span>
          <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
            kartu siap direview
          </span>
        </div>

        {totalDue === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium my-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Semua kartu untuk hari ini sudah direview! Kerja bagus!</span>
          </div>
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Ulangi materi penting sekarang untuk memperkuat memori jangka panjang sebelum lupa.
          </p>
        )}

        {/* Stale Topics Alert if any (> 7 days) */}
        {staleTopicsCount > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Perhatian:</span> Ada {staleTopicsCount} topik (
              <span className="underline font-medium">{staleTopics.slice(0, 2).join(', ')}</span>
              {staleTopics.length > 2 ? ` dan ${staleTopics.length - 2} lainnya` : ''}) belum di-review lebih dari 7 hari!
            </div>
          </div>
        )}
      </div>

      {/* Call to Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
        <Link
          href="/review"
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            totalDue > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 active:scale-[0.98]'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
          }`}
        >
          <span>{totalDue > 0 ? 'Mulai Review Sekarang' : 'Buka Menu Review'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/notes/new"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-orange-500" />
          <span>Tulis Catatan Baru</span>
        </Link>
      </div>
    </div>
  );
};
