import * as Sentry from '@sentry/react-native';

type Meta = Record<string, unknown>;

// Dev: console. Release: Sentry breadcrumbs and events (a no-op without a DSN).
export const logger = {
  info(message: string, meta?: Meta): void {
    if (__DEV__) {
      console.log(message, meta ?? '');
      return;
    }
    Sentry.addBreadcrumb({ message, data: meta, level: 'info' });
  },
  warn(message: string, meta?: Meta): void {
    if (__DEV__) {
      console.warn(message, meta ?? '');
      return;
    }
    Sentry.captureMessage(message, { level: 'warning', extra: meta });
  },
  error(error: unknown, meta?: Meta): void {
    if (__DEV__) {
      console.error(error, meta ?? '');
    }
    Sentry.captureException(error, { extra: meta });
  },
};
