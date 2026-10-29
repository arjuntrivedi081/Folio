import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mapFirestoreDocToResource } from './resources.service';
import type { EnrichedResource } from '../types/domain';

const LOCAL_STORAGE_KEY = 'folio_bookmarks_v1';

export function getLocalBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Non-blocking
  }
}

export function getBookmarks(): string[] {
  return getLocalBookmarks();
}

export function saveBookmarks(ids: string[]): void {
  saveLocalBookmarks(ids);
}

export async function toggleBookmark(
  resourceId: string
): Promise<{ bookmarked: boolean }> {
  const current = getLocalBookmarks();
  const exists = current.includes(resourceId);
  const updated = exists
    ? current.filter((id) => id !== resourceId)
    : [...current, resourceId];

  saveLocalBookmarks(updated);
  return { bookmarked: !exists };
}

export async function fetchBookmarkedResources(
  bookmarkedIds: string[]
): Promise<EnrichedResource[]> {
  if (bookmarkedIds.length === 0) return [];

  const results: EnrichedResource[] = [];
  for (const id of bookmarkedIds) {
    try {
      const snap = await getDoc(doc(db, 'resources', id));
      if (snap.exists()) {
        results.push(mapFirestoreDocToResource(snap.id, snap.data()));
      }
    } catch {
      // Non-blocking
    }
  }

  return results;
}
