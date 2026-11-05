import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme';
import { styles } from './styles';

export function LoadingState({ testID }: { testID?: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator color={colors.primary} accessibilityLabel={t('common.loading')} />
    </View>
  );
}
