'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge, MasteryBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Code2, 
  Eye, 
  RotateCcw, 
  Check, 
  Smile, 
  Frown 
} from 'lucide-react';

export interface ReviewCardItem {
  id: string;
  intervalStage: number;
  nextReviewDate: string;
  note: {
    id: string;
    title: string;
    topic: string;
    content: string;
    whyImportant: string | null;
    codeExample: string | null;
    masteryStatus: 'MASTER' | 'STILL_UNSURE';
  };
}

interface FlashCardProps {
  card: ReviewCardItem;
  isRevealed: boolean;
  onReveal: () => void;
  onAnswer: (result: 'FORGOT' | 'PARTIAL' | 'REMEMBERED') => void;
  isSubmitting?: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  isRevealed,
  onReveal,
  onAnswer,
  isSubmitting = false,
}) => {
  const { note } = card;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md transition-all duration-300">
      {/* Top Card Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Badge variant="topic">{note.topic}</Badge>
          <MasteryBadge status={note.masteryStatus} />
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
          Leitner Tahap {card.intervalStage}
        </span>
      </div>

      {/* Front Face: Title & Question Prompt */}
      <div className="py-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
          {note.title}
        </h2>

        {!isRevealed && (
          <div className="mt-8 p-6 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium mb-5">
              Coba ingat kembali: apa konsep intinya, kenapa ini penting, dan bagaimana contoh kodenya?
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onReveal}
              className="w-full sm:w-auto px-8"
            >
              <Eye className="w-5 h-5 mr-2" />
              <span>Tampilkan Jawaban</span>
            </Button>
            <div className="text-[11px] text-stone-400 mt-2 font-mono">
              Tips: Tekan tombol [Spasi] pada keyboard
            </div>
          </div>
        )}
      </div>

      {/* Back Face: Answer Revealed */}
      {isRevealed && (
        <div className="space-y-6 pt-2 animate-fadeIn">
          {/* Main Markdown Content */}
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          </div>

          {/* Why Important */}
          {note.whyImportant && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Kenapa Ini Penting:
              </div>
              <p className="leading-relaxed">{note.whyImportant}</p>
            </div>
          )}

          {/* Code Example */}
          {note.codeExample && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <Code2 className="w-4 h-4 text-orange-500" />
                Contoh Kode:
              </div>
              <pre className="p-4 rounded-2xl bg-stone-900 text-stone-100 text-xs font-mono overflow-x-auto border border-stone-800 leading-relaxed">
                <code>{note.codeExample}</code>
              </pre>
            </div>
          )}

          {/* Feedback Grading Actions */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800">
            <p className="text-xs font-semibold text-center text-stone-500 dark:text-stone-400 mb-3">
              Seberapa baik Anda mengingat materi ini?
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Lupa */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onAnswer('FORGOT')}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 transition-all active:scale-95 disabled:opacity-50"
              >
                <Frown className="w-5 h-5 mb-1 text-rose-500" />
                <span className="font-bold text-xs sm:text-sm">Lupa (+3 XP)</span>
                <span className="text-[10px] text-rose-500 font-mono mt-0.5">Ulang besok [1]</span>
              </button>

              {/* Ingat Sebagian */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onAnswer('PARTIAL')}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 transition-all active:scale-95 disabled:opacity-50"
              >
                <Smile className="w-5 h-5 mb-1 text-amber-500" />
                <span className="font-bold text-xs sm:text-sm">Sebagian (+5 XP)</span>
                <span className="text-[10px] text-amber-600 font-mono mt-0.5">Tahap tetap [2]</span>
              </button>

              {/* Ingat Jelas */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onAnswer('REMEMBERED')}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 transition-all active:scale-95 disabled:opacity-50"
              >
                <Check className="w-5 h-5 mb-1 text-emerald-500" />
                <span className="font-bold text-xs sm:text-sm">Ingat Jelas (+10 XP)</span>
                <span className="text-[10px] text-emerald-600 font-mono mt-0.5">Naik tahap [3]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
