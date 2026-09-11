import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StageStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isDone } = body;

    if (typeof isDone !== 'boolean') {
      return NextResponse.json({ error: 'Nilai isDone wajib boolean.' }, { status: 400 });
    }

    const task = await prisma.roadmapTask.update({
      where: { id },
      data: { isDone },
    });

    // Cek seluruh tasks di stage ini
    const allTasks = await prisma.roadmapTask.findMany({
      where: { stageId: task.stageId },
    });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.isDone).length;
    const allDone = totalTasks > 0 && completedTasks === totalTasks;

    // Jika semua task dicentang selesai, auto update status stage menjadi DONE
    let stageStatusUpdate = undefined;
    if (allDone) {
      stageStatusUpdate = await prisma.roadmapStage.update({
        where: { id: task.stageId },
        data: { status: StageStatus.DONE },
      });
    } else if (completedTasks > 0) {
      // Jika ada yang selesai tapi belum semua, pastikan minimal IN_PROGRESS
      const currentStage = await prisma.roadmapStage.findUnique({
        where: { id: task.stageId },
      });
      if (currentStage?.status === StageStatus.NOT_STARTED) {
        stageStatusUpdate = await prisma.roadmapStage.update({
          where: { id: task.stageId },
          data: { status: StageStatus.IN_PROGRESS },
        });
      }
    }

    return NextResponse.json({
      success: true,
      task,
      stageStatus: stageStatusUpdate?.status,
      completedTasks,
      totalTasks,
    });
  } catch (error) {
    console.error('Error updating roadmap task:', error);
    return NextResponse.json({ error: 'Gagal memperbarui task.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.roadmapTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting roadmap task:', error);
    return NextResponse.json({ error: 'Gagal menghapus task.' }, { status: 500 });
  }
}
