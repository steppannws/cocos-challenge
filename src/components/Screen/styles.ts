import { StyleSheet } from 'react-native';
import { makeStyles } from '@/theme';

export const useStyles = makeStyles((colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    tinted: { backgroundColor: colors.heroTop },
  }),
);
