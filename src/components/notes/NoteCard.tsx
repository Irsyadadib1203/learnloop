'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, MasteryBadge } from '@/components/ui/Badge';
import { Calendar, Code2, Sparkles, Clock, Trash2, Edit3 } from 'lucide-react';

export interface NoteItem {
  id: string;
  title: string;
  topic: string;
  content: string;
  whyImportant: string | null;
  codeExample: string | null;
  masteryStatus: 'MASTER' | 'STILL_UNSURE';
  createdAt: string;
  updatedAt: string;
  reviewCard?: {
    id: string;
    intervalStage: number;
    nextReviewDate: string;
    lastReviewedAt: string | null;
    lastResult: 'FORGOT' | 'PARTIAL' | 'REMEMBERED' | null;
  } | null;
}

interface NoteCardProps {
  note: NoteItem;
  onDelete?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const isDueForReview = note.reviewCard
    ? new Date(note.reviewCard.nextReviewDate) <= new Date()
    : false;

  // Hitung hari tersisa sampai review berikutnya
  const getDaysUntilReview = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Hari ini';
    if (days === 1) return 'Besok';
    return `${days} hari lagi`;
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-700/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="topic">{note.topic}</Badge>
          <div className="flex items-center gap-1.5">
            <MasteryBadge status={note.masteryStatus} />
            {isDueForReview ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800">
                <Clock className="w-3 h-3 animate-pulse" /> Siap Review
              </span>
            ) : note.reviewCard ? (
              <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                Tahap {note.reviewCard.intervalStage} ({getDaysUntilReview(note.reviewCard.nextReviewDate)})
              </span>
            ) : null}
          </div>
        </div>

        {/* Title */}
        <Link href={`/notes/${note.id}`} className="block group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
            {note.title}
          </h3>
        </Link>

        {/* Why Important preview (PRD specific field) */}
        {note.whyImportant && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
            <span className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> Kenapa penting:
            </span>
            {note.whyImportant}
          </div>
        )}

        {/* Content excerpt if no whyImportant */}
        {!note.whyImportant && (
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
            {note.content.replace(/[#*`]/g, '')}
          </p>
        )}
      </div>

      {/* Footer info & quick actions */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(note.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          {note.codeExample && (
            <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400" title="Memiliki contoh kode">
              <Code2 className="w-3.5 h-3.5 text-orange-500" /> Ada Kode
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/notes/${note.id}`}
            title="Edit catatan"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(note.id)}
              title="Hapus catatan"
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
