import type { NavigatorScreenParams } from '@react-navigation/native';
import type { OrderSide } from '@/schemas/order';

export type TabParamList = {
  Market: undefined;
  Portfolio: undefined;
  Orders: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** Prices and holdings come from the query cache; params stay serializable. */
  OrderSheet: { instrumentId: number; ticker: string; side?: OrderSide };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- React Navigation's typing hook
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation by extension
    interface RootParamList extends RootStackParamList {}
  }
}
