import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { type Color, useTheme } from '@/theme';
import { type TextVariant, useStyles } from './styles';

export type TextProps = RNTextProps & { variant?: TextVariant; color?: Color };

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <RNText {...rest} style={[styles[variant], color ? { color: colors[color] } : null, style]} />
  );
}
