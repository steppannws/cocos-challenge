import { View } from 'react-native';
import { Text, type TextProps } from '@/components/Text';
import { styles } from './styles';

type Props = Omit<TextProps, 'color' | 'children'> & {
  /** Sign decides the color; `null` means "no comparison available". */
  value: number | null;
  text: string;
  /** Filled chip (white text on green/red), for the headline change of a row or card. */
  pill?: boolean;
};

export const deltaColor = (value: number | null): 'textMuted' | 'gain' | 'loss' =>
  value === null || value === 0 ? 'textMuted' : value > 0 ? 'gain' : 'loss';

export function DeltaText({ value, text, pill = false, ...rest }: Props) {
  const tone = deltaColor(value);
  if (!pill) {
    return (
      <Text {...rest} color={tone}>
        {text}
      </Text>
    );
  }
  return (
    <View style={[styles.pill, styles[tone]]}>
      <Text {...rest} color={tone === 'textMuted' ? 'textMuted' : 'textOnPrimary'}>
        {text}
      </Text>
    </View>
  );
}
