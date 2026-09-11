'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface AiReviewSectionProps {
  noteId: string;
  initialFeedback?: string | null;
  initialReviewedAt?: string | null;
}

export const AiReviewSection: React.FC<AiReviewSectionProps> = ({
  noteId,
  initialFeedback,
  initialReviewedAt,
}) => {
  const [feedback, setFeedback] = useState<string | null>(initialFeedback || null);
  const [reviewedAt, setReviewedAt] = useState<string | null>(initialReviewedAt || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunAiReview = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/notes/${noteId}/review-ai`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memproses review AI.');
        return;
      }

      setFeedback(data.aiReviewFeedback);
      setReviewedAt(data.aiReviewedAt);
    } catch {
      setError('Terjadi kendala koneksi jaringan.');
    } finally {
      setLoading(false);
    }
  };

  // Status parser
  const isAccurate =
    feedback?.includes('[STATUS: SUDAH TEPAT]') ||
    feedback?.toLowerCase().includes('sudah tepat');
  const needsImprovement =
    feedback?.includes('[STATUS: PERLU DIPERBAIKI]') ||
    feedback?.toLowerCase().includes('perlu diperbaiki');

  // Bersihkan tag status dari teks display jika ada
  const cleanFeedback = feedback
    ? feedback
        .replace(/\[STATUS:\s*SUDAH TEPAT\]/gi, '')
        .replace(/\[STATUS:\s*PERLU DIPERBAIKI\]/gi, '')
        .trim()
    : null;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Evaluasi Pemahaman Teknis (AI Gemini)
            </h3>
            <p className="text-xs text-stone-400">
              Review akurasi konsep & deteksi miskonsepsi secara on-demand
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAiReview}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{feedback ? 'Review Ulang AI' : 'Cek Pemahaman dengan AI'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {cleanFeedback ? (
        <div className="space-y-3 pt-1">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isAccurate ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sudah Tepat & Akurat
              </span>
            ) : needsImprovement ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                Perlu Diperbaiki / Ada Koreksi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300">
                Hasil Review
              </span>
            )}

            {reviewedAt && (
              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(reviewedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Feedback content */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700 text-xs leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
            {cleanFeedback}
          </div>
        </div>
      ) : !error && !loading ? (
        <p className="text-xs text-stone-400 dark:text-stone-500 py-1">
          Klik tombol di atas untuk meminta AI mengecek apakah penjelasan konsep dan contoh kode dalam catatan ini sudah akurat.
        </p>
      ) : null}
    </div>
  );
};
