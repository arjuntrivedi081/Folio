import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminSession } from '../lib/adminSession';

export type RealtimeConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface RealtimeContextType {
  status: RealtimeConnectionStatus;
  isLive: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  status: 'disconnected',
  isLive: false,
});

export const useRealtimeStatus = () => useContext(RealtimeContext);

const MONITORED_COLLECTIONS = [
  'resources',
  'subjects',
  'courses',
  'departments',
  'universities',
  'categories',
] as const;

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminSession();
  const [status, setStatus] = useState<RealtimeConnectionStatus>('disconnected');

  // Network liveness
  useEffect(() => {
    const handleOnline = () => setStatus('connected');
    const handleOffline = () => setStatus('reconnecting');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      setStatus('connected');
    } else {
      setStatus('reconnecting');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time Firestore snapshot listeners
  useEffect(() => {
    const unsubscribes: Unsubscribe[] = [];

    try {
      // 1. Resources listener
      // Non-admins subscribe to published resources; admins subscribe to all resources
      const resourcesQuery = isAdmin
        ? query(collection(db, 'resources'), orderBy('createdAt', 'desc'))
        : query(
            collection(db, 'resources'),
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc')
          );

      let isInitialResources = true;
      const unsubResources = onSnapshot(
        resourcesQuery,
        (snapshot) => {
          if (!snapshot.metadata.fromCache) {
            setStatus('connected');
          }

          if (isInitialResources) {
            isInitialResources = false;
            return;
          }

          // Invalidate React Query caches
          queryClient.invalidateQueries({ queryKey: ['resources'] });
          queryClient.invalidateQueries({ queryKey: ['recent-resources'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['related-resources'] });

          // Dispatch event for UI components listening for live changes
          window.dispatchEvent(
            new CustomEvent('folio:realtime:resources', {
              detail: { docChanges: snapshot.docChanges().map((c) => ({ type: c.type, id: c.doc.id })) },
            })
          );
        },
        (error) => {
          console.warn('Realtime resources listener:', error);
          if (!navigator.onLine) setStatus('reconnecting');
        }
      );
      unsubscribes.push(unsubResources);

      // 2. Taxonomy listeners (subjects, courses, departments)
      const taxonomyCollections = ['subjects', 'courses', 'departments'] as const;
      for (const col of taxonomyCollections) {
        let isInitial = true;
        const unsub = onSnapshot(
          collection(db, col),
          () => {
            if (isInitial) {
              isInitial = false;
              return;
            }
            queryClient.invalidateQueries({ queryKey: ['taxonomy'] });
            queryClient.invalidateQueries({ queryKey: [col] });
            window.dispatchEvent(
              new CustomEvent(`folio:realtime:${col}`, {
                detail: { collection: col },
              })
            );
          },
          (err) => {
            console.warn(`Taxonomy listener ${col}:`, err);
          }
        );
        unsubscribes.push(unsub);
      }
    } catch (err) {
      console.warn('Failed to attach Firestore snapshot listeners:', err);
      setStatus('reconnecting');
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, [isAdmin, queryClient]);

  return (
    <RealtimeContext.Provider
      value={{
        status,
        isLive: status === 'connected',
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export interface UseRealtimeSyncOptions {
  table?: (typeof MONITORED_COLLECTIONS)[number];
  onEvent?: (payload: { eventType: string; new: unknown; old: unknown }) => void;
  enabled?: boolean;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const { table = 'resources', onEvent, enabled = true } = options;

  useEffect(() => {
    if (!enabled || !onEvent) return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      onEvent({
        eventType: 'UPDATE',
        new: customEvent.detail,
        old: null,
      });
    };

    window.addEventListener(`folio:realtime:${table}`, handler);
    return () => {
      window.removeEventListener(`folio:realtime:${table}`, handler);
    };
  }, [table, onEvent, enabled]);
}
