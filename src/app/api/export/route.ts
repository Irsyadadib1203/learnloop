import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // Server-level session validation
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const [notes, roadmapStages, journalEntries, userStats, xpLogs] = await Promise.all([
      prisma.note.findMany({ include: { reviewCard: true, stage: true } }),
      prisma.roadmapStage.findMany({ orderBy: { order: 'asc' } }),
      prisma.journalEntry.findMany({ orderBy: { date: 'desc' } }),
      prisma.userStats.findUnique({ where: { id: 'singleton' } }),
      prisma.xpLog.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user.username,
      userStats,
      notes,
      roadmapStages,
      journalEntries,
      xpLogs,
    };

    const json = JSON.stringify(exportData, null, 2);

    return new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="learnloop-export.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Gagal mengekspor data.' }, { status: 500 });
  }
}
