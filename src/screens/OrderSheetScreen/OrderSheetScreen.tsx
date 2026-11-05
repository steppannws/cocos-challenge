import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { DeltaText } from '@/components/DeltaText';
import { ErrorState } from '@/components/ErrorState';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useInstruments } from '@/hooks/useInstruments';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useLocale } from '@/hooks/useLocale';
import { usePlaceOrder } from '@/hooks/useOrders';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { RootStackParamList } from '@/navigation/types';
import type { OrderSide, OrderType } from '@/schemas/order';
import { useTheme } from '@/theme';
import { formatMoney, formatPercent } from '@/utils/format';
import { dailyReturn } from '@/utils/portfolio';
import { OrderResult } from './components/OrderResult';
import { OrderSummary } from './components/OrderSummary';
import { QuickPicks } from './components/QuickPicks';
import { useOrderForm } from './hooks/useOrderForm';
import { type OrderFormContext, quickPicks } from './orderForm';
import { useStyles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSheet'>;

export function OrderSheetScreen({ route, navigation }: Props) {
  const { instrumentId, ticker, side: initialSide = 'BUY' } = route.params;
  const { t } = useTranslation();
  const locale = useLocale();
  const isOnline = useIsOnline();
  const { styles } = useStyles();
  const { colors } = useTheme();
  // KeyboardAvoidingView compares its layout frame (relative to the parent) with the keyboard's
  // window position, so it needs the distance from the window top to the parent: the sheet's top
  // offset on iOS, the status bar on Android (edge-to-edge, so adjustResize does nothing). Fabric
  // cannot measure that, but the view ends at the window bottom, right above the bottom inset.
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [avoidingBottom, setAvoidingBottom] = useState(0);

  const instruments = useInstruments();
  const portfolio = usePortfolio();
  const instrument = instruments.data?.find((item) => item.id === instrumentId);
  const holding = portfolio.data?.holdings.find((item) => item.instrumentId === instrumentId);
  const lastPriceCents = instrument?.lastPriceCents ?? holding?.lastPriceCents ?? 0;
  const change = instrument
    ? dailyReturn(instrument.lastPriceCents, instrument.closePriceCents)
    : null;

  // Not memoized: deriveOrder is a few multiplications, and a useMemo here trips the
  // react-hooks lint once ctx is also passed to plain functions (quickPicks, OrderSummary).
  const ctx: OrderFormContext = {
    lastPriceCents,
    availableCashCents: portfolio.data?.cashCents ?? null,
    availableShares: portfolio.data ? (holding?.quantity ?? 0) : null,
  };
  const form = useOrderForm(initialSide, ctx);
  const { values, derived, visibleErrors } = form;
  const placeOrder = usePlaceOrder();

  const sideOptions: readonly SegmentOption<OrderSide>[] = [
    { value: 'BUY', label: t('orders.side.BUY'), tone: 'gain' },
    { value: 'SELL', label: t('orders.side.SELL'), tone: 'loss' },
  ];
  const typeOptions: readonly SegmentOption<OrderType>[] = [
    { value: 'MARKET', label: t('orders.type.MARKET') },
    { value: 'LIMIT', label: t('orders.type.LIMIT') },
  ];

  const canSubmit = derived.isValid && isOnline && lastPriceCents > 0 && !placeOrder.isPending;
  const submit = () => {
    if (!canSubmit) {
      return;
    }
    placeOrder.mutate({
      instrumentId,
      side: values.side,
      type: values.type,
      quantity: derived.quantity,
      priceCents: derived.limitPriceCents ?? undefined,
    });
  };

  const byAmount = values.mode === 'amount';
  const field = byAmount ? 'amount' : 'quantity';
  const picks = quickPicks(values, ctx, derived.unitPriceCents).map((pick) => ({
    ...pick,
    disabled: pick.next === null,
    onPress: () => {
      if (pick.next !== null) {
        form.set(field, pick.next);
      }
    },
  }));

  const availability =
    values.side === 'BUY'
      ? ctx.availableCashCents !== null
        ? t('order.availableCash', { amount: formatMoney(ctx.availableCashCents, locale) })
        : undefined
      : ctx.availableShares !== null
        ? t('order.availableShares', { count: ctx.availableShares })
        : undefined;

  const fieldError = visibleErrors[field];

  return (
    <Screen testID="order-sheet" edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={window.height - insets.bottom - avoidingBottom}
        onLayout={(e) => setAvoidingBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TickerAvatar ticker={ticker} />
            <View style={styles.headerMain}>
              <Text variant="heading" testID="order-title">
                {t('order.title', { ticker })}
              </Text>
              <View style={styles.subtitle}>
                <Text variant="caption" numberOfLines={1}>
                  {t('order.lastPrice', { price: formatMoney(lastPriceCents, locale) })}
                </Text>
                {change !== null ? (
                  <DeltaText
                    value={change}
                    text={formatPercent(change, locale)}
                    variant="captionStrong"
                  />
                ) : null}
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={() => navigation.goBack()}
              style={styles.close}
              testID="order-close"
            >
              <Icon name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {placeOrder.isSuccess ? (
            <OrderResult
              order={placeOrder.data}
              onNewOrder={() => {
                placeOrder.reset();
                form.reset();
              }}
              onDone={() => navigation.goBack()}
            />
          ) : (
            <>
              <View style={styles.controls}>
                <View style={styles.side}>
                  <SegmentedControl
                    pill
                    options={sideOptions}
                    value={values.side}
                    onChange={(side) => form.set('side', side)}
                    testID="order-side"
                  />
                </View>
                <View style={styles.type}>
                  <SegmentedControl
                    pill
                    options={typeOptions}
                    value={values.type}
                    onChange={(type) => form.set('type', type)}
                    testID="order-type"
                  />
                </View>
              </View>

              {values.type === 'LIMIT' ? (
                <TextField
                  label={t('order.priceLabel')}
                  value={values.price}
                  onChangeText={(price) => form.set('price', price)}
                  keyboardType="decimal-pad"
                  error={visibleErrors.price ? t(`order.errors.${visibleErrors.price}`) : undefined}
                  testID="order-price"
                />
              ) : null}

              <View style={styles.amount}>
                <Text variant="caption">
                  {byAmount
                    ? t(values.side === 'BUY' ? 'order.youInvest' : 'order.youSell')
                    : t('order.quantityLabel')}
                </Text>
                <TextInput
                  value={byAmount ? values.amount : values.quantity}
                  onChangeText={(text) => form.set(field, text)}
                  keyboardType={byAmount ? 'decimal-pad' : 'number-pad'}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel={t(byAmount ? 'order.amountLabel' : 'order.quantityLabel')}
                  style={styles.amountInput}
                  testID={byAmount ? 'order-amount' : 'order-quantity'}
                />
                {fieldError ? (
                  <Text variant="caption" color="loss" style={styles.centered}>
                    {t(`order.errors.${fieldError}`)}
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(
                    byAmount ? 'order.switchToQuantity' : 'order.switchToAmount',
                  )}
                  onPress={() => form.set('mode', byAmount ? 'quantity' : 'amount')}
                  style={styles.swap}
                  testID={byAmount ? 'order-mode-quantity' : 'order-mode-amount'}
                >
                  <Text variant="captionStrong" color="gain">
                    {byAmount
                      ? t('order.approxShares', {
                          count: derived.quantity,
                          total: formatMoney(derived.totalCents, locale),
                        })
                      : formatMoney(derived.totalCents, locale)}
                  </Text>
                  <Icon name="swap" size={14} color={colors.gain} />
                </Pressable>
              </View>

              <QuickPicks picks={picks} />
              {availability ? (
                <Text variant="caption" style={styles.centered} testID="order-availability">
                  {availability}
                </Text>
              ) : null}
            </>
          )}
        </ScrollView>
        {/* Outside the scroll view so the total and the button stay visible above the keyboard. */}
        {placeOrder.isSuccess ? null : (
          <View style={styles.footer}>
            <OrderSummary
              values={values}
              derived={derived}
              ctx={ctx}
              formError={visibleErrors.form}
            />

            {placeOrder.isError ? (
              // No idempotency key: after a timeout or dropped connection the server may have
              // the order, so warn before the user sends it twice.
              placeOrder.error instanceof ApiError &&
              (placeOrder.error.kind === 'timeout' || placeOrder.error.kind === 'network') ? (
                <Text
                  variant="caption"
                  color="warning"
                  style={styles.resultText}
                  testID="order-error"
                >
                  {t('order.maybeSent')}
                </Text>
              ) : (
                <ErrorState error={placeOrder.error} testID="order-error" />
              )
            ) : null}
            {!isOnline ? (
              <Text variant="caption" color="warning" style={styles.resultText}>
                {t('order.offline')}
              </Text>
            ) : null}
            <Button
              label={t(`order.submit.${values.side}`)}
              onPress={submit}
              tone={values.side === 'BUY' ? 'gain' : 'loss'}
              disabled={!canSubmit}
              loading={placeOrder.isPending}
              testID="order-submit"
            />
            <Text variant="caption" style={styles.centered}>
              {t(`order.typeHint.${values.type}`)}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
