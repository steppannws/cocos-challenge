import { ActivityIndicator, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { colors } from '@/theme';
import { labelStyles, styles } from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonTone = 'default' | 'gain' | 'loss';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Primary buttons can take the gain/loss color (buy/sell). */
  tone?: ButtonTone;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'default',
  disabled = false,
  loading = false,
  testID,
}: Props) {
  // Disabled while loading: a double tap must not send a second request.
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        variant === 'primary' && tone !== 'default' && styles[tone],
        inactive && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textOnPrimary : colors.primary} />
      ) : (
        <Text variant="bodyStrong" style={labelStyles[variant]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
