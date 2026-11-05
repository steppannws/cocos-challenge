import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { DeltaText, deltaColor } from '@/components/DeltaText';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { TickerAvatar } from '@/components/TickerAvatar';
import { useLocale } from '@/hooks/useLocale';
import type { Instrument } from '@/schemas/instrument';
import { useTheme } from '@/theme';
import { formatMoney, formatPercent } from '@/utils/format';
import { useStyles } from '../styles';

type Props = { instrument: Instrument; change: number; onPress: (instrument: Instrument) => void };

export const MoverCard = memo(function MoverCard({ instrument, change, onPress }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { moverStyles: styles } = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('market.openOrder', { ticker: instrument.ticker })}
      onPress={() => onPress(instrument)}
      testID={`mover-${instrument.ticker}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <TickerAvatar ticker={instrument.ticker} />
        <Icon
          name={change >= 0 ? 'trendUp' : 'trendDown'}
          size={18}
          color={colors[deltaColor(change)]}
        />
      </View>
      <Text variant="bodyStrong" numberOfLines={1}>
        {instrument.ticker}
      </Text>
      <View style={styles.bottom}>
        <Text variant="caption" numberOfLines={1}>
          {formatMoney(instrument.lastPriceCents, locale)}
        </Text>
        <DeltaText value={change} text={formatPercent(change, locale)} variant="captionStrong" />
      </View>
    </Pressable>
  );
});
