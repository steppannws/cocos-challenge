import '@/i18n';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { initCrashReporting, wrapRoot } from '@/utils/crashReporting';

// Before the first render, so a crash during startup is reported too.
initCrashReporting();

function App() {
  const { t } = useTranslation();
  return (
    <View>
      <Text>{t('app.name')}</Text>
    </View>
  );
}

export default wrapRoot(App);
