'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  ExternalLink,
  Plus,
  Trash2,
  ListCheck,
  Loader2,
} from 'lucide-react';

export interface TaskItem {
  id: string;
  stageId: string;
  title: string;
  resourceUrl?: string | null;
  isDone: boolean;
  order: number;
}

interface RoadmapTaskChecklistProps {
  stageId: string;
  initialTasks: TaskItem[];
  onTasksChange?: () => void;
}

export const RoadmapTaskChecklist: React.FC<RoadmapTaskChecklistProps> = ({
  stageId,
  initialTasks,
  onTasksChange,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isDone).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggle = async (task: TaskItem) => {
    const nextState = !task.isDone;
    setTogglingId(task.id);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isDone: nextState } : t))
    );

    try {
      const res = await fetch(`/api/roadmap/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: nextState }),
      });

      if (!res.ok) throw new Error('Update failed');
      onTasksChange?.();
    } catch {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isDone: !nextState } : t))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus task ini?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/roadmap/tasks/${id}`, { method: 'DELETE' });
      onTasksChange?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/roadmap/${stageId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          resourceUrl: newUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.task) {
        setTasks((prev) => [...prev, data.task]);
        setNewTitle('');
        setNewUrl('');
        setShowAddForm(false);
        onTasksChange?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-5">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <ListCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Checklist Sub-Tahap Belajar ({completedTasks}/{totalTasks})
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Centang setiap langkah konkret untuk menyelesaikan tahap ini
          </p>
        </div>

        {/* Mini progress bar */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 min-w-[3rem] text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            Belum ada sub-tahap. Tambahkan langkah belajarmu di bawah ini.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start justify-between gap-3 p-3 rounded-2xl border transition-all group ${
                task.isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-stone-500'
                  : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(task)}
                disabled={togglingId === task.id}
                className="flex items-start gap-3 text-left flex-1"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {task.isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium leading-tight ${
                      task.isDone
                        ? 'line-through text-stone-400 dark:text-stone-500'
                        : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.resourceUrl && (
                    <a
                      href={task.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 block font-normal"
                    >
                      <span>Rujukan Materi</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Hapus task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Form or Button */}
      {showAddForm ? (
        <form
          onSubmit={handleAddTask}
          className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Judul Sub-Tahap / Task
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Baca dokumentasi resmi Service Container"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Link Rujukan Dokumentasi (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors disabled:opacity-60"
            >
              {adding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Tambah Task
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:bg-stone-200/50 dark:hover:bg-stone-700"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline pt-1"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Sub-Tahap Baru</span>
        </button>
      )}
    </div>
  );
};
