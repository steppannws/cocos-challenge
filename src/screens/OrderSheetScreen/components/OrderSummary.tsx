import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useLocale } from '@/hooks/useLocale';
import { formatMoney, formatQuantity } from '@/utils/format';
import { toCents } from '@/utils/money';
import type {
  DerivedOrder,
  OrderFieldErrors,
  OrderFormContext,
  OrderFormValues,
} from '../orderForm';
import { parseDecimal } from '../orderForm';
import { useStyles } from '../styles';

type Props = {
  values: OrderFormValues;
  derived: DerivedOrder;
  ctx: OrderFormContext;
  formError: OrderFieldErrors['form'];
};

/** What the order costs and what is left after it. Every line derives from the form. */
export function OrderSummary({ values, derived, ctx, formError }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { styles } = useStyles();
  const money = (cents: number) => formatMoney(cents, locale);

  const typedAmount = parseDecimal(values.amount);
  const unspentCents =
    values.mode === 'amount' && Number.isFinite(typedAmount) && derived.quantity > 0
      ? toCents(typedAmount) - derived.totalCents
      : 0;
  const after =
    values.side === 'BUY'
      ? ctx.availableCashCents === null
        ? null
        : { label: t('order.cashAfter'), value: money(ctx.availableCashCents - derived.totalCents) }
      : ctx.availableShares === null
        ? null
        : {
            label: t('order.sharesAfter'),
            value: formatQuantity(ctx.availableShares - derived.quantity, locale),
          };

  return (
    <Card style={styles.summary}>
      {derived.quantity > 0 ? (
        <View style={styles.summaryLine}>
          <Text variant="caption">
            {t('order.lineTotal', {
              quantity: formatQuantity(derived.quantity, locale),
              price: money(derived.unitPriceCents),
            })}
          </Text>
          <Text variant="captionStrong">{money(derived.totalCents)}</Text>
        </View>
      ) : null}
      {unspentCents > 0 ? (
        <View style={styles.summaryLine}>
          <Text variant="caption">{t('order.unspent')}</Text>
          <Text variant="captionStrong">{money(unspentCents)}</Text>
        </View>
      ) : null}
      {after && derived.quantity > 0 ? (
        <View style={styles.summaryLine}>
          <Text variant="caption">{after.label}</Text>
          <Text variant="captionStrong">{after.value}</Text>
        </View>
      ) : null}
      {derived.quantity > 0 ? <View style={styles.divider} /> : null}
      <View style={styles.summaryLine}>
        <Text style={styles.totalLabel}>{t('order.estimatedTotal')}</Text>
        <Text variant="bodyStrong" testID="order-total">
          {money(derived.totalCents)}
        </Text>
      </View>
      {formError ? (
        <Text variant="caption" color="loss" testID="order-form-error">
          {t(`order.errors.${formError}`)}
        </Text>
      ) : null}
    </Card>
  );
}
