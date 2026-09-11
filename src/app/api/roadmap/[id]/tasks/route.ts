import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: stageId } = await params;
    const body = await request.json();
    const { title, resourceUrl } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Judul task wajib diisi.' }, { status: 400 });
    }

    const stage = await prisma.roadmapStage.findUnique({ where: { id: stageId } });
    if (!stage) {
      return NextResponse.json({ error: 'Stage tidak ditemukan.' }, { status: 404 });
    }

    const lastTask = await prisma.roadmapTask.findFirst({
      where: { stageId },
      orderBy: { order: 'desc' },
    });

    const newTask = await prisma.roadmapTask.create({
      data: {
        stageId,
        title: title.trim(),
        resourceUrl: resourceUrl?.trim() || null,
        order: (lastTask?.order ?? -1) + 1,
        isDone: false,
      },
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error('Error creating roadmap task:', error);
    return NextResponse.json({ error: 'Gagal membuat task.' }, { status: 500 });
  }
}
