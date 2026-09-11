import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StageStatus } from '@prisma/client';
import { awardUserXP, XP_REWARDS } from '@/lib/gamification';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stage = await prisma.roadmapStage.findUnique({
      where: { id },
      include: {
        notes: {
          include: {
            reviewCard: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: 'Tahap roadmap tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ stage });
  } catch (error) {
    console.error('Error fetching stage detail:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail tahap roadmap.' },
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
    const { title, description, order, status } = body;

    const currentStage = await prisma.roadmapStage.findUnique({
      where: { id },
    });

    if (!currentStage) {
      return NextResponse.json(
        { error: 'Tahap roadmap tidak ditemukan.' },
        { status: 404 }
      );
    }

    const wasNotDone = currentStage.status !== StageStatus.DONE;
    const isNowDone = status === StageStatus.DONE;

    const updatedStage = await prisma.roadmapStage.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : currentStage.title,
        description: description !== undefined ? description.trim() : currentStage.description,
        order: typeof order === 'number' ? order : currentStage.order,
        status: status ? (status as StageStatus) : currentStage.status,
      },
      include: {
        notes: true,
      },
    });

    // Jika tahap baru saja diselesaikan, berikan micro-reward +50 XP
    let xpAwarded = 0;
    let levelInfo = null;
    if (wasNotDone && isNowDone) {
      const award = await awardUserXP(XP_REWARDS.STAGE_DONE, 'roadmap_stage_completed', true);
      xpAwarded = XP_REWARDS.STAGE_DONE;
      levelInfo = award.levelInfo;
    }

    return NextResponse.json({
      success: true,
      stage: updatedStage,
      xpAwarded,
      levelInfo,
    });
  } catch (error) {
    console.error('Error updating roadmap stage:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui tahap roadmap.' },
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
    await prisma.roadmapStage.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Tahap roadmap berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting roadmap stage:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus tahap roadmap.' },
      { status: 500 }
    );
  }
}
