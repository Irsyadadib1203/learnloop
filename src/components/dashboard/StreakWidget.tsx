'use client';

import React from 'react';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import { LevelInfo } from '@/lib/gamification';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  levelInfo?: LevelInfo;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  currentStreak = 0,
  longestStreak = 0,
  totalXP = 0,
  levelInfo,
}) => {
  const level = levelInfo?.level ?? 1;
  const title = levelInfo?.title ?? '🌱 Pemula Bersemangat';
  const progressPercent = levelInfo?.progressPercent ?? 0;
  const currentLevelXP = levelInfo?.currentLevelXP ?? totalXP;
  const nextLevelXP = levelInfo?.nextLevelXP ?? 100;
  const xpNeeded = levelInfo?.xpNeeded ?? 100;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-orange-200/80 dark:border-orange-950/60 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Streak Main Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
            <Flame className="w-9 h-9 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                {currentStreak}
              </span>
              <span className="text-base font-semibold text-orange-600 dark:text-orange-400">
                Hari Beruntun! 🔥
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {currentStreak > 0
                ? 'Mantap! Konsistensi mengalahkan intensitas dadakan.'
                : 'Mulai aktivitas belajar hari ini untuk menyalakan streak!'}
            </p>
          </div>
        </div>

        {/* Stats Pills: Longest Streak & Level Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-stone-400">Rekor Terbaik</div>
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">{longestStreak} Hari</div>
            </div>
          </div>

          <div className="flex-1 sm:flex-none flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-stone-400">Level {level}</div>
              <div className="text-xs font-bold text-orange-600 dark:text-orange-400">{title}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Level Progress Bar */}
      <div className="pt-2 border-t border-orange-200/50 dark:border-orange-950/40">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
            <span>Progress Menuju Level {level + 1}</span>
            <span className="text-stone-400 font-normal">({totalXP} Total XP)</span>
          </span>
          <span className="text-stone-500 font-medium">
            {xpNeeded > 0 ? `${xpNeeded} XP lagi` : 'Level Maksimal'}
          </span>
        </div>
        <div className="w-full h-2 bg-stone-200/80 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
