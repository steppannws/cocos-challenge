import { View, type ViewProps } from 'react-native';
import { styles } from './styles';

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.card, style]} />;
}
