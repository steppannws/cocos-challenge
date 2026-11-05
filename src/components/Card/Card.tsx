import { View, type ViewProps } from 'react-native';
import { useStyles } from './styles';

export function Card({ style, ...rest }: ViewProps) {
  const styles = useStyles();
  return <View {...rest} style={[styles.card, style]} />;
}
