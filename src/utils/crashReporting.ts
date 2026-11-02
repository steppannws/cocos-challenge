import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';
import { env } from '@/config/env';

const enabled = env.SENTRY_DSN.length > 0;

// Called at launch, before anything renders, so startup crashes are captured too.
export function initCrashReporting(): void {
  if (!enabled) {
    return;
  }
  Sentry.init({ dsn: env.SENTRY_DSN, enabled: !__DEV__, tracesSampleRate: 0 });
}

// Sentry.wrap warns on every start without a DSN, so it only wraps when reporting is on.
export function wrapRoot<P extends Record<string, unknown>>(
  Root: ComponentType<P>,
): ComponentType<P> {
  return enabled ? Sentry.wrap(Root) : Root;
}
