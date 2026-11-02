import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerMain: { flex: 1, gap: spacing.xxs },
  close: { padding: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.surface },
  field: { gap: spacing.sm },
  hint: { paddingHorizontal: spacing.xxs },
  summary: { gap: spacing.xs },
  footer: { gap: spacing.sm },
  result: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  resultText: { textAlign: 'center' },
  resultActions: { width: '100%', gap: spacing.sm, paddingTop: spacing.lg },
});
