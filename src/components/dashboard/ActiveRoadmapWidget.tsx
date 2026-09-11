'use client';

import React from 'react';
import Link from 'next/link';
import { Map, ArrowRight, CheckCircle2, Flame } from 'lucide-react';

interface ActiveRoadmapWidgetProps {
  totalStages: number;
  completedStages: number;
  progressPercent: number;
  inProgressStage?: {
    id: string;
    title: string;
    description: string;
  } | null;
}

export const ActiveRoadmapWidget: React.FC<ActiveRoadmapWidgetProps> = ({
  totalStages = 0,
  completedStages = 0,
  progressPercent = 0,
  inProgressStage = null,
}) => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Roadmap Belajar Aktif
            </h3>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {completedStages}/{totalStages} Selesai ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar Visual */}
        <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden my-3">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-orange-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Current Active Stage */}
        {inProgressStage ? (
          <div className="mt-3 p-3 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span>Tahap Sedang Berjalan:</span>
            </div>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-1">
              {inProgressStage.title}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
              {inProgressStage.description}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 my-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {completedStages === totalStages && totalStages > 0
                ? 'Semua tahap dalam roadmap berhasil diselesaikan! Luar biasa!'
                : 'Pilih salah satu tahap untuk mulai belajar di roadmap.'}
            </span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-4 mt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <span>Buka Jalur Roadmap Lengkap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
