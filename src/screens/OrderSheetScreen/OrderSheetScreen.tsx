import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/api/client';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { Icon } from '@/components/Icon';
import { KeyValueRow } from '@/components/KeyValueRow';
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
import { colors } from '@/theme';
import { formatMoney } from '@/utils/format';
import { OrderResult } from './components/OrderResult';
import { useOrderForm } from './hooks/useOrderForm';
import type { OrderFormContext, OrderMode } from './orderForm';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSheet'>;

export function OrderSheetScreen({ route, navigation }: Props) {
  const { instrumentId, ticker, side: initialSide = 'BUY' } = route.params;
  const { t } = useTranslation();
  const locale = useLocale();
  const isOnline = useIsOnline();
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

  const ctx = useMemo<OrderFormContext>(
    () => ({
      lastPriceCents,
      availableCashCents: portfolio.data?.cashCents ?? null,
      availableShares: portfolio.data ? (holding?.quantity ?? 0) : null,
    }),
    [lastPriceCents, portfolio.data, holding?.quantity],
  );
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
  const modeOptions: readonly SegmentOption<OrderMode>[] = [
    { value: 'quantity', label: t('order.mode.quantity') },
    { value: 'amount', label: t('order.mode.amount') },
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

  const availability =
    values.side === 'BUY'
      ? ctx.availableCashCents !== null
        ? t('order.availableCash', { amount: formatMoney(ctx.availableCashCents, locale) })
        : undefined
      : ctx.availableShares !== null
        ? t('order.availableShares', { count: ctx.availableShares })
        : undefined;

  const errorText = (key: keyof typeof visibleErrors) => {
    const code = visibleErrors[key];
    return code ? t(`order.errors.${code}`) : undefined;
  };

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
              <Text variant="caption" numberOfLines={1}>
                {instrument?.name ?? ''}
                {instrument?.name ? ' · ' : ''}
                {t('order.lastPrice', { price: formatMoney(lastPriceCents, locale) })}
              </Text>
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
              <View style={styles.field}>
                <Text variant="label">{t('order.side')}</Text>
                <SegmentedControl
                  options={sideOptions}
                  value={values.side}
                  onChange={(side) => form.set('side', side)}
                  testID="order-side"
                />
                {availability ? (
                  <Text variant="caption" style={styles.hint} testID="order-availability">
                    {availability}
                  </Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text variant="label">{t('order.type')}</Text>
                <SegmentedControl
                  options={typeOptions}
                  value={values.type}
                  onChange={(type) => form.set('type', type)}
                  testID="order-type"
                />
                <Text variant="caption" style={styles.hint}>
                  {t(`order.typeHint.${values.type}`)}
                </Text>
              </View>

              {values.type === 'LIMIT' ? (
                <TextField
                  label={t('order.priceLabel')}
                  value={values.price}
                  onChangeText={(price) => form.set('price', price)}
                  keyboardType="decimal-pad"
                  error={errorText('price')}
                  testID="order-price"
                />
              ) : null}

              <View style={styles.field}>
                <SegmentedControl
                  options={modeOptions}
                  value={values.mode}
                  onChange={(mode) => form.set('mode', mode)}
                  testID="order-mode"
                />
                {values.mode === 'quantity' ? (
                  <TextField
                    label={t('order.quantityLabel')}
                    value={values.quantity}
                    onChangeText={(quantity) => form.set('quantity', quantity)}
                    keyboardType="number-pad"
                    large
                    placeholder="0"
                    error={errorText('quantity')}
                    testID="order-quantity"
                  />
                ) : (
                  <TextField
                    label={t('order.amountLabel')}
                    value={values.amount}
                    onChangeText={(amount) => form.set('amount', amount)}
                    keyboardType="decimal-pad"
                    large
                    placeholder="0"
                    error={errorText('amount')}
                    hint={
                      derived.quantity > 0
                        ? t('order.maxShares', { count: derived.quantity })
                        : undefined
                    }
                    testID="order-amount"
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
        {/* Outside the scroll view so the total and the button stay visible above the keyboard. */}
        {placeOrder.isSuccess ? null : (
          <View style={styles.footer}>
            <Card style={styles.summary}>
              <KeyValueRow
                label={t('order.estimatedTotal')}
                value={formatMoney(derived.totalCents, locale)}
                testID="order-total"
              />
              {visibleErrors.form ? (
                <Text variant="caption" color="loss" testID="order-form-error">
                  {t(`order.errors.${visibleErrors.form}`)}
                </Text>
              ) : null}
            </Card>

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
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
