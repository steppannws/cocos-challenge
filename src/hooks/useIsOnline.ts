import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

// Single source of truth for connectivity: the same manager TanStack Query pauses on.
export const useIsOnline = (): boolean =>
  useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
