import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MasteryStatus } from '@prisma/client';
import { calculateLevelInfo } from '@/lib/gamification';

export async function GET() {
  try {
    let stats = await prisma.userStats.findUnique({
      where: { id: 'singleton' },
    });

    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
          id: 'singleton',
          totalXP: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    // Hitung level & gelar gamifikasi terpusat
    const levelInfo = calculateLevelInfo(stats.totalXP);

    // Hitung total catatan & breakdown mastery
    const totalNotes = await prisma.note.count();
    const masterCount = await prisma.note.count({
      where: { masteryStatus: MasteryStatus.MASTER },
    });
    const unsureCount = await prisma.note.count({
      where: { masteryStatus: MasteryStatus.STILL_UNSURE },
    });

    // Ambil mood terbaru hari ini jika ada
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMood = await prisma.moodLog.findFirst({
      where: {
        createdAt: { gte: today },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      stats: {
        ...stats,
        ...levelInfo,
      },
      notesSummary: {
        total: totalNotes,
        master: masterCount,
        unsure: unsureCount,
      },
      todayMood: todayMood?.mood || null,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Gagal memuat statistik.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mood } = body;

    if (!mood) {
      return NextResponse.json(
        { error: 'Data mood wajib diisi.' },
        { status: 400 }
      );
    }

    const createdMood = await prisma.moodLog.create({
      data: { mood },
    });

    return NextResponse.json({ success: true, mood: createdMood.mood });
  } catch (error) {
    console.error('Error logging mood:', error);
    return NextResponse.json(
      { error: 'Gagal mencatat mood.' },
      { status: 500 }
    );
  }
}
