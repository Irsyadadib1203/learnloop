import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Cek apakah akun sedang terkunci
    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      const remainingMs = user.lockedUntil.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        { error: `Akun terkunci sementara karena terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingMinutes} menit.` },
        { status: 429 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const newFailCount = (user.failedLoginAttempts ?? 0) + 1;
      const lockData =
        newFailCount >= 5
          ? { lockedUntil: new Date(now.getTime() + 15 * 60 * 1000) }
          : {};
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newFailCount, ...lockData },
      });
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Reset counter setelah login berhasil
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const token = await signSessionToken({
      userId: user.id,
      username: user.username,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
    });

    // Set cookie httpOnly dengan durasi 30 hari
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
