import { ActivityIndicator, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useStyles } from './styles';

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
  const { styles, labelStyles } = useStyles();
  const { colors } = useTheme();
  // Buy/sell: a primary button filled with the gain or loss color.
  const toned = variant === 'primary' && tone !== 'default' ? tone : null;
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
        toned && styles[toned],
        inactive && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            toned
              ? toned === 'gain'
                ? colors.onGain
                : colors.onLoss
              : variant === 'primary'
                ? colors.textOnPrimary
                : colors.primary
          }
        />
      ) : (
        <Text variant="bodyStrong" style={toned ? labelStyles[toned] : labelStyles[variant]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
