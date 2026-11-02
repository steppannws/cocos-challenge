import { ApiError } from '@/api/client';

type ErrorDescription =
  | { key: 'errors.network' | 'errors.timeout' | 'errors.shape' | 'errors.unknown' }
  | { key: 'errors.http'; params: { status: number; message: string } };

/** Maps any thrown value to a translation key the UI can show. */
export const describeError = (error: unknown): ErrorDescription => {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'network':
        return { key: 'errors.network' };
      case 'timeout':
        return { key: 'errors.timeout' };
      case 'shape':
        return { key: 'errors.shape' };
      case 'http':
        return { key: 'errors.http', params: { status: error.status, message: error.message } };
    }
  }
  return { key: 'errors.unknown' };
};
