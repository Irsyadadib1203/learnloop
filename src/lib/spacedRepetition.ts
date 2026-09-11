import { ReviewResult } from '@prisma/client';

export const LEITNER_INTERVAL_DAYS: Record<number, number> = {
  0: 1,  // Besok
  1: 3,  // 3 hari
  2: 7,  // 7 hari
  3: 14, // 14 hari
  4: 30, // 30 hari
};

export interface LeitnerCalculationResult {
  nextIntervalStage: number;
  nextReviewDate: Date;
}

/**
 * Hitung stage dan jadwal review berikutnya murni berdasarkan algoritma Leitner Box
 */
export function calculateNextReview(
  currentStage: number,
  result: ReviewResult
): LeitnerCalculationResult {
  let nextStage = currentStage;

  if (result === 'FORGOT') {
    // Reset ke stage awal (besok)
    nextStage = 0;
  } else if (result === 'PARTIAL') {
    // Bertahan di stage saat ini
    nextStage = Math.max(0, currentStage);
  } else if (result === 'REMEMBERED') {
    // Naik ke stage berikutnya (maks stage 4)
    nextStage = Math.min(4, currentStage + 1);
  }

  const daysToAdd = LEITNER_INTERVAL_DAYS[nextStage] ?? 1;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  // Set waktu review ke jam 04:00 dini hari lokal agar siap di pagi hari
  nextDate.setHours(4, 0, 0, 0);

  return {
    nextIntervalStage: nextStage,
    nextReviewDate: nextDate,
  };
}

/**
 * Helper untuk menghitung update streak aktivitas harian
 */
export function calculateStreak(
  lastActivityDate: Date | null,
  currentStreak: number,
  longestStreak: number
): { currentStreak: number; longestStreak: number; lastActivityDate: Date } {
  const now = new Date();
  
  if (!lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastActivityDate: now,
    };
  }

  // Format tanggal ke YYYY-MM-DD lokal untuk perbandingan hari yang akurat
  const toDayString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = toDayString(now);
  const lastStr = toDayString(new Date(lastActivityDate));

  if (todayStr === lastStr) {
    // Aktivitas di hari yang sama, streak tetap
    return {
      currentStreak,
      longestStreak,
      lastActivityDate: now,
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDayString(yesterday);

  if (lastStr === yesterdayStr) {
    // Aktivitas berturut-turut di hari kemarin, streak bertambah
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActivityDate: now,
    };
  }

  // Terlewat lebih dari 1 hari, reset streak ke 1
  return {
    currentStreak: 1,
    longestStreak: Math.max(1, longestStreak),
    lastActivityDate: now,
  };
}
