import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { type PropsWithChildren, useCallback } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/theme';
import { styles } from '../styles';

/** Blue gradient band; the balance card overlaps its bottom edge. */
export function HeaderBand({ children }: PropsWithChildren) {
  const navigation = useNavigation();

  // iOS uses view-controller-based status bar appearance (react-native-screens), so the style is
  // a native-stack option on the Tabs screen; StatusBar covers Android. Light only while focused.
  useFocusEffect(
    useCallback(() => {
      const stack = navigation.getParent();
      stack?.setOptions({ statusBarStyle: 'light' });
      StatusBar.setBarStyle('light-content');
      return () => {
        stack?.setOptions({ statusBarStyle: 'dark' });
        StatusBar.setBarStyle('dark-content');
      };
    }, [navigation]),
  );

  return (
    <View style={styles.band}>
      {/* iOS pull-to-refresh overscrolls above the list: keep that area blue, not the page color. */}
      <View style={styles.bandOverscroll} />
      <Svg
        style={StyleSheet.absoluteFill}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <Defs>
          <LinearGradient id="band" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.heroTop} />
            <Stop offset="1" stopColor={colors.heroBottom} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#band)" />
      </Svg>
      {children}
    </View>
  );
}
