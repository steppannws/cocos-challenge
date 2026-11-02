import type { PropsWithChildren } from 'react';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import { OfflineBanner } from '@/components/OfflineBanner';
import { styles } from './styles';

type Props = PropsWithChildren<{ testID?: string; edges?: readonly Edge[] }>;

// Tab screens: the tab bar owns the bottom inset. Modals pass their own edges.
export function Screen({ children, testID, edges = ['top'] }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={edges} testID={testID}>
      <OfflineBanner />
      {children}
    </SafeAreaView>
  );
}
