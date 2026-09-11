import { prisma } from './prisma';
import { calculateStreak } from './spacedRepetition';

export const XP_REWARDS = {
  NEW_NOTE: 10,
  REVIEW_FORGOT: 3,
  REVIEW_PARTIAL: 5,
  REVIEW_REMEMBERED: 10,
  STAGE_DONE: 50,
  JOURNAL_ENTRY: 10,
} as const;

export type XpSource =
  | 'note_created'
  | 'review_forgot'
  | 'review_partial'
  | 'review_remembered'
  | 'roadmap_stage_completed'
  | 'journal_entry'
  | string;

export interface LevelTier {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: '🌱 Pemula Bersemangat', minXP: 0, maxXP: 100 },
  { level: 2, title: '📚 Pembelajar Tekun', minXP: 100, maxXP: 250 },
  { level: 3, title: '⚡ Pembelajar Konsisten', minXP: 250, maxXP: 500 },
  { level: 4, title: '🧭 Penjelajah Kode', minXP: 500, maxXP: 1000 },
  { level: 5, title: '🛠️ Pengrajin Software', minXP: 1000, maxXP: Infinity },
];

export interface LevelInfo {
  level: number;
  title: string;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpNeeded: number;
  progressPercent: number;
}

/**
 * Menghitung detail level dan progress bar berdasarkan akumulasi total XP
 */
export function calculateLevelInfo(totalXP: number): LevelInfo {
  const currentTier =
    LEVEL_TIERS.find((t) => totalXP >= t.minXP && totalXP < t.maxXP) ||
    LEVEL_TIERS[LEVEL_TIERS.length - 1];

  if (currentTier.maxXP === Infinity) {
    return {
      level: currentTier.level,
      title: currentTier.title,
      totalXP,
      currentLevelXP: totalXP - currentTier.minXP,
      nextLevelXP: 0,
      xpNeeded: 0,
      progressPercent: 100,
    };
  }

  const range = currentTier.maxXP - currentTier.minXP;
  const progressInLevel = Math.max(0, totalXP - currentTier.minXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / range) * 100));
  const xpNeeded = currentTier.maxXP - totalXP;

  return {
    level: currentTier.level,
    title: currentTier.title,
    totalXP,
    currentLevelXP: progressInLevel,
    nextLevelXP: range,
    xpNeeded,
    progressPercent,
  };
}

/**
 * Fungsi terpusat untuk menambahkan XP ke user, mencatat ke XpLog, dan memperbarui streak
 */
export async function awardUserXP(
  amount: number,
  source: XpSource = 'general',
  updateStreak: boolean = true
) {
  // 1. Simpan riwayat perolehan XP ke tabel XpLog untuk analitik grafik
  await prisma.xpLog.create({
    data: {
      amount,
      source,
    },
  });

  // 2. Ambil atau buat record UserStats
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

  let streakData = {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastActivityDate: stats.lastActivityDate || new Date(),
  };

  if (updateStreak) {
    streakData = calculateStreak(
      stats.lastActivityDate,
      stats.currentStreak,
      stats.longestStreak
    );
  }

  const updatedStats = await prisma.userStats.update({
    where: { id: 'singleton' },
    data: {
      totalXP: { increment: amount },
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastActivityDate: streakData.lastActivityDate,
    },
  });

  const levelInfo = calculateLevelInfo(updatedStats.totalXP);

  return {
    stats: updatedStats,
    levelInfo,
    xpEarned: amount,
  };
}
