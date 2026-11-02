import 'react-native-config';

declare module 'react-native-config' {
  export interface NativeConfig {
    API_URL?: string;
    CANDIDATE_ID?: string;
    SENTRY_DSN?: string;
  }
}
