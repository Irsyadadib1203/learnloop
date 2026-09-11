'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReviewSummaryModalProps {
  reviewedCount: number;
  rememberedCount: number;
  partialCount: number;
  forgotCount: number;
  totalXPEarned: number;
  onClose: () => void;
}

export const ReviewSummaryModal: React.FC<ReviewSummaryModalProps> = ({
  reviewedCount,
  rememberedCount,
  partialCount,
  forgotCount,
  totalXPEarned,
}) => {
  useEffect(() => {
    // Luncurkan efek confetti micro-reward
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Trophy icon reward */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-5 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Sesi Review Selesai! 🎉
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 mb-6">
          Hebat! Kamu baru saja memperkuat jalur ingatan otak untuk materi yang dipelajari.
        </p>

        {/* Reward XP Banner */}
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/40 flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300 font-bold text-lg mb-6">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span>+{totalXPEarned} XP Diperoleh!</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">
              {rememberedCount}
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-medium">Ingat Jelas</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-amber-700 dark:text-amber-300 font-bold text-lg">
              {partialCount}
            </div>
            <div className="text-amber-600 dark:text-amber-400 font-medium">Sebagian</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
            <div className="text-rose-700 dark:text-rose-300 font-bold text-lg">
              {forgotCount}
            </div>
            <div className="text-rose-600 dark:text-rose-400 font-medium">Lupa</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full">
              <span>Kembali ke Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/notes">
            <Button variant="outline" size="md" className="w-full">
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span>Buka Semua Catatan</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
