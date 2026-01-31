import { useState, useCallback } from 'react';
import { journalApi } from '@/services/api';
import type { JournalEntry } from '@/types';

interface Message {
  role: string;
  content: string;
}

interface UseAutoJournalReturn {
  saveToJournal: (messages: Message[], conversationId: string) => Promise<JournalEntry | null>;
  isSaving: boolean;
  error: string | null;
  savedEntry: JournalEntry | null;
}

export const useAutoJournal = (traderId: string | null): UseAutoJournalReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null);

  const saveToJournal = useCallback(async (
    messages: Message[],
    conversationId: string
  ): Promise<JournalEntry | null> => {
    if (!traderId) {
      setError('No trader ID available');
      return null;
    }

    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
      setError('No user messages to save');
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const entry = await journalApi.createJournalEntryFromChat(
        traderId,
        conversationId,
        messages
      );
      setSavedEntry(entry);
      return entry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save journal entry';
      setError(errorMessage);
      console.error('Failed to save journal entry:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [traderId]);

  return {
    saveToJournal,
    isSaving,
    error,
    savedEntry,
  };
};

export default useAutoJournal;
