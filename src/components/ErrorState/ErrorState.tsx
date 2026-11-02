import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { describeError } from '@/utils/errors';
import { styles } from './styles';

type Props = { error: unknown; onRetry?: () => void; testID?: string };

export function ErrorState({ error, onRetry, testID }: Props) {
  const { t } = useTranslation();
  const description = describeError(error);
  const message =
    description.key === 'errors.http' ? t(description.key, description.params) : t(description.key);
  return (
    <View style={styles.container} testID={testID} accessibilityLiveRegion="polite">
      <Text variant="bodyStrong" style={styles.text}>
        {t('common.errorTitle')}
      </Text>
      <Text variant="caption" style={styles.text}>
        {message}
      </Text>
      {onRetry ? (
        <Button label={t('common.retry')} onPress={onRetry} variant="secondary" testID="retry" />
      ) : null}
    </View>
  );
}
