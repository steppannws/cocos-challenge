import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { DeltaText } from '@/components/DeltaText';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { Instrument } from '@/schemas/instrument';
import { formatMoney, formatPercent } from '@/utils/format';
import { dailyReturn } from '@/utils/portfolio';
import { useStyles } from '../styles';

type Props = { instrument: Instrument; onPress: (instrument: Instrument) => void };

export const InstrumentRow = memo(function InstrumentRow({ instrument, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { rowStyles: styles } = useStyles();
  const change = dailyReturn(instrument.lastPriceCents, instrument.closePriceCents);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('market.openOrder', { ticker: instrument.ticker })}
      onPress={() => onPress(instrument)}
      testID={`instrument-row-${instrument.ticker}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <TickerAvatar ticker={instrument.ticker} />
      <View style={styles.main}>
        <Text variant="bodyStrong">{instrument.ticker}</Text>
        <Text variant="caption" numberOfLines={1}>
          {instrument.name}
        </Text>
      </View>
      <View style={styles.trailing}>
        <Text variant="bodyStrong">{formatMoney(instrument.lastPriceCents, locale)}</Text>
        <DeltaText
          pill
          value={change}
          text={formatPercent(change, locale)}
          variant="captionStrong"
        />
      </View>
    </Pressable>
  );
});
