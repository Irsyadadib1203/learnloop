import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReviewResult } from '@prisma/client';
import { calculateNextReview } from '@/lib/spacedRepetition';
import { awardUserXP, XP_REWARDS } from '@/lib/gamification';

export async function GET() {
  try {
    const now = new Date();
    // Cari kartu yang waktu review-nya sudah tiba (<= sekarang)
    const dueCards = await prisma.reviewCard.findMany({
      where: {
        nextReviewDate: {
          lte: now,
        },
      },
      include: {
        note: {
          include: {
            stage: true,
          },
        },
      },
      orderBy: {
        nextReviewDate: 'asc',
      },
    });

    // Cari topik yang tidak di-review lebih dari 7 hari
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleCards = await prisma.reviewCard.findMany({
      where: {
        OR: [
          { lastReviewedAt: { lte: sevenDaysAgo } },
          { lastReviewedAt: null, createdAt: { lte: sevenDaysAgo } },
        ],
      },
      include: {
        note: {
          select: { topic: true },
        },
      },
    });

    const staleTopics = Array.from(new Set(staleCards.map((c) => c.note.topic)));

    return NextResponse.json({
      dueCards,
      totalDue: dueCards.length,
      staleTopicsCount: staleTopics.length,
      staleTopics,
    });
  } catch (error) {
    console.error('Error fetching review cards:', error);
    return NextResponse.json(
      { error: 'Gagal memuat kartu review.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, result } = body;

    if (!cardId || !result || !['FORGOT', 'PARTIAL', 'REMEMBERED'].includes(result)) {
      return NextResponse.json(
        { error: 'Parameter cardId dan result tidak valid.' },
        { status: 400 }
      );
    }

    const currentCard = await prisma.reviewCard.findUnique({
      where: { id: cardId },
    });

    if (!currentCard) {
      return NextResponse.json(
        { error: 'Kartu review tidak ditemukan.' },
        { status: 404 }
      );
    }

    // 1. Hitung jadwal review berikutnya murni menggunakan Leitner Box
    const calculation = calculateNextReview(
      currentCard.intervalStage,
      result as ReviewResult
    );

    const updatedCard = await prisma.reviewCard.update({
      where: { id: cardId },
      data: {
        intervalStage: calculation.nextIntervalStage,
        nextReviewDate: calculation.nextReviewDate,
        lastReviewedAt: new Date(),
        lastResult: result as ReviewResult,
      },
      include: {
        note: true,
      },
    });

    // 2. Berikan XP berjenjang: Lupa (+3), Sebagian (+5), Ingat Jelas (+10) via gamification.ts
    let xpAmount: number = XP_REWARDS.REVIEW_PARTIAL;
    let source: string = 'review_partial';
    if (result === 'FORGOT') {
      xpAmount = XP_REWARDS.REVIEW_FORGOT;
      source = 'review_forgot';
    } else if (result === 'REMEMBERED') {
      xpAmount = XP_REWARDS.REVIEW_REMEMBERED;
      source = 'review_remembered';
    }

    const awardResult = await awardUserXP(xpAmount, source, true);

    return NextResponse.json({
      success: true,
      card: updatedCard,
      xpEarned: xpAmount,
      totalXP: awardResult.stats.totalXP,
      currentStreak: awardResult.stats.currentStreak,
      levelInfo: awardResult.levelInfo,
      nextStage: calculation.nextIntervalStage,
      nextReviewDate: calculation.nextReviewDate,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui hasil review.' },
      { status: 500 }
    );
  }
}
