import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { NotesContainer } from '@/components/notes/NotesContainer';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  // Fetch notes and unique topics in parallel on server
  const [rawNotes, allTopics] = await Promise.all([
    prisma.note.findMany({
      include: {
        reviewCard: true,
        stage: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.note.findMany({
      select: { topic: true },
      distinct: ['topic'],
    }),
  ]);

  const initialNotes = rawNotes.map((note) => ({
    id: note.id,
    title: note.title,
    topic: note.topic,
    content: note.content,
    whyImportant: note.whyImportant,
    codeExample: note.codeExample,
    masteryStatus: note.masteryStatus,
    stageId: note.stageId,
    stage: note.stage,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    reviewCard: note.reviewCard
      ? {
          id: note.reviewCard.id,
          intervalStage: note.reviewCard.intervalStage,
          nextReviewDate: note.reviewCard.nextReviewDate.toISOString(),
          lastReviewedAt: note.reviewCard.lastReviewedAt
            ? note.reviewCard.lastReviewedAt.toISOString()
            : null,
          lastResult: note.reviewCard.lastResult,
        }
      : null,
  }));

  const initialTopics = allTopics.map((t) => t.topic);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-orange-500" />
            <span>Koleksi Catatan Belajar</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Ditulis dengan pemahaman sendiri untuk penguasaan konsep jangka panjang.
          </p>
        </div>

        <Link href="/notes/new" prefetch={true}>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Tambah Catatan Baru</span>
          </Button>
        </Link>
      </div>

      {/* Instant Interactive Client Container */}
      <NotesContainer
        initialNotes={initialNotes}
        initialTopics={initialTopics}
      />
    </div>
  );
}
