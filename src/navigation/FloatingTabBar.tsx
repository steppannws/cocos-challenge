import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { spacing, useTheme } from '@/theme';
import { TAB_BAR_HEIGHT, useStyles } from './styles';
import type { TabParamList } from './types';

const icons: Record<keyof TabParamList, IconName> = {
  Portfolio: 'portfolio',
  Market: 'market',
  Orders: 'orders',
  Account: 'account',
};

/** Distance from the bar's bottom edge to the screen bottom. */
const useBarOffset = () => Math.max(useSafeAreaInsets().bottom, spacing.lg);

/** Bottom padding a tab screen's list needs so its last row clears the floating bar. */
export const useTabBarSpace = () => useBarOffset() + TAB_BAR_HEIGHT + spacing.lg;

/** Floating pill: the active tab shows icon and label, the others only the icon. */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const bottom = useBarOffset();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Android resizes the window for the keyboard, which would lift the bar above it.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardOpen) {
    return null;
  }

  return (
    <View style={[styles.bar, { bottom }]}>
      {state.routes.map((route, index) => {
        const options = descriptors[route.key]?.options;
        const label = options?.title ?? route.name;
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            testID={options?.tabBarButtonTestID}
            style={[styles.item, focused && styles.itemFocused]}
          >
            <Icon
              name={icons[route.name as keyof TabParamList]}
              size={22}
              color={focused ? colors.textOnPrimary : colors.textMuted}
            />
            {focused ? (
              <Text variant="captionStrong" color="textOnPrimary">
                {label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
