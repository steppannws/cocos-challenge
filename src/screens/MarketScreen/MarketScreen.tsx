import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { QueryStateView } from '@/components/QueryStateView';
import { Screen } from '@/components/Screen';
import { useRefresh } from '@/hooks/useRefresh';
import { Text } from '@/components/Text';
import type { Instrument } from '@/schemas/instrument';
import { colors } from '@/theme';
import { InstrumentRow } from './components/InstrumentRow';
import { useMarketList } from './hooks/useMarketList';
import { styles } from './styles';

const keyExtractor = (item: Instrument) => String(item.id);

export function MarketScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const market = useMarketList();
  const { refreshing, onRefresh } = useRefresh(market.refetch);

  const openOrder = useCallback(
    (instrument: Instrument) =>
      navigation.navigate('OrderSheet', { instrumentId: instrument.id, ticker: instrument.ticker }),
    [navigation],
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
