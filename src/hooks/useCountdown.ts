import { useState, useEffect } from 'react';
import type { ExamCountdownItem, StudyShortlistItem } from '../types/domain';

const COUNTDOWNS_STORAGE_KEY = 'folio_exam_countdowns_v1';
const SHORTLIST_STORAGE_KEY = 'folio_study_shortlist_v1';

export function useCountdown() {
  const [countdowns, setCountdowns] = useState<ExamCountdownItem[]>([]);
  const [shortlist, setShortlist] = useState<StudyShortlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawC = localStorage.getItem(COUNTDOWNS_STORAGE_KEY);
      if (rawC) setCountdowns(JSON.parse(rawC));

      const rawS = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      if (rawS) setShortlist(JSON.parse(rawS));
    } catch {
      // Non-blocking fallback
    } finally {
      setLoaded(true);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === COUNTDOWNS_STORAGE_KEY) {
        try {
          const raw = localStorage.getItem(COUNTDOWNS_STORAGE_KEY);
          if (raw) setCountdowns(JSON.parse(raw));
        } catch {}
      } else if (e.key === SHORTLIST_STORAGE_KEY) {
        try {
          const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY);
          if (raw) setShortlist(JSON.parse(raw));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveCountdowns = (items: ExamCountdownItem[]) => {
    setCountdowns(items);
    try {
      localStorage.setItem(COUNTDOWNS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Non-blocking
    }
  };

  const saveShortlist = (items: StudyShortlistItem[]) => {
    setShortlist(items);
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Non-blocking
    }
  };

  const addCountdown = (item: Omit<ExamCountdownItem, 'id' | 'createdAt'>) => {
    const newItem: ExamCountdownItem = {
      ...item,
      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString(),
    };
    saveCountdowns([...countdowns, newItem]);
  };

  const removeCountdown = (id: string) => {
    saveCountdowns(countdowns.filter((c) => c.id !== id));
  };

  const addToShortlist = (
    item: Omit<StudyShortlistItem, 'id' | 'addedAt' | 'reviewed'>
  ) => {
    if (shortlist.some((s) => s.resourceId === item.resourceId)) return;
    const newItem: StudyShortlistItem = {
      ...item,
      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2),
      reviewed: false,
      addedAt: new Date().toISOString(),
    };
    saveShortlist([...shortlist, newItem]);
  };

  const toggleReviewed = (id: string) => {
    saveShortlist(
      shortlist.map((s) => (s.id === id ? { ...s, reviewed: !s.reviewed } : s))
    );
  };

  const removeShortlistItem = (id: string) => {
    saveShortlist(shortlist.filter((s) => s.id !== id));
  };

  return {
    countdowns,
    shortlist,
    loaded,
    addCountdown,
    removeCountdown,
    addToShortlist,
    toggleReviewed,
    removeShortlistItem,
  };
}
