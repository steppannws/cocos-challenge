import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getInstruments, searchInstruments } from '@/api/instrumentsApi';
import { queryKeys } from '@/api/queryKeys';

export const useInstruments = () =>
  useQuery({
    queryKey: queryKeys.instruments,
    queryFn: ({ signal }) => getInstruments(signal),
  });

export const useInstrumentSearch = (query: string) =>
  useQuery({
    queryKey: queryKeys.search(query),
    queryFn: ({ signal }) => searchInstruments(query, signal),
    enabled: query.length > 0,
    // Keep the previous results on screen while the next keystroke's query is in flight.
    placeholderData: keepPreviousData,
  });
