import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MasteryStatus } from '@prisma/client';
import { awardUserXP, XP_REWARDS } from '@/lib/gamification';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const topic = searchParams.get('topic')?.trim() || '';
    const masteryStatus = searchParams.get('masteryStatus')?.trim() || '';
    const stageId = searchParams.get('stageId')?.trim() || '';

    // Build filter condition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { whyImportant: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (topic && topic !== 'All') {
      where.topic = { equals: topic, mode: 'insensitive' };
    }

    if (masteryStatus && masteryStatus !== 'ALL') {
      where.masteryStatus = masteryStatus as MasteryStatus;
    }

    if (stageId) {
      where.stageId = stageId;
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        reviewCard: true,
        stage: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ambil daftar unik semua topik untuk filter buttons
    const allTopics = await prisma.note.findMany({
      select: { topic: true },
      distinct: ['topic'],
    });

    const topics = allTopics.map((t) => t.topic);

    return NextResponse.json({ notes, topics });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Gagal memuat catatan.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, topic, content, whyImportant, codeExample, masteryStatus, stageId } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Judul dan isi catatan wajib diisi.' },
        { status: 400 }
      );
    }

    const selectedTopic = topic?.trim() || 'General';
    const status = masteryStatus === 'MASTER' ? MasteryStatus.MASTER : MasteryStatus.STILL_UNSURE;

    // Review card pertama kali diset untuk besok pagi (jam 04:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(4, 0, 0, 0);

    const newNote = await prisma.note.create({
      data: {
        title: title.trim(),
        topic: selectedTopic,
        content: content.trim(),
        whyImportant: whyImportant?.trim() || null,
        codeExample: codeExample?.trim() || null,
        masteryStatus: status,
        stageId: stageId?.trim() || null,
        reviewCard: {
          create: {
            intervalStage: 0,
            nextReviewDate: tomorrow,
          },
        },
      },
      include: {
        reviewCard: true,
        stage: true,
      },
    });

    // Berikan reward XP (+10 XP) dan perbarui streak via gamification.ts
    const awardResult = await awardUserXP(XP_REWARDS.NEW_NOTE, 'note_created', true);

    return NextResponse.json({
      success: true,
      note: newNote,
      xpEarned: XP_REWARDS.NEW_NOTE,
      totalXP: awardResult.stats.totalXP,
      levelInfo: awardResult.levelInfo,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Gagal membuat catatan baru.' },
      { status: 500 }
    );
  }
}
