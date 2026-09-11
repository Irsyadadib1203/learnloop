'use client';

import React, { useState, useEffect } from 'react';
import { RoadmapPath, StageData } from '@/components/roadmap/RoadmapPath';
import { StageModal } from '@/components/roadmap/StageModal';
import { Button } from '@/components/ui/Button';
import { Map, Plus, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RoadmapPage() {
  const [stages, setStages] = useState<StageData[]>([]);
  const [stats, setStats] = useState({
    totalStages: 0,
    completedStages: 0,
    progressPercent: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (data.stages) {
        setStages(data.stages);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error fetching roadmap:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

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

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Tambah Tahap Baru</span>
        </Button>
      </div>

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

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-stone-400">
          <RotateCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm">Menyiapkan jalur roadmap...</p>
        </div>
      ) : stages.length === 0 ? (
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
}
