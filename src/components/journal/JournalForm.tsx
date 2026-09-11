'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';

const MOOD_OPTIONS = [
  { value: 'happy', label: 'Senang', emoji: '😄' },
  { value: 'excited', label: 'Semangat', emoji: '🤩' },
  { value: 'calm', label: 'Tenang', emoji: '😌' },
  { value: 'focused', label: 'Fokus', emoji: '🧠' },
  { value: 'tired', label: 'Lelah', emoji: '😴' },
  { value: 'stressed', label: 'Stres', emoji: '😰' },
  { value: 'sad', label: 'Sedih', emoji: '😢' },
];

export const JournalForm: React.FC = () => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [challenges, setChallenges] = useState('');
  const [mood, setMood] = useState('calm');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Isi jurnal belajar wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), challenges: challenges.trim() || undefined, mood }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan.');
        return;
      }
      setXpEarned(data.xpEarned);
      // brief delay to show XP feedback before navigating back
      setTimeout(() => router.push('/journal'), 1200);
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood picker */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
          Mood hari ini
        </label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMood(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                mood === opt.value
                  ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-300 shadow-sm'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500'
              }`}
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* What I learned */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2"
        >
          Apa yang kamu pelajari hari ini? <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Ceritakan dengan bahasa sendiri — konsep apa yang kamu pahami hari ini, hal baru apa yang kamu temukan..."
          className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-400/50 resize-y"
        />
      </div>

      {/* Challenges */}
      <div>
        <label
          htmlFor="challenges"
          className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2"
        >
          Tantangan atau kebingungan (opsional)
        </label>
        <textarea
          id="challenges"
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          rows={3}
          placeholder="Apa yang masih belum jelas? Hal apa yang ingin kamu dalami lagi?"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-400/50 resize-y"
        />
      </div>

      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-4 py-2.5 rounded-xl">
          {error}
        </p>
      )}

      {xpEarned !== null && (
        <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-4 py-2.5 rounded-xl">
          <span>🎉</span>
          <span>+{xpEarned} XP didapat! Mengalihkan...</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || xpEarned !== null}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Simpan Jurnal
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
};
