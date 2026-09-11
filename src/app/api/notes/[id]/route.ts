import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MasteryStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        reviewCard: true,
        stage: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Catatan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error fetching single note:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail catatan.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, topic, content, whyImportant, codeExample, masteryStatus, stageId } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Judul dan isi catatan wajib diisi.' },
        { status: 400 }
      );
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: title.trim(),
        topic: topic?.trim() || 'General',
        content: content.trim(),
        whyImportant: whyImportant?.trim() || null,
        codeExample: codeExample?.trim() || null,
        masteryStatus: masteryStatus === 'MASTER' ? MasteryStatus.MASTER : MasteryStatus.STILL_UNSURE,
        stageId: stageId ? stageId.trim() : null,
      },
      include: {
        reviewCard: true,
        stage: true,
      },
    });

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui catatan.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Catatan berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus catatan.' },
      { status: 500 }
    );
  }
}
