import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

// Tinted chip in light mode; in dark mode the muted tones are transparent, so it reads as text.
export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    pill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radii.pill,
    },
    gain: { backgroundColor: colors.gainMuted },
    loss: { backgroundColor: colors.lossMuted },
    textMuted: { backgroundColor: colors.transparent },
  }),
);
