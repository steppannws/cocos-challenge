import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Icon, type IconName } from '@/components/Icon';
import { useOrders } from '@/hooks/useOrders';
import { AccountScreen } from '@/screens/AccountScreen';
import { MarketScreen } from '@/screens/MarketScreen';
import { OrderDetailScreen } from '@/screens/OrderDetailScreen';
import { OrderSheetScreen } from '@/screens/OrderSheetScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { PortfolioScreen } from '@/screens/PortfolioScreen';
import { colors } from '@/theme';
import { styles } from './styles';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

type TabIconProps = { color: string; size: number; focused: boolean };
const tabIcon = (name: IconName) =>
  function TabIcon({ color, focused }: TabIconProps) {
    return (
      <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        <Icon name={name} size={22} color={color} />
      </View>
    );
  };
const MarketIcon = tabIcon('market');
const PortfolioIcon = tabIcon('portfolio');
const OrdersIcon = tabIcon('orders');
const AccountIcon = tabIcon('account');

function Tabs() {
  const { t } = useTranslation();
  // Tabs mount lazily: keep the PENDING-order poll alive so a fill refreshes Portfolio from any tab.
  useOrders();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          title: t('tabs.portfolio'),
          tabBarIcon: PortfolioIcon,
          tabBarButtonTestID: 'tab-portfolio',
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          title: t('tabs.market'),
          tabBarIcon: MarketIcon,
          tabBarButtonTestID: 'tab-market',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: t('tabs.orders'),
          tabBarIcon: OrdersIcon,
          tabBarButtonTestID: 'tab-orders',
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: t('tabs.account'),
          tabBarIcon: AccountIcon,
          tabBarButtonTestID: 'tab-account',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
