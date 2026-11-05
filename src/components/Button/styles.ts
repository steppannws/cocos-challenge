import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((colors) => ({
  styles: StyleSheet.create({
    base: {
      minHeight: 52,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radii.control,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: colors.transparent },
    gain: { backgroundColor: colors.gain },
    loss: { backgroundColor: colors.loss },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.8 },
  }),
  labelStyles: StyleSheet.create({
    primary: { color: colors.textOnPrimary },
    secondary: { color: colors.text },
    ghost: { color: colors.primary },
    gain: { color: colors.onGain },
    loss: { color: colors.onLoss },
  }),
}));
