import React from 'react';
import Link from 'next/link';
import { NoteForm } from '@/components/notes/NoteForm';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ stageId?: string }>;
}) {
  const { stageId } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button & Page Title */}
      <div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Catatan
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              <span>Tulis Catatan Baru</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Catatan ini akan otomatis dijadwalkan menjadi kartu flashcard pengulangan berkala.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <NoteForm defaultStageId={stageId} />
      </div>
    </div>
  );
}
