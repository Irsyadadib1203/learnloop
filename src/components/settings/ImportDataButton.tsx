'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ImportDataButton: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    stages: number;
    tasks: number;
    notes: number;
    journals: number;
  } | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmImport = confirm(
      '⚠️ PERINGATAN: Proses ini akan menambahkan data dari file backup JSON ke database Anda (data yang belum ada akan dibuat, data yang sudah ada tidak ditimpa). Lanjutkan?'
    );

    if (!confirmImport) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengimpor file.');
        return;
      }

      setResult(data.summary);
    } catch {
      setError('File JSON tidak valid atau terjadi kendala saat memproses file.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-60"
        >
          {importing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-orange-500" />
          )}
          <span>{importing ? 'Mengimpor Data...' : 'Import Data (JSON)'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            Import selesai: +{result.notes} Catatan, +{result.stages} Tahap, +{result.tasks} Sub-tahap, +{result.journals} Jurnal baru ditambahkan.
          </span>
        </div>
      )}
    </div>
  );
};
