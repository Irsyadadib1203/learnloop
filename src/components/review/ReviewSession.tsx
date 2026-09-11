'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FlashCard, ReviewCardItem } from './FlashCard';
import { ReviewSummaryModal } from './ReviewSummaryModal';
import { Button } from '@/components/ui/Button';
import { RotateCw, CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react';

interface ReviewSessionProps {
  initialCards?: ReviewCardItem[];
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({ initialCards }) => {
  const [cards, setCards] = useState<ReviewCardItem[]>(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialCards);

  // Statistik sesi berjalan
  const [rememberedCount, setRememberedCount] = useState(0);
  const [partialCount, setPartialCount] = useState(0);
  const [forgotCount, setForgotCount] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Ambil kartu review jika tidak disediakan via props
  useEffect(() => {
    if (!initialCards) {
      fetch('/api/review')
        .then((res) => res.json())
        .then((data) => {
          if (data.dueCards) {
            setCards(data.dueCards);
          }
        })
        .catch((err) => console.error('Error fetching cards:', err))
        .finally(() => setIsLoading(false));
    }
  }, [initialCards]);

  const currentCard = cards[currentIndex];

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleAnswer = useCallback(
    async (result: 'FORGOT' | 'PARTIAL' | 'REMEMBERED') => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId: currentCard.id,
            result,
          }),
        });

        const data = await res.json();
        const earned = typeof data.xpEarned === 'number'
          ? data.xpEarned
          : result === 'REMEMBERED'
          ? 10
          : result === 'FORGOT'
          ? 3
          : 5;

        // Update session counters
        setTotalXPEarned((prev) => prev + earned);
        if (result === 'REMEMBERED') setRememberedCount((c) => c + 1);
        else if (result === 'PARTIAL') setPartialCount((c) => c + 1);
        else if (result === 'FORGOT') setForgotCount((c) => c + 1);

        // Lanjut ke kartu berikutnya atau tampilkan modal selesai
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex((prev) => prev + 1);
          setIsRevealed(false);
        } else {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error('Error submitting review answer:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, currentIndex, cards.length, isSubmitting]
  );

  // Shortcut keyboard: [Spasi] untuk reveal, [1] Lupa, [2] Sebagian, [3] Ingat Jelas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika fokus di input / textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space' && !isRevealed) {
        e.preventDefault();
        handleReveal();
      } else if (isRevealed && !isSubmitting) {
        if (e.key === '1') {
          handleAnswer('FORGOT');
        } else if (e.key === '2') {
          handleAnswer('PARTIAL');
        } else if (e.key === '3') {
          handleAnswer('REMEMBERED');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, isSubmitting, handleReveal, handleAnswer]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <RotateCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm text-stone-500">Menyiapkan kartu review hari ini...</p>
      </div>
    );
  }

  // Jika tidak ada kartu yang perlu direview
  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 text-center shadow-xs">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Semua Materi Sudah Bersih!
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 mb-6">
          Tidak ada kartu yang jatuh tempo review untuk hari ini. Jadwal review berikutnya akan muncul otomatis besok pagi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Kembali ke Dashboard</span>
            </Button>
          </Link>
          <Link href="/notes">
            <Button variant="primary" className="w-full sm:w-auto">
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span>Lihat Semua Catatan</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex) / cards.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header & Progress Bar */}
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Keluar Sesi
        </Link>

        {/* Progress Text */}
        <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
          Kartu {currentIndex + 1} dari {cards.length}
        </div>
      </div>

      {/* Visual Progress Line */}
      <div className="max-w-2xl mx-auto h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Active Flashcard */}
      {currentCard && (
        <FlashCard
          card={currentCard}
          isRevealed={isRevealed}
          onReveal={handleReveal}
          onAnswer={handleAnswer}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal Selesai */}
      {isCompleted && (
        <ReviewSummaryModal
          reviewedCount={cards.length}
          rememberedCount={rememberedCount}
          partialCount={partialCount}
          forgotCount={forgotCount}
          totalXPEarned={totalXPEarned}
          onClose={() => setIsCompleted(false)}
        />
      )}
    </div>
  );
};
