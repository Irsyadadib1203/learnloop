import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getCurrentUser,
  verifyPassword,
  hashPassword,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 1. Validate session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password baru minimal 8 karakter.' },
        { status: 400 }
      );
    }

    // 2. Fetch current user with passwordHash
    const dbUser = await prisma.user.findUnique({ where: { username: user.username } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // 3. Verify old password
    const isValid = await verifyPassword(oldPassword, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Password lama tidak sesuai.' }, { status: 400 });
    }

    // 4. Hash new password and update
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { username: user.username },
      data: { passwordHash: newHash },
    });

    // 5. Invalidate session cookie — set to expired
    const response = NextResponse.json({ success: true, redirect: '/login' });
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Gagal mengganti password.' }, { status: 500 });
  }
}
