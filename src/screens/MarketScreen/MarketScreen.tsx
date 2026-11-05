import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { QueryStateView } from '@/components/QueryStateView';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useRefresh } from '@/hooks/useRefresh';
import { Text } from '@/components/Text';
import type { Instrument } from '@/schemas/instrument';
import { colors } from '@/theme';
import { topMovers } from '@/utils/portfolio';
import { InstrumentRow } from './components/InstrumentRow';
import { MoverCard } from './components/MoverCard';
import { useMarketList } from './hooks/useMarketList';
import { moverStyles, styles } from './styles';

const keyExtractor = (item: Instrument) => String(item.id);

export function MarketScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const market = useMarketList();
  const { refreshing, onRefresh } = useRefresh(market.refetch);

  const openOrder = useCallback(
    (instrument: Instrument) => {
      // iOS hands focus back to the search field when the modal closes, and the keyboard then
      // covers the tab bar. Blur it before opening the sheet.
      Keyboard.dismiss();
      navigation.navigate('OrderSheet', { instrumentId: instrument.id, ticker: instrument.ticker });
    },
    [navigation],
  );

  const movers = useMemo(
    () => (market.isSearching ? [] : topMovers(market.items)),
    [market.isSearching, market.items],
  );

  return (
    <Screen testID="market-screen">
      <View style={styles.header}>
        <Text variant="title" testID="market-title">
          {t('market.title')}
        </Text>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={market.query}
            onChangeText={market.setQuery}
            placeholder={t('market.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={t('market.searchPlaceholder')}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="never"
            style={styles.searchInput}
            testID="market-search"
          />
          {market.query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('market.clearSearch')}
              onPress={() => market.setQuery('')}
              style={styles.clear}
              testID="market-search-clear"
            >
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <FlatList
        data={market.items}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <InstrumentRow instrument={item} onPress={openOrder} />}
        ListHeaderComponent={
          movers.length > 0 ? (
            <View>
              <SectionHeader title={t('market.topMovers')} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={moverStyles.list}
                testID="market-movers"
              >
                {movers.map(({ item, change }) => (
                  <MoverCard key={item.id} instrument={item} change={change} onPress={openOrder} />
                ))}
              </ScrollView>
              <SectionHeader title={t('market.allStocks')} detail={String(market.items.length)} />
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <QueryStateView
            isLoading={market.isLoading}
            error={market.error}
            emptyTitle={
              market.isSearching
                ? t('market.noResults', { query: market.searchQuery })
                : t('market.empty')
            }
            onRetry={market.refetch}
            testID="market-state"
          />
        }
        testID="market-list"
      />
    </Screen>
  );
}
