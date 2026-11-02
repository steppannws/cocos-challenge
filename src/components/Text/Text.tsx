import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors, type Color } from '@/theme';
import { styles, type TextVariant } from './styles';

export type TextProps = RNTextProps & { variant?: TextVariant; color?: Color };

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  return (
    <RNText {...rest} style={[styles[variant], color ? { color: colors[color] } : null, style]} />
  );
}
