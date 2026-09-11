'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapPath, StageData } from '@/components/roadmap/RoadmapPath';
import { StageModal } from '@/components/roadmap/StageModal';
import { Button } from '@/components/ui/Button';
import { Map, Plus, Sparkles } from 'lucide-react';

interface RoadmapContainerProps {
  initialStages: StageData[];
  initialStats: {
    totalStages: number;
    completedStages: number;
    progressPercent: number;
  };
}

export const RoadmapContainer: React.FC<RoadmapContainerProps> = ({
  initialStages,
  initialStats,
}) => {
  const router = useRouter();
  const [stages, setStages] = useState<StageData[]>(initialStages);
  const [stats, setStats] = useState(initialStats);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (data.stages) setStages(data.stages);
      if (data.stats) setStats(data.stats);
      router.refresh();
    } catch (e) {
      console.error('Error refreshing roadmap:', e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Overview Banner */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Progres Perjalanan
            </div>
            <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
              {stats.completedStages} dari {stats.totalStages} Tahap Selesai
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full sm:max-w-xs space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-stone-500">Penyelesaian</span>
            <span className="text-indigo-600 dark:text-indigo-400">{stats.progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 text-center bg-white/40 dark:bg-stone-900/40">
          <Map className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Belum ada tahap roadmap
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-5">
            Mulai rancang rencana belajar teknis Anda sekarang.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Buat Tahap Pertama</span>
          </Button>
        </div>
      ) : (
        /* Visual Game-like Roadmap Path */
        <div className="pt-2">
          <RoadmapPath stages={stages} />
        </div>
      )}

      {/* Create Modal */}
      <StageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRoadmap}
      />
    </div>
  );
};
