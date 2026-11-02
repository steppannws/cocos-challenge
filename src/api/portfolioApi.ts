import { portfolioSchema } from '@/schemas/portfolio';
import { request } from './client';

export const getPortfolio = (candidateId: string, signal?: AbortSignal) =>
  request('/portfolio', { schema: portfolioSchema, signal, candidateId });
