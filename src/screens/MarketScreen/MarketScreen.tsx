import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
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
import { useTabBarSpace } from '@/navigation/FloatingTabBar';
import { useTheme } from '@/theme';
import { topMovers } from '@/utils/portfolio';
import { InstrumentRow } from './components/InstrumentRow';
import { MoverCard } from './components/MoverCard';
import { useMarketList } from './hooks/useMarketList';
import { useStyles } from './styles';

const keyExtractor = (item: Instrument) => String(item.id);

type Direction = 'gainers' | 'losers';
const directions: readonly Direction[] = ['gainers', 'losers'];

export function MarketScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const market = useMarketList();
  const { refreshing, onRefresh } = useRefresh(market.refetch);
  const { styles, moverStyles } = useStyles();
  const { colors } = useTheme();
  const tabBarSpace = useTabBarSpace();
  const [direction, setDirection] = useState<Direction>('gainers');

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
    () => (market.isSearching ? [] : topMovers(market.items, 5, direction)),
    [market.isSearching, market.items, direction],
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
          market.isSearching || market.items.length === 0 ? undefined : (
            <View>
              <View style={styles.moversHeader}>
                <Text variant="heading">{t('market.topMovers')}</Text>
                <View style={styles.toggle} accessibilityRole="radiogroup">
                  {directions.map((value) => {
                    const selected = value === direction;
                    return (
                      <Pressable
                        key={value}
                        accessibilityRole="radio"
                        accessibilityLabel={t(`market.${value}`)}
                        accessibilityState={{ selected, checked: selected }}
                        onPress={() => setDirection(value)}
                        style={[styles.toggleOption, selected && styles.toggleSelected]}
                        testID={`market-movers-${value}`}
                      >
                        <Text variant="captionStrong" color={selected ? 'text' : 'textMuted'}>
                          {t(`market.${value}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
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
          )
        }
        contentContainerStyle={{ paddingBottom: tabBarSpace }}
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
