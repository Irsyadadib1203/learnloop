'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Code2, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  Eye, 
  Edit,
  Map 
} from 'lucide-react';

interface StageOption {
  id: string;
  title: string;
}

interface NoteFormProps {
  initialData?: {
    id?: string;
    title: string;
    topic: string;
    stageId?: string | null;
    content: string;
    whyImportant?: string | null;
    codeExample?: string | null;
    masteryStatus: 'MASTER' | 'STILL_UNSURE';
  };
  defaultStageId?: string;
  isEdit?: boolean;
}

const COMMON_TOPICS = ['Laravel', 'Next.js', 'Golang', 'Tailwind', 'Redis', 'OOP', 'Database'];

export const NoteForm: React.FC<NoteFormProps> = ({
  initialData,
  defaultStageId,
  isEdit = false,
}) => {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [topic, setTopic] = useState(initialData?.topic || 'Laravel');
  const [stageId, setStageId] = useState(initialData?.stageId || defaultStageId || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [whyImportant, setWhyImportant] = useState(initialData?.whyImportant || '');
  const [codeExample, setCodeExample] = useState(initialData?.codeExample || '');
  const [masteryStatus, setMasteryStatus] = useState<'MASTER' | 'STILL_UNSURE'>(
    initialData?.masteryStatus || 'STILL_UNSURE'
  );

  const [stages, setStages] = useState<StageOption[]>([]);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch daftar tahap roadmap untuk pilihan dropdown
  useEffect(() => {
    fetch('/api/roadmap')
      .then((res) => res.json())
      .then((data) => {
        if (data.stages) {
          setStages(data.stages);
        }
      })
      .catch((e) => console.error('Error fetching stages for NoteForm:', e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi catatan wajib diisi!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = isEdit && initialData?.id ? `/api/notes/${initialData.id}` : '/api/notes';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          topic,
          stageId: stageId || null,
          content,
          whyImportant,
          codeExample,
          masteryStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan catatan');
      }

      if (stageId) {
        router.push(`/roadmap/${stageId}`);
      } else {
        router.push('/notes');
      }
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan jaringan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Judul Catatan */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
          Judul Catatan <span className="text-orange-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Misal: Service Layer Pattern di Laravel, Goroutines Concurrency..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
        />
      </div>

      {/* Topik & Kaitkan ke Roadmap Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Topik */}
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
            Topik / Kategori <span className="text-orange-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ketik topik atau pilih di bawah..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          {/* Quick Topic Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_TOPICS.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTopic(t)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                  topic.toLowerCase() === t.toLowerCase()
                    ? 'bg-orange-100 dark:bg-orange-950/60 border-orange-300 text-orange-700 dark:text-orange-300 font-medium'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Roadmap Stage Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1.5 flex items-center gap-1.5">
            <Map className="w-4 h-4 text-orange-500" />
            Kaitkan ke Tahap Roadmap <span className="text-xs text-stone-400 font-normal">(Opsional)</span>
          </label>
          <select
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="">-- Tanpa Tahap Roadmap --</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-400 mt-2">
            Catatan yang dikaitkan akan tampil langsung pada jalur roadmap belajar.
          </p>
        </div>
      </div>

      {/* Tingkat Pemahaman */}
      <div>
        <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
          Tingkat Pemahaman
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMasteryStatus('STILL_UNSURE')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
              masteryStatus === 'STILL_UNSURE'
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400/20 shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Masih Ragu</span>
          </button>
          <button
            type="button"
            onClick={() => setMasteryStatus('MASTER')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
              masteryStatus === 'MASTER'
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-400/20 shadow-xs'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Master</span>
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-2">
          Catatan yang masih ragu akan lebih sering dijadwalkan untuk review di sistem Leitner Box.
        </p>
      </div>

      {/* Isi Catatan (Markdown Editor & Preview) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-orange-500" />
            Isi Catatan (Bahasa Sendiri) <span className="text-orange-500">*</span>
          </label>
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'write'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Edit className="w-3 h-3" /> Tulis
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>
        </div>

        {activeTab === 'write' ? (
          <textarea
            rows={8}
            placeholder="Jelaskan konsep ini dengan analogi atau bahasa Anda sendiri (Mendukung format Markdown: **bold**, - list, `code`, ## heading)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono leading-relaxed transition-all"
          />
        ) : (
          <div className="w-full min-h-[200px] px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 text-sm prose dark:prose-invert max-w-none">
            {content.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <span className="text-stone-400 italic">Belum ada konten untuk di-preview.</span>
            )}
          </div>
        )}
      </div>

      {/* Field Khusus: Kenapa Ini Penting */}
      <div>
        <label className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Kenapa Ini Penting? <span className="text-xs text-stone-400 font-normal">(Opsional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Mengapa konsep ini krusial saat bekerja di real project atau interview? (Misal: 'Menghindari fat controller dan memudahkan unit test')..."
          value={whyImportant}
          onChange={(e) => setWhyImportant(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
      </div>

      {/* Field Khusus: Contoh Kode Yang Pernah Berhasil Dibuat */}
      <div>
        <label className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mb-1.5">
          <Code2 className="w-4 h-4 text-orange-500" />
          Contoh Kode yang Pernah Dibuat Sendiri <span className="text-xs text-stone-400 font-normal">(Opsional)</span>
        </label>
        <textarea
          rows={5}
          placeholder="// Paste snippet kode yang pernah Anda tulis sendiri dan terbukti jalan..."
          value={codeExample}
          onChange={(e) => setCodeExample(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-900 text-stone-100 text-xs font-mono placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
        />
      </div>

      {/* Tombol Aksi */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" variant="primary" isLoading={loading}>
          {isEdit ? 'Simpan Perubahan' : 'Simpan Catatan (+10 XP)'}
        </Button>
      </div>
    </form>
  );
};
