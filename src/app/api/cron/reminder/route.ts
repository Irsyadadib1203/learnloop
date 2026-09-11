import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Keamanan: Cek Authorization Header atau Query Secret
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('key');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret) {
      const token = authHeader?.replace('Bearer ', '');
      if (token !== expectedSecret && querySecret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized CRON request' }, { status: 401 });
      }
    }

    // 2. Ambil User dengan telegramChatId
    const user = await prisma.user.findFirst({
      where: { telegramChatId: { not: null } },
    });

    if (!user || !user.telegramChatId) {
      return NextResponse.json({
        message: 'Tidak ada user dengan Telegram Chat ID yang terdaftar.',
        sent: false,
      });
    }

    // 3. Ambil jumlah kartu yang perlu direview hari ini
    const now = new Date();
    const [dueCardsCount, stats] = await Promise.all([
      prisma.reviewCard.count({
        where: { nextReviewDate: { lte: now } },
      }),
      prisma.userStats.findUnique({ where: { id: 'singleton' } }),
    ]);

    // 4. Periksa apakah ada kartu jatuh tempo atau streak terancam putus
    if (dueCardsCount === 0) {
      return NextResponse.json({
        message: 'Tidak ada flashcard yang jatuh tempo hari ini.',
        sent: false,
      });
    }

    // Cek status streak hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = stats?.lastActivityDate ? new Date(stats.lastActivityDate) : null;
    const hasActivityToday = lastActivity && lastActivity >= today;

    // 5. Susun pesan pengingat yang ringkas dan ramah
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://learnloop.vercel.app';
    const reviewUrl = `${appUrl}/review`;

    let message = `🔄 <b>LearnLoop Daily Reminder</b>\n\n`;
    message += `Halo <b>${user.username}</b>! Ada <b>${dueCardsCount} flashcard</b> yang siap kamu review hari ini.\n\n`;
    message += `🔗 <a href="${reviewUrl}">Mulai Sesi Review Sekarang</a>\n`;

    if (!hasActivityToday && stats && stats.currentStreak > 0) {
      message += `\n⚠️ <i>Streak belajar kamu (${stats.currentStreak} hari) akan putus jika belum ada aktivitas belajar sebelum tengah malam!</i>`;
    }

    // 6. Kirim pesan Telegram
    const sendResult = await sendTelegramMessage(user.telegramChatId, message);

    return NextResponse.json({
      success: sendResult.success,
      dueCardsCount,
      telegramChatId: user.telegramChatId,
      error: sendResult.error,
    });
  } catch (error) {
    console.error('Error in /api/cron/reminder:', error);
    return NextResponse.json({ error: 'Gagal menjalankan cron reminder.' }, { status: 500 });
  }
}

// Support POST as well
export async function POST(request: Request) {
  return GET(request);
}
