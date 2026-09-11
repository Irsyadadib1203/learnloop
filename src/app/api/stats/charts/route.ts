import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats/charts
// Returns:
//   weeklyXP: [{date: '10 Sep', xp: 25}, ...] – last 7 days from XpLog
//   topicDistribution: [{topic: 'Next.js', count: 5}, ...] – note count by topic
export async function GET() {
  try {
    // --- Weekly XP from XpLog (last 7 days) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch both in parallel
    const [xpLogs, notes] = await Promise.all([
      prisma.xpLog.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.note.findMany({ select: { topic: true } }),
    ]);

    // Build a map of date-string → total XP for last 7 days
    const dateMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dateMap[key] = 0;
    }

    for (const log of xpLogs) {
      const key = new Date(log.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
      if (key in dateMap) {
        dateMap[key] += log.amount;
      }
    }

    const weeklyXP = Object.entries(dateMap).map(([date, xp]) => ({ date, xp }));

    // --- Topic Distribution from Note table ---
    const topicCount: Record<string, number> = {};
    for (const note of notes) {
      topicCount[note.topic] = (topicCount[note.topic] ?? 0) + 1;
    }
    const topicDistribution = Object.entries(topicCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ weeklyXP, topicDistribution });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data chart.' },
      { status: 500 }
    );
  }
}
