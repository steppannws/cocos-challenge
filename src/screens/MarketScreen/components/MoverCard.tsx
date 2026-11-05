import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { DeltaText } from '@/components/DeltaText';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { Instrument } from '@/schemas/instrument';
import { formatMoney, formatPercent } from '@/utils/format';
import { moverStyles as styles } from '../styles';

type Props = { instrument: Instrument; change: number; onPress: (instrument: Instrument) => void };

export const MoverCard = memo(function MoverCard({ instrument, change, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('market.openOrder', { ticker: instrument.ticker })}
      onPress={() => onPress(instrument)}
      testID={`mover-${instrument.ticker}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <TickerAvatar ticker={instrument.ticker} />
      <Text variant="bodyStrong" numberOfLines={1}>
        {instrument.ticker}
      </Text>
      <Text variant="caption" numberOfLines={1}>
        {formatMoney(instrument.lastPriceCents, locale)}
      </Text>
      <DeltaText pill value={change} text={formatPercent(change, locale)} variant="captionStrong" />
    </Pressable>
  );
});
