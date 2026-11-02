import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Card } from '@/components/Card';
import { deltaColor } from '@/components/DeltaText';
import { KeyValueRow } from '@/components/KeyValueRow';
import { Text } from '@/components/Text';
import { useLocale } from '@/hooks/useLocale';
import { formatMoney, formatPercent } from '@/utils/format';
import type { PortfolioTotals } from '@/utils/portfolio';
import { styles } from '../styles';

export function PortfolioSummary({ totals }: { totals: PortfolioTotals }) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <Card testID="portfolio-summary">
      <View>
        <Text variant="label">{t('portfolio.totalValue')}</Text>
        <Text variant="display" testID="portfolio-total">
          {formatMoney(totals.totalCents, locale)}
        </Text>
      </View>
      <View style={styles.summaryRows}>
        <KeyValueRow
          label={t('portfolio.cash')}
          value={formatMoney(totals.cashCents, locale)}
          testID="portfolio-cash"
        />
        <KeyValueRow
          label={t('portfolio.invested')}
          value={formatMoney(totals.marketValueCents, locale)}
        />
        <KeyValueRow
          label={t('portfolio.pnl')}
          value={`${formatMoney(totals.pnlCents, locale, { signed: true })} · ${formatPercent(totals.returnRatio, locale)}`}
          valueColor={deltaColor(totals.pnlCents)}
          testID="portfolio-pnl"
        />
      </View>
    </Card>
  );
}
