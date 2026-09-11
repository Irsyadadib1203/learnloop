import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: { telegramChatId: true },
    });

    return NextResponse.json({ telegramChatId: dbUser?.telegramChatId || null });
  } catch (error) {
    console.error('Error fetching telegramChatId:', error);
    return NextResponse.json({ error: 'Gagal memuat Chat ID.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const { telegramChatId, test } = await request.json();

    if (test && telegramChatId) {
      const sendResult = await sendTelegramMessage(
        telegramChatId.trim(),
        `🚀 <b>LearnLoop Telegram Connected!</b>\n\nHalo <b>${user.username}</b>, akun Telegram Anda berhasil terhubung dengan LearnLoop. Anda akan menerima notifikasi pengingat review kartu harian di sini.`
      );

      if (!sendResult.success) {
        return NextResponse.json(
          { error: sendResult.error || 'Gagal mengirim pesan tes. Pastikan Bot sudah di-start di Telegram Anda.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: 'Pesan tes berhasil terkirim!' });
    }

    // Update chatId
    const updated = await prisma.user.update({
      where: { username: user.username },
      data: {
        telegramChatId: telegramChatId?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      telegramChatId: updated.telegramChatId,
    });
  } catch (error) {
    console.error('Error updating telegramChatId:', error);
    return NextResponse.json({ error: 'Gagal menyimpan Telegram Chat ID.' }, { status: 500 });
  }
}
