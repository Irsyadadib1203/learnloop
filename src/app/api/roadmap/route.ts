import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StageStatus } from '@prisma/client';

export async function GET() {
  try {
    const stages = await prisma.roadmapStage.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    const totalStages = stages.length;
    const completedStages = stages.filter((s) => s.status === 'DONE').length;
    const inProgressStage = stages.find((s) => s.status === 'IN_PROGRESS') || null;

    return NextResponse.json({
      stages,
      stats: {
        totalStages,
        completedStages,
        inProgressStage,
        progressPercent: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching roadmap stages:', error);
    return NextResponse.json(
      { error: 'Gagal memuat roadmap stages.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, order, status } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Judul dan deskripsi tahap wajib diisi.' },
        { status: 400 }
      );
    }

    // Tentukan urutan otomatis jika tidak diisi
    let stageOrder = typeof order === 'number' ? order : 0;
    if (order === undefined || order === null) {
      const highestOrder = await prisma.roadmapStage.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      stageOrder = highestOrder ? highestOrder.order + 1 : 0;
    }

    const stageStatus =
      status === 'DONE'
        ? StageStatus.DONE
        : status === 'IN_PROGRESS'
        ? StageStatus.IN_PROGRESS
        : StageStatus.NOT_STARTED;

    const newStage = await prisma.roadmapStage.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        order: stageOrder,
        status: stageStatus,
      },
    });

    return NextResponse.json({ success: true, stage: newStage }, { status: 201 });
  } catch (error) {
    console.error('Error creating roadmap stage:', error);
    return NextResponse.json(
      { error: 'Gagal membuat tahap roadmap baru.' },
      { status: 500 }
    );
  }
}
