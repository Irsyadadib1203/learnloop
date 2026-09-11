import React from 'react';
import { prisma } from '@/lib/prisma';
import { calculateLevelInfo } from '@/lib/gamification';
import { WeeklyXPChart } from '@/components/stats/WeeklyXPChart';
import { TopicDistributionChart } from '@/components/stats/TopicDistributionChart';
import {
  Flame,
  Zap,
  BookOpen,
  RotateCw,
  Trophy,
  BarChart2,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Parallelize ALL database queries simultaneously
  const [
    stats,
    totalNotes,
    totalReviews,
    totalJournals,
    xpLogs,
    notes,
  ] = await Promise.all([
    prisma.userStats.findUnique({ where: { id: 'singleton' } }),
    prisma.note.count(),
    prisma.reviewCard.count({
      where: { lastReviewedAt: { not: null } },
    }),
    prisma.journalEntry.count(),
    prisma.xpLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.note.findMany({ select: { topic: true } }),
  ]);

  const totalXP = stats?.totalXP ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;
  const longestStreak = stats?.longestStreak ?? 0;
  const levelInfo = calculateLevelInfo(totalXP);

  const dateMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    dateMap[key] = 0;
  }

  for (const log of xpLogs) {
    const key = new Date(log.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
    if (key in dateMap) {
      dateMap[key] += log.amount;
    }
  }

  const weeklyXP = Object.entries(dateMap).map(([date, xp]) => ({ date, xp }));
  const weeklyTotalXP = weeklyXP.reduce((sum, item) => sum + item.xp, 0);

  // 4. Topic distribution (calculated from parallel-fetched notes)
  const topicCount: Record<string, number> = {};
  for (const n of notes) {
    topicCount[n.topic] = (topicCount[n.topic] ?? 0) + 1;
  }
  const topicDistribution = Object.entries(topicCount)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
          <BarChart2 className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Statistik & Progres Belajar
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Pantau konsistensi, perolehan XP, dan sebaran materi yang sudah kamu kuasai.
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Total XP & Level */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total XP
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            {totalXP} <span className="text-xs font-normal text-stone-400">XP</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Level {levelInfo.level} • {levelInfo.title}
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Streak Saat Ini
            </span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            {currentStreak} <span className="text-xs font-normal text-stone-400">hari</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Rekor: {longestStreak} hari
          </p>
        </div>

        {/* Total Notes */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Catatan
            </span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            {totalNotes}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {topicDistribution.length} topik berbeda
          </p>
        </div>

        {/* Total Flashcard Reviews */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Review Selesai
            </span>
            <RotateCw className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            {totalReviews}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {totalJournals} jurnal ditulis
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly XP Bar Chart */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                Aktivitas XP 7 Hari Terakhir
              </h2>
              <p className="text-xs text-stone-400">Total didapat: +{weeklyTotalXP} XP</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-xs font-semibold text-orange-600 dark:text-orange-400">
              +{weeklyTotalXP} XP
            </span>
          </div>
          <WeeklyXPChart data={weeklyXP} />
        </div>

        {/* Topic Distribution Pie Chart */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Distribusi Catatan per Topik
            </h2>
            <p className="text-xs text-stone-400">Komposisi materi belajar</p>
          </div>
          <TopicDistributionChart data={topicDistribution} />
        </div>
      </div>

      {/* Gamification Level Status Card */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200/60 dark:border-orange-900/40 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Level {levelInfo.level}
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {levelInfo.title}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP menuju Level{' '}
                {levelInfo.level + 1}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
              <span>Progress</span>
              <span>{Math.round(levelInfo.progressPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.round(levelInfo.progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
