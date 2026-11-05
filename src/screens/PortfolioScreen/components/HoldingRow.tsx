import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { DeltaText } from '@/components/DeltaText';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { Holding } from '@/schemas/portfolio';
import { formatMoney, formatPercent } from '@/utils/format';
import { holdingMetrics } from '@/utils/portfolio';
import { useStyles } from '../styles';

type Props = { holding: Holding; onPress: (holding: Holding) => void };

// No company name: ticker and value, then the position, then P&L. Nothing truncates.
export const HoldingRow = memo(function HoldingRow({ holding, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { rowStyles: styles } = useStyles();
  const metrics = holdingMetrics(holding);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('market.openOrder', { ticker: holding.ticker })}
      onPress={() => onPress(holding)}
      testID={`holding-row-${holding.ticker}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <TickerAvatar ticker={holding.ticker} />
      <View style={styles.main}>
        <View style={styles.line}>
          <Text variant="bodyStrong">{holding.ticker}</Text>
          <Text variant="bodyStrong">{formatMoney(metrics.marketValueCents, locale)}</Text>
        </View>
        <Text variant="caption">
          {t('portfolio.position', {
            shares: t('portfolio.shares', { count: holding.quantity }),
            price: formatMoney(holding.avgCostCents, locale),
          })}
        </Text>
        <DeltaText
          value={metrics.pnlCents}
          text={`${formatMoney(metrics.pnlCents, locale, { signed: true })} · ${formatPercent(metrics.returnRatio, locale)}`}
          variant="captionStrong"
        />
      </View>
    </Pressable>
  );
});
