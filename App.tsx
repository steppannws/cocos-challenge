import '@/i18n';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistOptions, queryClient } from '@/api/queryClient';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useTheme } from '@/theme';
import { initCrashReporting, wrapRoot } from '@/utils/crashReporting';

// Before the first render, so a crash during startup is reported too.
initCrashReporting();

function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const { scheme } = useTheme();
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </PersistQueryClientProvider>
        {splashVisible && <AnimatedSplash onHidden={() => setSplashVisible(false)} />}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default wrapRoot(App);
