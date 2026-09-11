'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Loader2, Info } from 'lucide-react';

export const TelegramSettings: React.FC = () => {
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/telegram')
      .then((res) => res.json())
      .then((data) => {
        if (data.telegramChatId) {
          setChatId(data.telegramChatId);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramChatId: chatId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan.');
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Terjadi kendala jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!chatId.trim()) {
      setError('Masukkan Telegram Chat ID terlebih dahulu.');
      return;
    }

    setError('');
    setTestSuccess(false);
    setTesting(true);

    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramChatId: chatId, test: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengirim pesan tes.');
        return;
      }

      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    } catch {
      setError('Terjadi kendala jaringan.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      {/* Guide Info Box */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-xs text-sky-900 dark:text-sky-200 space-y-2">
        <div className="flex items-center gap-1.5 font-bold">
          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>Cara Mengetahui Chat ID Telegram:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-sky-800 dark:text-sky-300">
          <li>Buka Telegram dan cari bot <strong>@userinfobot</strong></li>
          <li>Kirim pesan apapun atau klik <em>/start</em></li>
          <li>Salin angka <strong>Id</strong> yang diberikan (contoh: <code>123456789</code>)</li>
          <li>Pastikan kamu juga sudah membuka bot LearnLoop dan klik <em>/start</em></li>
        </ol>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Telegram Chat ID
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Contoh: 123456789"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2 rounded-xl">
            {error}
          </p>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Chat ID berhasil disimpan!</span>
          </div>
        )}

        {testSuccess && (
          <div className="flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Pesan tes berhasil terkirim ke Telegram Anda!</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || testing}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-sm shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan Chat ID'}
          </button>

          <button
            type="button"
            onClick={handleTest}
            disabled={loading || testing || !chatId.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-sky-500" />
            )}
            <span>Tes Kirim Pesan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
