'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Map, Layers } from 'lucide-react';

interface StageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id?: string;
    title: string;
    description: string;
    order: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
  };
}

export const StageModal: React.FC<StageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const isEdit = Boolean(initialData?.id);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'DONE'>(
    initialData?.status || 'NOT_STARTED'
  );
  const [order, setOrder] = useState<number>(initialData?.order ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Judul dan deskripsi wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = isEdit ? `/api/roadmap/${initialData?.id}` : '/api/roadmap';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan tahap roadmap');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kendala jaringan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              {isEdit ? 'Edit Tahap Roadmap' : 'Tambah Tahap Roadmap Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Judul */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Judul Tahap Belajar <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Misal: Fondasi OOP, Service Layer Laravel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Deskripsi Materi / Kriteria <span className="text-orange-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Apa saja topik yang harus dipahami dan dikuasai pada tahap ini?..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Status & Urutan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Status Tahap
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE')
                }
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="NOT_STARTED">Belum Mulai</option>
                <option value="IN_PROGRESS">Sedang Berjalan</option>
                <option value="DONE">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              {isEdit ? 'Simpan Perubahan' : 'Tambah Tahap'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
