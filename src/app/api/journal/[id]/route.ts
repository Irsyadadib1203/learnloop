import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Entry tidak ditemukan.' }, { status: 404 });
    }

    await prisma.journalEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus entry jurnal.' },
      { status: 500 }
    );
  }
}
