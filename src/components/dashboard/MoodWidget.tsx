'use client';

import React, { useState } from 'react';
import { Smile } from 'lucide-react';

interface MoodWidgetProps {
  initialMood?: string | null;
}

const MOODS = [
  { id: 'fire', emoji: '🔥', label: 'Semangat' },
  { id: 'calm', emoji: '😊', label: 'Santai' },
  { id: 'tired', emoji: '🥱', label: 'Capek' },
  { id: 'dizzy', emoji: '🤯', label: 'Pusing' },
];

export const MoodWidget: React.FC<MoodWidgetProps> = ({ initialMood = null }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (moodId: string) => {
    if (submitting) return;
    setSelectedMood(moodId);
    setSubmitting(true);

    try {
      await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodId }),
      });
    } catch (e) {
      console.error('Failed to log mood:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
          <Smile className="w-3.5 h-3.5 text-orange-500" />
          Mood Check-in Hari Ini
        </h4>
        {selectedMood && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Tersimpan
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-xs scale-105 ring-2 ring-orange-500/20'
                  : 'border-stone-100 dark:border-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-300'
              }`}
            >
              <span className="text-2xl mb-1 select-none">{m.emoji}</span>
              <span className="text-[11px] font-medium leading-none">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
