import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Card } from '@/components/Card';
import { DeltaText } from '@/components/DeltaText';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { tintFor } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { TabParamList } from '@/navigation/types';
import { type ColorScheme, type Palette, useTheme } from '@/theme';
import { formatMoney, formatPercent } from '@/utils/format';
import type { AllocationSlice, PortfolioTotals } from '@/utils/portfolio';
import { useStyles } from '../styles';

const MASK = '••••••';

const sliceColor = (slice: AllocationSlice, scheme: ColorScheme, colors: Palette) =>
  slice.ticker === null ? colors.surfaceStrong : tintFor(slice.ticker, scheme).foreground;

type Action = { key: string; icon: IconName; label: string; tab: keyof TabParamList };

type Props = { totals: PortfolioTotals; allocation: AllocationSlice[] };

export function PortfolioSummary({ totals, allocation }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigation = useNavigation();
  const { styles } = useStyles();
  const { scheme, colors } = useTheme();
  const [hidden, setHidden] = useState(false);
  const money = (cents: number, signed = false) =>
    hidden ? MASK : formatMoney(cents, locale, { signed });

  // Currency formats always end in two decimals: cents go small and raised, like a price tag.
  const total = formatMoney(totals.totalCents, locale);
  const totalMain = total.slice(0, -2);
  const totalCents = total.slice(-2);

  // Invest picks an instrument in Market; selling starts from a holding row below.
  const actions: Action[] = [
    { key: 'invest', icon: 'plus', label: t('portfolio.actions.invest'), tab: 'Market' },
    { key: 'orders', icon: 'orders', label: t('portfolio.actions.orders'), tab: 'Orders' },
  ];

  return (
    <Card testID="portfolio-summary" style={styles.balanceCard}>
      <View style={styles.balanceTop}>
        <View style={styles.labelRow}>
          <Text variant="caption">{t('portfolio.totalValue')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('portfolio.showBalance') : t('portfolio.hideBalance')}
            onPress={() => setHidden((value) => !value)}
            hitSlop={12}
            style={styles.eye}
            testID="portfolio-toggle-balance"
          >
            <Icon name={hidden ? 'eyeOff' : 'eye'} size={18} color={colors.primary} />
          </Pressable>
        </View>
        {hidden ? (
          <Text
            variant="display"
            accessibilityLabel={t('portfolio.balanceHidden')}
            testID="portfolio-total"
          >
            {MASK}
          </Text>
        ) : (
          <View
            style={styles.balanceRow}
            accessible
            accessibilityLabel={total}
            testID="portfolio-total"
          >
            <Text variant="display">{totalMain}</Text>
            <Text variant="heading" style={styles.cents}>
              {totalCents}
            </Text>
          </View>
        )}
        <View style={styles.returnRow}>
          <DeltaText
            pill
            value={totals.pnlCents}
            text={`${money(totals.pnlCents, true)} · ${formatPercent(totals.returnRatio, locale)}`}
            variant="captionStrong"
            testID="portfolio-pnl"
          />
          <Text variant="caption">{t('portfolio.pnl')}</Text>
        </View>
      </View>

      {allocation.length > 0 ? (
        <View style={styles.allocation} testID="portfolio-allocation">
          <View style={styles.allocationBar}>
            {allocation.map((slice) => (
              <View
                key={slice.ticker ?? 'cash'}
                style={[
                  styles.allocationSegment,
                  { flex: slice.share, backgroundColor: sliceColor(slice, scheme, colors) },
                ]}
              />
            ))}
          </View>
          <View style={styles.legend}>
            {allocation.map((slice) => (
              <View key={slice.ticker ?? 'cash'} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: sliceColor(slice, scheme, colors) }]}
                />
                <Text variant="caption">
                  {`${slice.ticker ?? t('portfolio.cash')} ${formatPercent(slice.share, locale, { signed: false })}`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="caption">{t('portfolio.cash')}</Text>
          <Text variant="bodyStrong" testID="portfolio-cash">
            {money(totals.cashCents)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text variant="caption">{t('portfolio.invested')}</Text>
          <Text variant="bodyStrong">{money(totals.marketValueCents)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {actions.map((action, index) => {
          const primary = index === 0;
          return (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => navigation.navigate('Tabs', { screen: action.tab })}
              style={({ pressed }) => [
                styles.action,
                primary ? styles.actionPrimary : styles.actionSecondary,
                pressed && styles.actionPressed,
              ]}
              testID={`portfolio-action-${action.key}`}
            >
              <Icon
                name={action.icon}
                size={18}
                color={primary ? colors.textOnPrimary : colors.primary}
              />
              <Text variant="bodyStrong" color={primary ? 'textOnPrimary' : 'primary'}>
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
