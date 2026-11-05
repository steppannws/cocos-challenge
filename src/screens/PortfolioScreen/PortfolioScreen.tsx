import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, View } from 'react-native';
import { QueryStateView } from '@/components/QueryStateView';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Text } from '@/components/Text';
import { useInstrumentsById } from '@/hooks/useInstrumentsById';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useRefresh } from '@/hooks/useRefresh';
import type { Holding } from '@/schemas/portfolio';
import { colors } from '@/theme';
import { portfolioAllocation, portfolioTotals } from '@/utils/portfolio';
import { HeaderBand } from './components/HeaderBand';
import { HoldingRow } from './components/HoldingRow';
import { PortfolioSummary } from './components/PortfolioSummary';
import { styles } from './styles';

const keyExtractor = (item: Holding) => String(item.instrumentId);

export function PortfolioScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const portfolio = usePortfolio();
  const instrumentsById = useInstrumentsById();
  const { refreshing, onRefresh } = useRefresh(portfolio.refetch);

  // Everything on this screen derives from the /portfolio response; nothing is stored twice.
  const totals = useMemo(
    () => (portfolio.data ? portfolioTotals(portfolio.data) : null),
    [portfolio.data],
  );
  const allocation = useMemo(
    () => (portfolio.data ? portfolioAllocation(portfolio.data) : []),
    [portfolio.data],
  );
  const holdings = useMemo(
    () => [...(portfolio.data?.holdings ?? [])].sort((a, b) => a.ticker.localeCompare(b.ticker)),
    [portfolio.data],
  );

  const openOrder = useCallback(
    (holding: Holding) =>
      navigation.navigate('OrderSheet', {
        instrumentId: holding.instrumentId,
        ticker: holding.ticker,
        side: 'SELL',
      }),
    [navigation],
  );

  return (
    <Screen testID="portfolio-screen" tinted>
      <FlatList
        data={holdings}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <HoldingRow
            holding={item}
            name={instrumentsById.get(item.instrumentId)?.name}
            onPress={openOrder}
          />
        )}
        ListHeaderComponent={
          <View>
            <HeaderBand>
              <Text variant="title" color="textOnHero" style={styles.bandTitle}>
                {t('portfolio.title')}
              </Text>
            </HeaderBand>
            {totals ? <PortfolioSummary totals={totals} allocation={allocation} /> : null}
            {totals ? (
              <SectionHeader title={t('portfolio.holdings')} detail={String(holdings.length)} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <QueryStateView
            isLoading={portfolio.isPending}
            error={portfolio.error}
            emptyTitle={t('portfolio.empty')}
            emptyHint={t('portfolio.emptyHint')}
            onRetry={portfolio.refetch}
            testID="portfolio-state"
          />
        }
        style={styles.listBackground}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            // iOS spinner sits on the blue band; Android draws its own white disc, so keep it blue.
            tintColor={colors.textOnHero}
            colors={[colors.primary]}
          />
        }
        testID="portfolio-list"
      />
    </Screen>
  );
}
