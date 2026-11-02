// Per-candidate data carries the candidate id in its key: switching accounts refetches instead of
// showing another candidate's cache.
export const queryKeys = {
  instruments: ['instruments'] as const,
  search: (query: string) => ['instruments', 'search', query] as const,
  portfolio: (candidateId: string) => ['portfolio', candidateId] as const,
  orders: (candidateId: string) => ['orders', candidateId] as const,
};
