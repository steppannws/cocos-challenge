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
import { rowStyles as styles } from '../styles';

type Props = { holding: Holding; name?: string; onPress: (holding: Holding) => void };

export const HoldingRow = memo(function HoldingRow({ holding, name, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
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
        <Text variant="bodyStrong">{holding.ticker}</Text>
        {name ? (
          <Text variant="caption" numberOfLines={1}>
            {name}
          </Text>
        ) : null}
        <Text variant="caption" numberOfLines={1}>
          {t('portfolio.position', {
            shares: t('portfolio.shares', { count: holding.quantity }),
            price: formatMoney(holding.avgCostCents, locale),
          })}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text variant="bodyStrong">{formatMoney(metrics.marketValueCents, locale)}</Text>
        <DeltaText
          pill
          value={metrics.pnlCents}
          text={formatPercent(metrics.returnRatio, locale)}
          variant="captionStrong"
        />
        <DeltaText
          value={metrics.pnlCents}
          text={formatMoney(metrics.pnlCents, locale, { signed: true })}
          variant="caption"
        />
      </View>
    </Pressable>
  );
});
