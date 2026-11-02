import { portfolioSchema } from '@/schemas/portfolio';
import { request } from './client';

export const getPortfolio = (signal?: AbortSignal) =>
  request('/portfolio', { schema: portfolioSchema, signal });
