import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { JournalCard } from '@/components/journal/JournalCard';
import { Plus, BookMarked, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: {
      date: 'desc',
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <BookMarked className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Jurnal Refleksi Harian
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Catat pemahamanmu hari ini, kendala teknis, dan refleksikan proses belajarmu (+10 XP per entri).
          </p>
        </div>

        <Link
          href="/journal/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Jurnal</span>
        </Link>
      </div>

      {/* Entries List or Empty State */}
      {entries.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-500">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-1">
            Belum ada catatan jurnal
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
            Mencatat apa yang baru saja kamu pelajari memperkuat koneksi memori dan pemahaman konsep secara mendalam.
          </p>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tulis Jurnal Pertamamu
          </Link>
        </div>
      ) : (
        <div className="relative pl-2 sm:pl-4">
          {entries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={{
                ...entry,
                date: entry.date.toISOString(),
                createdAt: entry.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
