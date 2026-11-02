import { Component, type ErrorInfo, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { logger } from '@/utils/logger';
import { styles } from './styles';

function Fallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container} testID="error-boundary">
      <Text variant="heading" style={styles.text}>
        {t('common.crashTitle')}
      </Text>
      <Text variant="caption" style={styles.text}>
        {t('common.crashBody')}
      </Text>
      <Button label={t('common.retry')} onPress={onRetry} variant="secondary" />
    </View>
  );
}

type State = { hasError: boolean };

// Root boundary: a render error shows this screen instead of a white screen.
export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error(error, { componentStack: info.componentStack });
  }

  private readonly retry = () => this.setState({ hasError: false });

  render() {
    return this.state.hasError ? <Fallback onRetry={this.retry} /> : this.props.children;
  }
}
