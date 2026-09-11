'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { NoteCard } from '@/components/notes/NoteCard';
import { StageModal } from '@/components/roadmap/StageModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Map, 
  BookOpen, 
  Plus, 
  Trophy, 
  Flame, 
  Edit3, 
  Trash2, 
  RotateCw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function StageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stage, setStage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [xpCelebration, setXpCelebration] = useState<number | null>(null);

  const fetchStage = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/roadmap/${id}`);
      const data = await res.json();
      if (data.stage) {
        setStage(data.stage);
      }
    } catch (e) {
      console.error('Error fetching stage detail:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStage();
  }, [id]);

  const handleStatusChange = async (newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE') => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/roadmap/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setStage(data.stage);

        // Jika selesai, picu animasi confetti dan tampilkan banner perolehan XP
        if (newStatus === 'DONE' && data.xpAwarded > 0) {
          setXpCelebration(data.xpAwarded);
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // safe fallback
          }
        }
      }
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteStage = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus tahap roadmap ini? Catatan di dalamnya tidak akan terhapus.')) {
      return;
    }

    try {
      const res = await fetch(`/api/roadmap/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/roadmap');
        router.refresh();
      }
    } catch (e) {
      console.error('Error deleting stage:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-400">
        <RotateCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm">Memuat detail tahap roadmap...</p>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Tahap tidak ditemukan</h2>
        <Link href="/roadmap" className="text-orange-600 text-sm mt-3 inline-block font-semibold">
          Kembali ke Roadmap
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header & Back Link */}
      <div>
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Jalur Roadmap
        </Link>

        {/* Celebratory Banner if XP Awarded */}
        {xpCelebration && (
          <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 animate-bounce" />
              <div>
                <h3 className="font-extrabold text-base">Tahap Selesai! 🎉</h3>
                <p className="text-xs text-emerald-100">Selamat! Kamu baru saja memperoleh +{xpCelebration} XP untuk level belajarmu.</p>
              </div>
            </div>
            <button
              onClick={() => setXpCelebration(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                Tahap {stage.order + 1}
              </span>
              <Badge
                variant={
                  stage.status === 'DONE'
                    ? 'master'
                    : stage.status === 'IN_PROGRESS'
                    ? 'topic'
                    : 'default'
                }
              >
                {stage.status === 'DONE'
                  ? 'Selesai'
                  : stage.status === 'IN_PROGRESS'
                  ? 'Sedang Berjalan'
                  : 'Belum Mulai'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {stage.title}
            </h1>
          </div>

          {/* Edit / Delete Stage Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteStage}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Description & Goal Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Fokus Materi & Kriteria Penguasaan
          </h3>
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
            {stage.description}
          </p>
        </div>

        {/* Status Transition Control Buttons */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-stone-500">
            Perbarui Progres Tahap Ini:
          </span>

          <div className="flex items-center gap-2">
            {stage.status !== 'IN_PROGRESS' && stage.status !== 'DONE' && (
              <Button
                variant="outline"
                size="sm"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('IN_PROGRESS')}
              >
                <Flame className="w-3.5 h-3.5 mr-1 text-orange-500" />
                <span>Mulai Belajar</span>
              </Button>
            )}

            {stage.status !== 'DONE' ? (
              <Button
                variant="primary"
                size="sm"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('DONE')}
              >
                <Trophy className="w-3.5 h-3.5 mr-1 text-white" />
                <span>Tandai Selesai (+50 XP)</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={updatingStatus}
                onClick={() => handleStatusChange('IN_PROGRESS')}
              >
                <RotateCw className="w-3.5 h-3.5 mr-1 text-stone-500" />
                <span>Buka Kembali Belajar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Linked Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Catatan Terkait ({stage.notes?.length ?? 0})
            </h2>
          </div>

          <Link href={`/notes/new?stageId=${stage.id}`}>
            <Button variant="outline" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1 text-orange-500" />
              <span>Tulis Catatan untuk Tahap Ini</span>
            </Button>
          </Link>
        </div>

        {(!stage.notes || stage.notes.length === 0) ? (
          <div className="p-10 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 text-center bg-white/40 dark:bg-stone-900/40">
            <BookOpen className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-700 mb-2.5" />
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Belum ada catatan untuk tahap ini
            </h4>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              Tulis catatan dengan bahasa Anda sendiri saat mempelajari materi di tahap ini.
            </p>
            <Link href={`/notes/new?stageId=${stage.id}`}>
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Tulis Catatan Sekarang</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stage.notes.map((note: any) => (
              <NoteCard
                key={note.id}
                note={{
                  ...note,
                  createdAt: note.createdAt,
                  updatedAt: note.updatedAt,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Stage Modal */}
      <StageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchStage}
        initialData={{
          id: stage.id,
          title: stage.title,
          description: stage.description,
          order: stage.order,
          status: stage.status,
        }}
      />
    </div>
  );
}
