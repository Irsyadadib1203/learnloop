'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  Lock, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface StageData {
  id: string;
  title: string;
  description: string;
  order: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
  _count?: {
    notes: number;
  };
}

interface RoadmapPathProps {
  stages: StageData[];
}

export const RoadmapPath: React.FC<RoadmapPathProps> = ({ stages }) => {
  if (stages.length === 0) {
    return null;
  }

  // Helper untuk status visual
  const getStageMeta = (status: StageData['status']) => {
    switch (status) {
      case 'DONE':
        return {
          icon: Trophy,
          bg: 'bg-emerald-500 text-white shadow-emerald-500/30',
          ring: 'ring-4 ring-emerald-100 dark:ring-emerald-950/60 border-emerald-400',
          badgeVariant: 'master' as const,
          label: 'Selesai',
          connectorColor: 'bg-emerald-500',
        };
      case 'IN_PROGRESS':
        return {
          icon: Flame,
          bg: 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-orange-500/35',
          ring: 'ring-4 ring-orange-200 dark:ring-orange-950/80 animate-pulse border-orange-500',
          badgeVariant: 'topic' as const,
          label: 'Sedang Berjalan',
          connectorColor: 'bg-stone-300 dark:bg-stone-700',
        };
      case 'NOT_STARTED':
      default:
        return {
          icon: Lock,
          bg: 'bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700',
          ring: 'border-stone-300 dark:border-stone-800',
          badgeVariant: 'default' as const,
          label: 'Belum Mulai',
          connectorColor: 'bg-stone-200 dark:bg-stone-800',
        };
    }
  };

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 1. MOBILE LAYOUT (< 768px): JALUR VERTIKAL LURUS KE BAWAH     */}
      {/* ============================================================ */}
      <div className="block md:hidden relative pl-6 space-y-8">
        {/* Garis Vertikal Spine Tulang Punggung */}
        <div className="absolute left-[29px] top-6 bottom-6 w-1 bg-stone-200 dark:bg-stone-800 -translate-x-1/2 rounded-full" />

        {stages.map((stage, idx) => {
          const meta = getStageMeta(stage.status);
          const Icon = meta.icon;
          const noteCount = stage._count?.notes ?? 0;

          return (
            <div key={stage.id} className="relative flex items-start gap-4 group">
              {/* Node Icon Circle */}
              <div
                className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${meta.bg} ${meta.ring}`}
              >
                <Icon className="w-7 h-7" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-[10px] font-bold text-stone-600 dark:text-stone-300 flex items-center justify-center shadow-xs">
                  {idx + 1}
                </span>
              </div>

              {/* Stage Info Card */}
              <Link
                href={`/roadmap/${stage.id}`}
                className="flex-1 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-orange-400 dark:hover:border-orange-600 rounded-2xl p-4 shadow-xs transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                  {noteCount > 0 && (
                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-orange-500" />
                      {noteCount} catatan
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {stage.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end text-xs font-semibold text-orange-600 dark:text-orange-400 gap-1">
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP LAYOUT (>= 768px): JALUR ZIGZAG / GAME-LIKE PATH    */}
      {/* ============================================================ */}
      <div className="hidden md:block relative max-w-3xl mx-auto py-8">
        <div className="space-y-12">
          {stages.map((stage, idx) => {
            const meta = getStageMeta(stage.status);
            const Icon = meta.icon;
            const noteCount = stage._count?.notes ?? 0;
            // Posisi zigzag bergantian: Genap di kiri/tengah-kiri, Ganjil di kanan/tengah-kanan
            const isLeft = idx % 2 === 0;

            return (
              <div key={stage.id} className="relative flex flex-col items-center">
                {/* Node & Connector Row */}
                <div
                  className={`w-full flex items-center gap-6 ${
                    isLeft ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Card Section */}
                  <div className="w-1/2">
                    <Link
                      href={`/roadmap/${stage.id}`}
                      className={`block bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-orange-400 dark:hover:border-orange-600 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 group ${
                        isLeft ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-2 ${
                          isLeft ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                        {noteCount > 0 && (
                          <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                            {noteCount} catatan
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {stage.description}
                      </p>

                      <div
                        className={`mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center text-xs font-semibold text-orange-600 dark:text-orange-400 gap-1 ${
                          isLeft ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>Buka Tahap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  </div>

                  {/* Central Node Circle */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Link
                      href={`/roadmap/${stage.id}`}
                      className={`relative z-20 w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${meta.bg} ${meta.ring}`}
                    >
                      <Icon className="w-8 h-8" />
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-2 border-white dark:border-stone-900 text-xs font-extrabold flex items-center justify-center shadow-sm">
                        {idx + 1}
                      </span>
                    </Link>
                  </div>

                  {/* Empty Spacer Counterbalance for 50% width */}
                  <div className="w-1/2" />
                </div>

                {/* Vertical/Curved Connector Line to Next Node */}
                {idx < stages.length - 1 && (
                  <div className="w-1 h-12 my-2 bg-stone-200 dark:border-stone-800 rounded-full relative overflow-hidden">
                    {stage.status === 'DONE' && (
                      <div className="w-full h-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
