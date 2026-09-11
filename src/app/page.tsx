import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateLevelInfo } from '@/lib/gamification';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { MoodWidget } from '@/components/dashboard/MoodWidget';
import { ReviewSummaryWidget } from '@/components/dashboard/ReviewSummaryWidget';
import { ActiveRoadmapWidget } from '@/components/dashboard/ActiveRoadmapWidget';
import { NoteCard } from '@/components/notes/NoteCard';
import { BookOpen, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamic rendering karena data berubah secara real-time
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // 1. Ambil User Stats & Hitung Gamifikasi
  let stats = await prisma.userStats.findUnique({
    where: { id: 'singleton' },
  });

  if (!stats) {
    stats = await prisma.userStats.create({
      data: {
        id: 'singleton',
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }

  const levelInfo = calculateLevelInfo(stats.totalXP);

  // 2. Ambil Kartu Review yang jatuh tempo (<= sekarang)
  const now = new Date();
  const dueCards = await prisma.reviewCard.findMany({
    where: {
      nextReviewDate: { lte: now },
    },
    include: {
      note: true,
    },
  });

  // 3. Ambil topik yang belum disentuh > 7 hari
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const staleCards = await prisma.reviewCard.findMany({
    where: {
      OR: [
        { lastReviewedAt: { lte: sevenDaysAgo } },
        { lastReviewedAt: null, createdAt: { lte: sevenDaysAgo } },
      ],
    },
    include: {
      note: { select: { topic: true } },
    },
  });

  const staleTopics = Array.from(new Set(staleCards.map((c) => c.note.topic)));

  // 4. Ambil data Roadmap Stages untuk ActiveRoadmapWidget
  const stages = await prisma.roadmapStage.findMany({
    orderBy: { order: 'asc' },
  });
  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.status === 'DONE').length;
  const inProgressStage = stages.find((s) => s.status === 'IN_PROGRESS') || null;
  const roadmapProgressPercent =
    totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  // 5. Ambil mood hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMood = await prisma.moodLog.findFirst({
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: 'desc' },
  });

  // 6. Ambil 4 catatan terbaru
  const recentNotes = await prisma.note.findMany({
    take: 4,
    orderBy: { updatedAt: 'desc' },
    include: {
      reviewCard: true,
      stage: true,
    },
  });

  const totalNotesCount = await prisma.note.count();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
            <span>Halo, {user?.username || 'Irsyad'}!</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Gelar saat ini: <strong className="text-orange-600 dark:text-orange-400">{levelInfo.title}</strong>. Siap melangkah di roadmap hari ini?
          </p>
        </div>

        <Link href="/notes/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Tulis Catatan Baru</span>
          </Button>
        </Link>
      </div>

      {/* Top Banner: Streak & Gamification Leveling Widget */}
      <StreakWidget
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
        totalXP={stats.totalXP}
        levelInfo={levelInfo}
      />

      {/* Main Grid: Review Summary & Roadmap Active Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewSummaryWidget
          totalDue={dueCards.length}
          staleTopicsCount={staleTopics.length}
          staleTopics={staleTopics}
        />

        <ActiveRoadmapWidget
          totalStages={totalStages}
          completedStages={completedStages}
          progressPercent={roadmapProgressPercent}
          inProgressStage={inProgressStage}
        />
      </div>

      {/* Secondary Grid: Mood Check-in & Vocabulary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodWidget initialMood={todayMood?.mood} />

        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Perbendaharaan Konsep Belajar
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                {totalNotesCount}
              </span>
              <span className="text-xs text-stone-500 font-medium">Catatan teknis tersimpan</span>
            </div>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Setiap catatan otomatis terintegrasi ke sistem Leitner box untuk pengulangan terjadwal.
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <Link
              href="/notes"
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>Buka Semua Koleksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Notes Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Catatan Terakhir
            </h2>
          </div>
          <Link
            href="/notes"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>Buka Semua ({totalNotesCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 text-center bg-white/50 dark:bg-stone-900/50">
            <p className="text-sm text-stone-500 mb-4">
              Belum ada catatan belajar yang tersimpan.
            </p>
            <Link href="/notes/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Buat Catatan Pertamamu</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={{
                  ...note,
                  createdAt: note.createdAt.toISOString(),
                  updatedAt: note.updatedAt.toISOString(),
                  reviewCard: note.reviewCard
                    ? {
                        ...note.reviewCard,
                        nextReviewDate: note.reviewCard.nextReviewDate.toISOString(),
                        lastReviewedAt: note.reviewCard.lastReviewedAt
                          ? note.reviewCard.lastReviewedAt.toISOString()
                          : null,
                      }
                    : null,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
