import { useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useInstrumentSearch, useInstruments } from '@/hooks/useInstruments';

const DEBOUNCE_MS = 300;

/** The list shows /instruments, or /search results while there is a query. One derived view. */
export function useMarketList() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const isSearching = debounced.length > 0;

  const instruments = useInstruments();
  const search = useInstrumentSearch(debounced);
  const active = isSearching ? search : instruments;

  return {
    query,
    setQuery,
    isSearching,
    searchQuery: debounced,
    items: active.data ?? [],
    isLoading: active.isPending && active.fetchStatus !== 'idle',
    error: active.error,
    refetch: active.refetch,
  };
}
