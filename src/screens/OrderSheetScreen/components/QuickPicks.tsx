import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { useLocale } from '@/hooks/useLocale';
import { formatQuantity } from '@/utils/format';
import { useStyles } from '../styles';

export type QuickPick = {
  key: string;
  /** Formatted figure, or `null` for the Max chip. */
  value: number | null;
  /** `+` before the figure: it adds to the field instead of replacing it. */
  increment: boolean;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

/** Row of four chips under the order amount: presets or increments, then Max. */
export function QuickPicks({ picks }: { picks: QuickPick[] }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { styles } = useStyles();
  return (
    <View style={styles.picks}>
      {picks.map((pick) => {
        const label =
          pick.value === null
            ? t('order.max')
            : `${pick.increment ? '+' : ''}${formatQuantity(pick.value, locale)}`;
        return (
          <Pressable
            key={pick.key}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: pick.disabled, selected: pick.selected }}
            disabled={pick.disabled}
            onPress={pick.onPress}
            style={[
              styles.pick,
              pick.selected && styles.pickSelected,
              pick.disabled && styles.pickDisabled,
            ]}
            testID={`order-pick-${pick.key}`}
          >
            <Text variant="captionStrong" color={pick.selected ? 'gain' : 'text'}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
