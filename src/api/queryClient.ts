import NetInfo from '@react-native-community/netinfo';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  defaultShouldDehydrateQuery,
  focusManager,
  onlineManager,
  QueryClient,
} from '@tanstack/react-query';
import type { Query } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { storage } from '@/offline/storage';
import { isRetryable } from './client';

const DAY_MS = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Must be at least `maxAge` below, or persisted data is dropped at startup.
      gcTime: 7 * DAY_MS,
      retry: (failureCount, error) => failureCount < 2 && isRetryable(error),
    },
    // Never retry writes: a replayed POST /orders is a second order.
    mutations: { retry: false },
  },
});

// Reads survive restarts and work offline (PRODUCT_BRIEF.md, Backend). Writes are never queued.
export const persistOptions = {
  persister: createSyncStoragePersister({ storage, key: 'cocos.query-cache', throttleTime: 1_000 }),
  maxAge: 7 * DAY_MS,
  buster: 'v1',
  // Search needs the network anyway; persisting every typed term only grows the cache.
  dehydrateOptions: {
    shouldDehydrateQuery: (query: Query) =>
      query.queryKey[1] !== 'search' && defaultShouldDehydrateQuery(query),
  },
};

// isInternetReachable is null while unknown: treat only an explicit false as offline.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) =>
    setOnline(state.isConnected !== false && state.isInternetReachable !== false),
  ),
);

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status) =>
    handleFocus(status === 'active'),
  );
  return () => subscription.remove();
});
