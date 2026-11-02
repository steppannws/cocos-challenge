import { Text, type TextProps } from '@/components/Text';
import type { Color } from '@/theme';

type Props = Omit<TextProps, 'color' | 'children'> & {
  /** Sign decides the color; `null` means "no comparison available". */
  value: number | null;
  text: string;
};

export const deltaColor = (value: number | null): Color =>
  value === null || value === 0 ? 'textMuted' : value > 0 ? 'gain' : 'loss';

export function DeltaText({ value, text, ...rest }: Props) {
  return (
    <Text {...rest} color={deltaColor(value)}>
      {text}
    </Text>
  );
}
