import Config from 'react-native-config';
import { z } from 'zod';

const schema = z.object({
  API_URL: z.url(),
  CANDIDATE_ID: z.string().trim().min(1),
  SENTRY_DSN: z.string().trim().default(''),
});

// Read once at startup: a broken .env fails here, not on the first request.
export const env = schema.parse({
  API_URL: Config.API_URL,
  CANDIDATE_ID: Config.CANDIDATE_ID,
  SENTRY_DSN: Config.SENTRY_DSN,
});
