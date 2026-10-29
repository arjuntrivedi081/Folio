import { useState, useEffect, useCallback } from 'react';
import {
  getLocalBookmarks,
  toggleBookmark as toggleBookmarkService,
} from '../services/bookmarks.service';

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBookmarks = useCallback(() => {
    setLoading(true);
    const saved = getLocalBookmarks();
    setBookmarkedIds(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBookmarks();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'folio_bookmarks_v1') {
        loadBookmarks();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadBookmarks]);

  const toggle = async (resourceId: string): Promise<boolean> => {
    const { bookmarked } = await toggleBookmarkService(resourceId);
    if (bookmarked) {
      setBookmarkedIds((prev) => [...prev, resourceId]);
    } else {
      setBookmarkedIds((prev) => prev.filter((id) => id !== resourceId));
    }
    return bookmarked;
  };

  const isBookmarked = (resourceId: string): boolean => {
    return bookmarkedIds.includes(resourceId);
  };

  return {
    bookmarkedIds,
    isBookmarked,
    toggle,
    loading,
    refetch: loadBookmarks,
  };
}
