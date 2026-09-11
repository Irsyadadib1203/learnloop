'use client';

import React from 'react';
import { Trash2, BookOpen, Smile } from 'lucide-react';

const MOOD_EMOJI: Record<string, string> = {
  happy: '😄',
  excited: '🤩',
  calm: '😌',
  focused: '🧠',
  tired: '😴',
  stressed: '😰',
  sad: '😢',
};

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  challenges?: string | null;
  mood: string;
  createdAt: string;
}

interface JournalCardProps {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onDelete }) => {
  const date = new Date(entry.date);
  const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const emoji = MOOD_EMOJI[entry.mood] ?? '😌';

  const handleDelete = async () => {
    if (!confirm('Hapus entry jurnal ini?')) return;
    try {
      const res = await fetch(`/api/journal/${entry.id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(entry.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative flex gap-4 group">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-xl flex-shrink-0 mt-1 shadow-sm">
          {emoji}
        </div>
        <div className="w-px flex-1 bg-stone-200 dark:bg-stone-700 mt-2 mb-0" />
      </div>

      {/* Card body */}
      <div className="flex-1 pb-8">
        <div className="mb-2">
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium uppercase tracking-wide">
            {dayName}
          </p>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{dateStr}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm transition-shadow hover:shadow-md">
          {/* Content */}
          <div className="flex items-start gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </div>
          </div>

          {/* Challenges */}
          {entry.challenges && (
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wide">
                Tantangan
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                {entry.challenges}
              </p>
            </div>
          )}

          {/* Mood badge */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
              <Smile className="w-3.5 h-3.5" />
              <span className="capitalize">{entry.mood}</span>
            </div>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Hapus entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
