'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface NoteFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  selectedMastery: string;
  onMasteryChange: (status: string) => void;
  availableTopics: string[];
}

export const NoteFilter: React.FC<NoteFilterProps> = ({
  search,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  selectedMastery,
  onMasteryChange,
  availableTopics,
}) => {
  return (
    <div className="space-y-3.5 mb-6">
      {/* Search Input & Mastery Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari catatan (judul, isi, konsep)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Mastery Filter Segmented Control */}
        <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => onMasteryChange('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMastery === 'ALL'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => onMasteryChange('MASTER')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMastery === 'MASTER'
                ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Master
          </button>
          <button
            onClick={() => onMasteryChange('STILL_UNSURE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMastery === 'STILL_UNSURE'
                ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Masih Ragu
          </button>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-400 flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Topik:
        </span>
        <button
          onClick={() => onTopicChange('All')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
            selectedTopic === 'All'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          Semua Topik
        </button>
        {availableTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => onTopicChange(topic)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
              selectedTopic === topic
                ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/20'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};
