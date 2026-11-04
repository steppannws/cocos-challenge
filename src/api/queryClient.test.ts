import { dehydrate } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { queryKeys } from './queryKeys';

vi.mock('@react-native-community/netinfo', () => ({
  default: { addEventListener: () => () => {} },
}));
vi.mock('react-native', () => ({
  AppState: { addEventListener: () => ({ remove: () => {} }) },
}));
vi.mock('@/offline/storage', () => ({
  storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
}));
// react-native-config ships Flow-typed JS that Node cannot parse.
vi.mock('@/config/env', () => ({
  env: { API_URL: 'https://api.test', CANDIDATE_ID: 'x', SENTRY_DSN: '' },
}));

const { persistOptions, queryClient } = await import('./queryClient');

describe('persistOptions', () => {
  it('persists every successful query except search results', () => {
    queryClient.setQueryData(queryKeys.instruments, []);
    queryClient.setQueryData(queryKeys.search('ggal'), []);
    queryClient.setQueryData(queryKeys.portfolio('alice'), { cashCents: 0, holdings: [] });

    const persisted = dehydrate(queryClient, persistOptions.dehydrateOptions).queries.map(
      (q) => q.queryKey,
    );

    expect(persisted).toEqual([queryKeys.instruments, queryKeys.portfolio('alice')]);
  });
});
