import { useMemo } from 'react';
import type { Instrument } from '@/schemas/instrument';
import { useInstruments } from './useInstruments';

/** Holdings and orders only carry instrument ids; this joins them with the cached instruments. */
export const useInstrumentsById = (): ReadonlyMap<number, Instrument> => {
  const { data } = useInstruments();
  return useMemo(() => new Map(data?.map((instrument) => [instrument.id, instrument])), [data]);
};
