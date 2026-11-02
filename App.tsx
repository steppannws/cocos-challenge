import '@/i18n';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistOptions, queryClient } from '@/api/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';
import { initCrashReporting, wrapRoot } from '@/utils/crashReporting';

// Before the first render, so a crash during startup is reported too.
initCrashReporting();

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default wrapRoot(App);
