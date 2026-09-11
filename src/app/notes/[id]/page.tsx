import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NoteForm } from '@/components/notes/NoteForm';
import { AiReviewSection } from '@/components/notes/AiReviewSection';
import { ArrowLeft, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { LEITNER_INTERVAL_DAYS } from '@/lib/spacedRepetition';

export const dynamic = 'force-dynamic';

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      reviewCard: true,
    },
  });

  if (!note) {
    notFound();
  }

  const stage = note.reviewCard?.intervalStage ?? 0;
  const intervalDays = LEITNER_INTERVAL_DAYS[stage] ?? 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Catatan
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Edit & Tinjau Catatan
        </h1>
      </div>

      {/* Review Card Status Banner */}
      {note.reviewCard && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              {stage}
            </div>
            <div>
              <div className="font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                Status Spaced Repetition (Leitner Tahap {stage})
              </div>
              <div className="text-orange-700 dark:text-orange-400 mt-0.5">
                Interval saat ini: diulang tiap {intervalDays} hari
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Review Berikutnya:{' '}
              <strong className="text-stone-900 dark:text-stone-100">
                {new Date(note.reviewCard.nextReviewDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
            </span>
            {note.reviewCard.lastReviewedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Terakhir Di-review:{' '}
                {new Date(note.reviewCard.lastReviewedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* AI Review Section */}
      <AiReviewSection
        noteId={note.id}
        initialFeedback={note.aiReviewFeedback}
        initialReviewedAt={note.aiReviewedAt ? note.aiReviewedAt.toISOString() : null}
      />

      {/* Form Container */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <NoteForm
          isEdit={true}
          initialData={{
            id: note.id,
            title: note.title,
            topic: note.topic,
            content: note.content,
            whyImportant: note.whyImportant,
            codeExample: note.codeExample,
            masteryStatus: note.masteryStatus,
          }}
        />
      </div>
    </div>
  );
}
