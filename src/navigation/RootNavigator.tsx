import { type BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import { AccountScreen } from '@/screens/AccountScreen';
import { MarketScreen } from '@/screens/MarketScreen';
import { OrderDetailScreen } from '@/screens/OrderDetailScreen';
import { OrderSheetScreen } from '@/screens/OrderSheetScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { PortfolioScreen } from '@/screens/PortfolioScreen';
import { useTheme } from '@/theme';
import { FloatingTabBar } from './FloatingTabBar';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const renderTabBar = (props: BottomTabBarProps) => <FloatingTabBar {...props} />;

function Tabs() {
  const { t } = useTranslation();
  // Tabs mount lazily: keep the PENDING-order poll alive so a fill refreshes Portfolio from any tab.
  useOrders();
  // iOS reads the status bar style from this stack screen (react-native-screens). Portfolio starts
  // with a navy band in both themes, so it always gets light text; the rest follow the theme.
  const navigation = useNavigation();
  const { scheme } = useTheme();
  const [focusedTab, setFocusedTab] = useState<keyof TabParamList>('Portfolio');
  useEffect(() => {
    const light = focusedTab === 'Portfolio' || scheme === 'dark';
    navigation.setOptions({ statusBarStyle: light ? 'light' : 'dark' });
  }, [navigation, scheme, focusedTab]);
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false }}
      screenListeners={({ route }) => ({ focus: () => setFocusedTab(route.name) })}
    >
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          title: t('tabs.portfolio'),
          tabBarButtonTestID: 'tab-portfolio',
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          title: t('tabs.market'),
          tabBarButtonTestID: 'tab-market',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: t('tabs.orders'),
          tabBarButtonTestID: 'tab-orders',
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: t('tabs.account'),
          tabBarButtonTestID: 'tab-account',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { scheme, colors } = useTheme();
  const theme = useMemo<Theme>(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [scheme, colors]);
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // iOS reads the status bar style per screen (react-native-screens).
          statusBarStyle: scheme === 'dark' ? 'light' : 'dark',
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="OrderSheet"
          component={OrderSheetScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
