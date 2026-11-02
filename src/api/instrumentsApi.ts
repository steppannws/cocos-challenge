import { instrumentListSchema } from '@/schemas/instrument';
import { request } from './client';

export const getInstruments = (signal?: AbortSignal) =>
  request('/instruments', { schema: instrumentListSchema, signal });

export const searchInstruments = (query: string, signal?: AbortSignal) =>
  request(`/search?query=${encodeURIComponent(query)}`, { schema: instrumentListSchema, signal });
