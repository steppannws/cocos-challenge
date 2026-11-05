import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/Text';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useStyles } from './styles';

export function OfflineBanner() {
  const styles = useStyles();
  const { t } = useTranslation();
  const isOnline = useIsOnline();
  if (isOnline) {
    return null;
  }
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite" testID="offline-banner">
      <Text variant="captionStrong" color="warning">
        {t('common.offline')}
      </Text>
    </View>
  );
}
