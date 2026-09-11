import React from 'react';
import { prisma } from '@/lib/prisma';
import { RoadmapContainer } from '@/components/roadmap/RoadmapContainer';
import { Map } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RoadmapPage() {
  const stages = await prisma.roadmapStage.findMany({
    orderBy: { order: 'asc' },
    include: {
      notes: {
        select: {
          id: true,
          title: true,
          topic: true,
          masteryStatus: true,
        },
      },
    },
  });

  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.status === 'DONE').length;
  const progressPercent =
    totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const formattedStages = stages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    description: stage.description,
    order: stage.order,
    status: stage.status,
    notesCount: stage.notes.length,
  }));

  const initialStats = {
    totalStages,
    completedStages,
    progressPercent,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-2">
            <Map className="w-3.5 h-3.5" />
            Skill Tree & Path
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Roadmap Belajar Full Stack
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
            Selesaikan setiap tahap belajar langkah demi langkah. Setiap tahap selesai memberi penghargaan +50 XP!
          </p>
        </div>
      </div>

      {/* Instant Interactive Container */}
      <RoadmapContainer
        initialStages={formattedStages}
        initialStats={initialStats}
      />
    </div>
  );
}
