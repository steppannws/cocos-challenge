import type { PropsWithChildren } from 'react';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useStyles } from './styles';

type Props = PropsWithChildren<{
  testID?: string;
  edges?: readonly Edge[];
  /** Fills the safe area behind the status bar, for screens that start with a colored header. */
  tinted?: boolean;
}>;

// Tab screens: the tab bar owns the bottom inset. Modals pass their own edges.
export function Screen({ children, testID, edges = ['top'], tinted = false }: Props) {
  const styles = useStyles();
  return (
    <SafeAreaView style={[styles.container, tinted && styles.tinted]} edges={edges} testID={testID}>
      <OfflineBanner />
      {children}
    </SafeAreaView>
  );
}
