import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { awardUserXP, XP_REWARDS } from '@/lib/gamification';

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Gagal memuat catatan jurnal.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, challenges, mood, date } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Isi jurnal belajar wajib diisi.' },
        { status: 400 }
      );
    }

    const entryDate = date ? new Date(date) : new Date();
    const entryMood = mood?.trim() || 'calm';

    const newEntry = await prisma.journalEntry.create({
      data: {
        date: entryDate,
        content: content.trim(),
        challenges: challenges?.trim() || null,
        mood: entryMood,
      },
    });

    // Juga catat ke tabel MoodLog jika tanggalnya hari ini
    await prisma.moodLog.create({
      data: {
        mood: entryMood,
        createdAt: entryDate,
      },
    });

    // Berikan reward +10 XP dan catat ke XpLog dengan source 'journal_entry'
    const awardResult = await awardUserXP(XP_REWARDS.JOURNAL_ENTRY, 'journal_entry', true);

    return NextResponse.json(
      {
        success: true,
        entry: newEntry,
        xpEarned: XP_REWARDS.JOURNAL_ENTRY,
        totalXP: awardResult.stats.totalXP,
        levelInfo: awardResult.levelInfo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan entry jurnal.' },
      { status: 500 }
    );
  }
}
