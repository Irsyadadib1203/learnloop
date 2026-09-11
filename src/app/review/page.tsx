import React from 'react';
import { prisma } from '@/lib/prisma';
import { ReviewSession } from '@/components/review/ReviewSession';
import { RotateCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const now = new Date();

  // Ambil kartu review yang jatuh tempo
  const dueCards = await prisma.reviewCard.findMany({
    where: {
      nextReviewDate: { lte: now },
    },
    include: {
      note: true,
    },
    orderBy: {
      nextReviewDate: 'asc',
    },
  });

  const formattedCards = dueCards.map((c) => ({
    id: c.id,
    intervalStage: c.intervalStage,
    nextReviewDate: c.nextReviewDate.toISOString(),
    note: {
      id: c.note.id,
      title: c.note.title,
      topic: c.note.topic,
      content: c.note.content,
      whyImportant: c.note.whyImportant,
      codeExample: c.note.codeExample,
      masteryStatus: c.note.masteryStatus,
    },
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 text-xs font-semibold mb-2">
          <RotateCw className="w-3.5 h-3.5 animate-spin" />
          Sesi Spaced Repetition
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Review Flashcard Hari Ini
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
          Coba ingat-ingat dalam hati sebelum membuka jawaban. Latih otak Anda untuk active recall.
        </p>
      </div>

      <ReviewSession initialCards={formattedCards} />
    </div>
  );
}
