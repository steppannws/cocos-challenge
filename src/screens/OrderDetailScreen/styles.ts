import { StyleSheet } from 'react-native';
import { makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    headerMain: { flex: 1, gap: spacing.xxs },
    close: {
      padding: spacing.md,
      borderRadius: radii.pill,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
    explanation: { gap: spacing.sm, borderRadius: radii.lg },
    explanationTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    rejected: { backgroundColor: colors.lossMuted },
    pending: { backgroundColor: colors.warningMuted },
    details: { gap: spacing.md, borderRadius: radii.lg },
  }),
);
