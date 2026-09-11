'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { NoteCard, NoteItem } from '@/components/notes/NoteCard';
import { NoteFilter } from '@/components/notes/NoteFilter';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen } from 'lucide-react';

interface NotesContainerProps {
  initialNotes: NoteItem[];
  initialTopics: string[];
}

export const NotesContainer: React.FC<NotesContainerProps> = ({
  initialNotes,
  initialTopics,
}) => {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [availableTopics] = useState<string[]>(initialTopics);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedMastery, setSelectedMastery] = useState('ALL');

  // Handle delete note
  const handleDeleteNote = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  };

  // Filter notes di client secara instan tanpa fetch ulang
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Filter search
      const matchesSearch =
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        (n.whyImportant && n.whyImportant.toLowerCase().includes(search.toLowerCase()));

      // Filter topic
      const matchesTopic =
        selectedTopic === 'All' || n.topic.toLowerCase() === selectedTopic.toLowerCase();

      // Filter mastery
      const matchesMastery =
        selectedMastery === 'ALL' || n.masteryStatus === selectedMastery;

      return matchesSearch && matchesTopic && matchesMastery;
    });
  }, [notes, search, selectedTopic, selectedMastery]);

  return (
    <div className="space-y-6">
      {/* Filter Component */}
      <NoteFilter
        search={search}
        onSearchChange={setSearch}
        selectedTopic={selectedTopic}
        onTopicChange={setSelectedTopic}
        selectedMastery={selectedMastery}
        onMasteryChange={setSelectedMastery}
        availableTopics={availableTopics}
      />

      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 text-center bg-white/40 dark:bg-stone-900/40">
          <BookOpen className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-700 mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Tidak ada catatan yang cocok
          </h3>
          <p className="text-xs text-stone-400 mt-1 mb-5">
            Coba ubah kata kunci pencarian atau buat catatan baru sekarang.
          </p>
          <Link href="/notes/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Tulis Catatan Baru</span>
            </Button>
          </Link>
        </div>
      ) : (
        /* Note Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))}
        </div>
      )}
    </div>
  );
};
